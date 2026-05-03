/**
 * ASPER BEAUTY SHOP — SLACK BOT
 *
 * Slack integration for order management, AI concierge, and admin operations.
 *
 * Required secrets:
 *   SLACK_BOT_TOKEN        — Bot User OAuth Token (xoxb-...)
 *   SLACK_SIGNING_SECRET   — From Slack App > Basic Information
 *   SLACK_ADMIN_CHANNEL    — Channel ID for admin notifications
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Webhook URL:
 *   https://mpcxpydkzvwlflxcujnz.supabase.co/functions/v1/slack-bot
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN");
const SLACK_SIGNING_SECRET = Deno.env.get("SLACK_SIGNING_SECRET");
const SLACK_ADMIN_CHANNEL = Deno.env.get("SLACK_ADMIN_CHANNEL") || "";
const WEBHOOK_SECRET = Deno.env.get("SHOPIFY_WEBHOOK_SECRET") || "";
if (!SLACK_BOT_TOKEN) throw new Error("Missing SLACK_BOT_TOKEN");
if (!SLACK_SIGNING_SECRET) throw new Error("Missing SLACK_SIGNING_SECRET");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://mpcxpydkzvwlflxcujnz.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const BEAUTY_ASSISTANT_URL = `${SUPABASE_URL}/functions/v1/beauty-assistant`;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const conversations = new Map<string, Array<{ role: string; content: string }>>();
const processedEvents = new Set<string>();

// ─── Slack API Helpers ────────────────────────────────────────

async function slackPost(endpoint: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(`https://slack.com/api/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function sendMessage(channel: string, text: string, blocks?: unknown[]): Promise<void> {
  await slackPost("chat.postMessage", {
    channel,
    text,
    blocks,
    unfurl_links: false,
    unfurl_media: false,
  });
}

async function sendEphemeral(channel: string, user: string, text: string): Promise<void> {
  await slackPost("chat.postEphemeral", { channel, user, text });
}

async function addReaction(channel: string, timestamp: string, emoji: string): Promise<void> {
  await slackPost("reactions.add", { channel, timestamp, name: emoji });
}

// ─── Signature Verification ───────────────────────────────────

async function verifySlackSignature(req: Request, body: string): Promise<boolean> {
  const timestamp = req.headers.get("x-slack-request-timestamp");
  const signature = req.headers.get("x-slack-signature");
  if (!timestamp || !signature) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  const sigBasestring = `v0:${timestamp}:${body}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SLACK_SIGNING_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(sigBasestring));
  const mySignature = "v0=" + Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return mySignature === signature;
}

// ─── AI Concierge ─────────────────────────────────────────────

async function askConcierge(userId: string, userMessage: string): Promise<string> {
  const history = conversations.get(userId) || [];
  history.push({ role: "user", content: userMessage });
  if (history.length > 10) history.splice(0, history.length - 10);

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (WEBHOOK_SECRET) headers["x-webhook-secret"] = WEBHOOK_SECRET;

    const res = await fetch(BEAUTY_ASSISTANT_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ messages: history }),
    });
    if (res.ok) {
      const data = await res.json();
      const reply = data.reply || "I'm having trouble right now. Please try again shortly.";
      history.push({ role: "assistant", content: reply });
      conversations.set(userId, history);
      return reply;
    }
  } catch (err) {
    console.error("beauty-assistant error:", err);
  }
  return "I'm having trouble connecting right now. Please try again in a moment.";
}

// ─── Command Handlers ─────────────────────────────────────────

async function cmdOrders(channel: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, count } = await supabase
    .from("cod_orders")
    .select("id, customer_name, total, status, created_at", { count: "exact" })
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false })
    .limit(10);

  if (!data?.length) {
    return sendMessage(channel, "📋 No orders today yet.");
  }

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: `📦 Today's Orders (${count})`, emoji: true },
    },
    { type: "divider" },
    ...data.map((o) => ({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${o.customer_name}*\n💰 ${o.total} JOD · ${o.status}\n\`${o.id.slice(0, 8)}\``,
      },
    })),
  ];

  await sendMessage(channel, `📦 Today's Orders (${count})`, blocks);
}

async function cmdStats(channel: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: ordersToday } = await supabase
    .from("cod_orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  const { data: revenueData } = await supabase
    .from("cod_orders")
    .select("total")
    .gte("created_at", today.toISOString());

  const todayRevenue = (revenueData || []).reduce((sum, o) => sum + (o.total || 0), 0);

  const { count: productsCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("available", true);

  const { count: brandsCount } = await supabase
    .from("brands")
    .select("id", { count: "exact", head: true });

  const { count: leadsCount } = await supabase
    .from("customer_leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: "📊 Asper Beauty Stats", emoji: true },
    },
    { type: "divider" },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Orders Today*\n${ordersToday ?? 0}` },
        { type: "mrkdwn", text: `*Revenue Today*\n${todayRevenue.toFixed(2)} JOD` },
        { type: "mrkdwn", text: `*Active Products*\n${productsCount ?? 0}` },
        { type: "mrkdwn", text: `*Brands*\n${brandsCount ?? 0}` },
        { type: "mrkdwn", text: `*Leads Today*\n${leadsCount ?? 0}` },
      ],
    },
  ];

  await sendMessage(channel, "📊 Asper Beauty Stats", blocks);
}

async function cmdSearch(channel: string, query: string): Promise<void> {
  if (!query) {
    return sendMessage(channel, "Usage: `/search <product name>`");
  }

  const { data } = await supabase
    .from("products")
    .select("id, title, brand, price, available")
    .eq("available", true)
    .ilike("title", `%${query}%`)
    .order("bestseller_rank", { ascending: true, nullsFirst: false })
    .limit(5);

  if (!data?.length) {
    return sendMessage(channel, `🔍 No products found for "${query}"`);
  }

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: `🔍 Search: ${query}`, emoji: true },
    },
    { type: "divider" },
    ...data.map((p) => ({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${p.title}*\n${p.brand || "Unknown"} · ${p.price} JOD`,
      },
    })),
  ];

  await sendMessage(channel, `🔍 Search results for "${query}"`, blocks);
}

async function cmdBrands(channel: string): Promise<void> {
  const { data } = await supabase
    .from("brands")
    .select("id, name, slug")
    .eq("is_elite", true)
    .order("name")
    .limit(20);

  if (!data?.length) {
    return sendMessage(channel, "No elite brands found.");
  }

  const brandList = data.map((b) => `• ${b.name}`).join("\n");
  await sendMessage(channel, `✨ *Elite Brands*\n\n${brandList}`);
}

async function cmdHelp(channel: string): Promise<void> {
  const helpText = `
*🌟 Asper Beauty Slack Bot*

*Commands:*
• \`/orders\` — View today's orders
• \`/stats\` — Sales & inventory stats
• \`/search <query>\` — Search products
• \`/brands\` — List elite brands
• \`/help\` — Show this help

*AI Concierge:*
Just send a message to chat with our beauty AI assistant!

_Powered by ASPER.AI_
`;
  await sendMessage(channel, helpText);
}

// ─── Event Handlers ───────────────────────────────────────────

async function handleMessage(event: Record<string, unknown>): Promise<void> {
  const channel = event.channel as string;
  const user = event.user as string;
  const text = (event.text as string || "").trim();
  const ts = event.ts as string;

  if (!text || event.bot_id) return;

  await addReaction(channel, ts, "eyes");

  const reply = await askConcierge(`slack_${user}`, text);
  await sendMessage(channel, reply);
}

async function handleAppMention(event: Record<string, unknown>): Promise<void> {
  const channel = event.channel as string;
  const user = event.user as string;
  const text = (event.text as string || "").replace(/<@[A-Z0-9]+>/g, "").trim();

  if (!text) {
    return sendMessage(channel, `Hey <@${user}>! Ask me anything about skincare or beauty products.`);
  }

  const reply = await askConcierge(`slack_${user}`, text);
  await sendMessage(channel, reply);
}

async function handleSlashCommand(command: string, text: string, channel: string, userId: string): Promise<Response> {
  const responseUrl = "";

  switch (command) {
    case "/orders":
      await cmdOrders(channel);
      break;
    case "/stats":
      await cmdStats(channel);
      break;
    case "/search":
      await cmdSearch(channel, text);
      break;
    case "/brands":
      await cmdBrands(channel);
      break;
    case "/help":
    case "/asper":
      await cmdHelp(channel);
      break;
    default:
      await sendEphemeral(channel, userId, `Unknown command: ${command}`);
  }

  return new Response("", { status: 200 });
}

// ─── Main Handler ─────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("OK", { status: 200 });
  }

  const body = await req.text();

  if (!(await verifySlackSignature(req, body))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";

  // Handle URL-encoded slash commands
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(body);
    const command = params.get("command") || "";
    const text = params.get("text") || "";
    const channelId = params.get("channel_id") || "";
    const userId = params.get("user_id") || "";

    return handleSlashCommand(command, text, channelId, userId);
  }

  // Handle JSON events
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  // URL verification challenge
  if (payload.type === "url_verification") {
    return new Response(JSON.stringify({ challenge: payload.challenge }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Event callback
  if (payload.type === "event_callback") {
    const event = payload.event as Record<string, unknown>;
    const eventType = event.type as string;
    const eventId = payload.event_id as string;

    // Prevent duplicate processing (Slack retries if no response within 3s)
    if (processedEvents.has(eventId)) {
      return new Response("OK", { status: 200 });
    }
    processedEvents.add(eventId);
    // Limit memory: keep only last 1000 events
    if (processedEvents.size > 1000) {
      const first = processedEvents.values().next().value;
      if (first) processedEvents.delete(first);
    }

    // Fire-and-forget event handling
    (async () => {
      try {
        if (eventType === "message" && !event.subtype) {
          await handleMessage(event);
        } else if (eventType === "app_mention") {
          await handleAppMention(event);
        }
      } catch (err) {
        console.error("Event handler error:", err);
        if (SLACK_ADMIN_CHANNEL) {
          await sendMessage(SLACK_ADMIN_CHANNEL, `⚠️ Slack bot error: ${String(err).slice(0, 200)}`);
        }
      }
    })();

    return new Response("OK", { status: 200 });
  }

  return new Response("OK", { status: 200 });
});
