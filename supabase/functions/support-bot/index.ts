/**
 * ASPER BEAUTY SHOP — SUPPORT BOT
 * Extracted from the monolithic telegram-bot for dedicated customer support.
 *
 * Webhook:
 *   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/support-bot
 *
 * Required secrets:
 *   SUPPORT_BOT_TOKEN, TELEGRAM_CHAT_ID, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Config ───────────────────────────────────────────────────

const BOT_TOKEN = Deno.env.get("SUPPORT_BOT_TOKEN");
if (!BOT_TOKEN) throw new Error("Missing SUPPORT_BOT_TOKEN");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://vhgwvfedgfmcixhdyttt.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const ADMIN_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") || "";
const SITE_URL = Deno.env.get("SITE_URL") || "https://asperbeautyshop.com";
const BEAUTY_ASSISTANT_URL = `${SUPABASE_URL}/functions/v1/beauty-assistant`;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";
const CLAUDE_MODEL = "claude-sonnet-4-6";
const ASPER_GROUP_ID = Deno.env.get("ASPER_GROUP_ID") || "";

// ─── Brand DNA Visual Tokens ───────────────────────────────────
const BRAND = {
  DIVIDER:  "✦ ─────────────────── ✦",
  MINI_DIV: "◈ ─────── ◈",
  FOOTER:   "\n<i>✦ ASPER.AI · Amman · JOD · Nature Contained.</i>",
  DR_SAMI:  "🔬 <b>Dr. Sami</b>",
  MS_ZAIN:  "✨ <b>Ms. Zain</b>",
  TAGLINE:  "Nature Contained. Intelligence Active.",
};

const SYSTEM_PROMPT = `You are the Asper Beauty Shop AI Concierge — a dual-persona beauty assistant for Jordan's leading pharmacist-curated beauty platform.

You have TWO personas that blend seamlessly:

🔬 **Dr. Sami** — The Clinical Voice
- Evidence-based skincare recommendations
- Ingredient analysis (retinol, niacinamide, hyaluronic acid, etc.)
- Protocol-driven routines backed by dermatological science
- Speaks with medical authority and precision

✨ **Ms. Zain** — The Aesthetic Voice
- Luxury beauty curation and shade matching
- Evening radiance rituals and self-care guidance
- The art of feeling beautiful and confident
- Speaks with warmth, elegance, and personal touch

PLATFORM CONTEXT:
- 10,000+ products from 350+ brands (La Roche-Posay, CeraVe, Vichy, Eucerin, Bioderma, etc.)
- All products are pharmacist-vetted and 100% authentic
- Website: asperbeautyshop.com
- Location: Amman, Jordan — free delivery in Amman
- Currency: JOD (Jordanian Dinar)
- Supports Arabic and English

BEHAVIOR RULES:
- Respond in the same language the user writes in (Arabic or English)
- Keep responses concise for Telegram (under 300 words)
- Recommend specific product types, not made-up product names
- If asked about a product, suggest searching: "Try /search [keyword]"
- Be warm, professional, and genuinely helpful
- Never recommend products outside your catalog scope
- For skin concerns, ask clarifying questions before recommending`;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// In-memory verbose mode per chat (resets on cold start — intentional)
const verboseChats = new Set<string>();

// ─── Conversation Persistence ──────────────────────────────────
// Replaces in-memory Map — survives Edge Function cold starts

const CONVERSATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function getOrCreateConversation(chatId: string): Promise<string> {
  const title = `telegram:${chatId}`;
  const { data } = await supabase
    .from("conversations")
    .select("id")
    .eq("title", title)
    .maybeSingle();

  if (data?.id) {
    // Check TTL: if last message is older than 24h, reset the conversation
    const { data: lastMsg } = await supabase
      .from("messages")
      .select("created_at")
      .eq("conversation_id", data.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastActivity = lastMsg ? new Date(lastMsg.created_at).getTime() : 0;
    if (Date.now() - lastActivity < CONVERSATION_TTL_MS) {
      return data.id as string;
    }
    // Stale — delete (CASCADE removes messages automatically)
    await supabase.from("conversations").delete().eq("id", data.id);
  }

  const { data: created, error: createError } = await supabase
    .from("conversations")
    .insert({ user_id: null, title })
    .select("id")
    .single();

  if (createError) {
    throw new Error(`Failed to create conversation for chat ${chatId}: ${createError.message}`);
  }
  return (created?.id as string) ?? "";
}

async function getHistory(conversationId: string): Promise<Array<{ role: string; content: string }>> {
  const { data } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(12);
  return (data ?? []) as Array<{ role: string; content: string }>;
}

async function appendMessages(
  conversationId: string,
  msgs: Array<{ role: string; content: string }>,
): Promise<void> {
  await supabase
    .from("messages")
    .insert(msgs.map((m) => ({ conversation_id: conversationId, role: m.role, content: m.content })));
}

async function resetConversation(chatId: string): Promise<void> {
  // CASCADE on messages is automatic when conversation is deleted
  await supabase
    .from("conversations")
    .delete()
    .eq("title", `telegram:${chatId}`);
}

// ─── Telegram API ─────────────────────────────────────────────

async function send(chatId: string, text: string, opts: Record<string, unknown> = {}) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...opts }),
  });
  if (!res.ok) {
    // Fallback: send without HTML parse mode
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, ...opts }),
    });
  }
}

async function sendKeyboard(chatId: string, text: string, keyboard: string[][]) {
  await send(chatId, text, {
    reply_markup: {
      keyboard: keyboard.map((row) => row.map((t) => ({ text: t }))),
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  });
}

async function typing(chatId: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  });
}

function isAdmin(chatId: string): boolean {
  return ADMIN_CHAT_ID !== "" && chatId === ADMIN_CHAT_ID;
}

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── Admin Error Alerts ────────────────────────────────────────

async function adminAlert(error: unknown, context: string): Promise<void> {
  if (!ADMIN_CHAT_ID) return;
  const msg = `${BRAND.DIVIDER}\n✦ <b>ASPER.AI · System Alert</b>\n${BRAND.DIVIDER}\n\n<b>Where:</b> ${esc(context)}\n<b>Error:</b> ${esc(String(error)).slice(0, 500)}`;
  try {
    await send(ADMIN_CHAT_ID, msg);
  } catch {
    // Silently ignore — alert itself failing must not cause infinite loops
  }
}

// ─── Group Notify ──────────────────────────────────────────────

async function groupNotify(text: string): Promise<void> {
  if (!ASPER_GROUP_ID) return;
  try {
    await send(ASPER_GROUP_ID, text);
  } catch {
    // Silent on error
  }
}

// ─── 🤖 AI CONCIERGE ─────────────────────────────────────────

async function handleAI(chatId: string, text: string) {
  const convId = await getOrCreateConversation(chatId);
  const history = await getHistory(convId);
  // history already has ≤12 entries (enforced by getHistory limit)

  const currentMessages = [...history, { role: "user", content: text }];
  let reply = "I'm having trouble connecting right now. Please try again.";

  // Try Claude API first, fall back to beauty-assistant (Gemini)
  if (ANTHROPIC_API_KEY) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: currentMessages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const textBlock = data.content?.find((b: Record<string, unknown>) => b.type === "text");
        reply = textBlock?.text || reply;
        await appendMessages(convId, [
          { role: "user", content: text },
          { role: "assistant", content: reply },
        ]);
        const display = verboseChats.has(chatId) ? `${reply}\n\n<i>🧠 ${esc(CLAUDE_MODEL)}</i>` : reply;
        await send(chatId, display);
        return;
      }
      await adminAlert(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`, "Claude API");
    } catch (err) {
      await adminAlert(err, "Claude API");
    }
  }

  // Fallback: beauty-assistant (Gemini)
  try {
    const res = await fetch(BEAUTY_ASSISTANT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: currentMessages }),
    });
    if (res.ok) {
      const data = await res.json();
      reply = data.reply || reply;
      await appendMessages(convId, [
        { role: "user", content: text },
        { role: "assistant", content: reply },
      ]);
    }
  } catch (err) {
    await adminAlert(err, "Fallback AI (beauty-assistant)");
  }
  const display = verboseChats.has(chatId) ? `${reply}\n\n<i>🧠 beauty-assistant (Gemini)</i>` : reply;
  await send(chatId, display);
}

// ─── 🎫 SUPPORT COMMANDS ─────────────────────────────────────

async function cmdTickets(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  const { data } = await supabase
    .from("conversations")
    .select("id, title, created_at")
    .like("title", "telegram:%")
    .order("created_at", { ascending: false })
    .limit(15);

  if (!data?.length) return send(chatId, "🎫 No active conversations.");

  let msg = `${BRAND.DIVIDER}\n◈ <b>SUPPORT TICKETS</b> ◈\n${BRAND.DIVIDER}\n\n`;
  for (const conv of data) {
    const chatRef = conv.title.replace("telegram:", "");
    const date = new Date(conv.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    // Get last message preview
    const { data: lastMsg } = await supabase
      .from("messages")
      .select("content, role")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const preview = lastMsg ? `${lastMsg.role === "user" ? "👤" : "🤖"} ${esc(lastMsg.content.slice(0, 60))}…` : "<i>empty</i>";
    msg += `🎫 <code>${esc(chatRef)}</code> · ${date}\n   ${preview}\n\n`;
  }
  msg += `Reply: <code>/respond &lt;chat-id&gt; &lt;message&gt;</code>`;
  await send(chatId, msg);
}

async function cmdRespond(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  const spaceIdx = args.indexOf(" ");
  if (spaceIdx === -1 || !args) return send(chatId, "💬 Usage: <code>/respond &lt;chat-id&gt; &lt;message&gt;</code>");
  const targetChatId = args.slice(0, spaceIdx);
  const message = args.slice(spaceIdx + 1).trim();
  if (!message) return send(chatId, "❌ Message cannot be empty.");

  await send(targetChatId, `${BRAND.DIVIDER}\n💬 <b>Message from Asper Support</b>\n${BRAND.DIVIDER}\n\n${esc(message)}\n${BRAND.FOOTER}`);
  await send(chatId, `✅ Message sent to <code>${esc(targetChatId)}</code>`);
}

async function cmdPersona(chatId: string, persona: string) {
  const p = persona.toLowerCase();
  if (p === "sami" || p === "dr.sami" || p === "dr sami") {
    await send(chatId, `${BRAND.DR_SAMI} activated.\n\n🔬 I'll focus on clinical dermo-solutions, ingredient analysis, and evidence-based skincare.\n\nAsk me about any skin concern!`);
  } else if (p === "zain" || p === "ms.zain" || p === "ms zain") {
    await send(chatId, `${BRAND.MS_ZAIN} activated.\n\n✨ I'll focus on luxury beauty, shade matching, and self-care rituals.\n\nAsk me about any beauty goal!`);
  } else {
    await send(chatId, "Choose a persona:\n🔬 /persona sami — Clinical voice\n✨ /persona zain — Aesthetic voice");
  }
}

async function cmdTrack(chatId: string, orderId: string) {
  if (!orderId) return send(chatId, "📦 Usage: <code>/track &lt;order-id or phone&gt;</code>");

  // Try by order ID first
  let order: Record<string, unknown> | null = null;
  const { data: byId } = await supabase.from("cod_orders").select("id, customer_name, status, total, delivery_address, created_at").eq("id", orderId).maybeSingle();
  if (byId) {
    order = byId;
  } else {
    // Try by phone
    const { data: byPhone } = await supabase.from("cod_orders").select("id, customer_name, status, total, delivery_address, created_at").eq("customer_phone", orderId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    order = byPhone;
  }

  if (!order) return send(chatId, `❌ No order found for: <code>${esc(orderId)}</code>`);

  const statusEmoji: Record<string, string> = { pending: "⏳", confirmed: "✅", shipped: "🚚", delivered: "📬", cancelled: "🚫" };
  const status = String(order.status || "pending");
  const emoji = statusEmoji[status] || "❓";
  const date = new Date(String(order.created_at)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  let msg = `${BRAND.DIVIDER}\n◈ <b>ORDER TRACKING</b> ◈\n${BRAND.DIVIDER}\n\n`;
  msg += `👤 ${esc(String(order.customer_name || "Customer"))}\n`;
  msg += `${emoji} Status: <b>${status}</b>\n`;
  msg += `💰 Total: <b>${(Number(order.total) || 0).toFixed(2)} JOD</b>\n`;
  msg += `📍 ${esc(String(order.delivery_address || "—").slice(0, 60))}\n`;
  msg += `📅 ${date}\n`;
  msg += BRAND.FOOTER;
  await send(chatId, msg);
}

async function cmdVerbose(chatId: string) {
  if (verboseChats.has(chatId)) {
    verboseChats.delete(chatId);
    await send(chatId, "🔇 <b>Verbose mode OFF</b>");
  } else {
    verboseChats.add(chatId);
    await send(chatId, "🔊 <b>Verbose mode ON</b>\nAI responses will show which model replied.");
  }
}

// ─── Help ─────────────────────────────────────────────────────

function getAdminHelp(): string {
  return `${BRAND.DIVIDER}
◈ <b>SUPPORT BOT — ADMIN HELP</b> ◈
${BRAND.DIVIDER}

🎫 /tickets — View recent support conversations
💬 /respond &lt;chat-id&gt; &lt;msg&gt; — Reply to a customer
🔬 /persona sami — Activate Dr. Sami (clinical)
✨ /persona zain — Activate Ms. Zain (aesthetic)
📦 /track &lt;order-id or phone&gt; — Track an order
🔄 /reset — Clear conversation history
🔊 /verbose — Toggle AI model label
❓ /help — Show this help

<i>Any other text → AI Concierge (Dr. Sami + Ms. Zain)</i>
${BRAND.FOOTER}`;
}

function getCustomerHelp(): string {
  return `${BRAND.DIVIDER}
◈ <b>ASPER BEAUTY — SUPPORT</b> ◈
${BRAND.DIVIDER}

🔬 /persona sami — Clinical skincare voice
✨ /persona zain — Luxury beauty voice
📦 /track &lt;order-id or phone&gt; — Track your order
🔄 /reset — Start a fresh conversation
❓ /help — Show this help

<i>Just type your question and our AI concierge will help!</i>
${BRAND.FOOTER}`;
}

// ─── Main Router ──────────────────────────────────────────────

const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") || "";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Support Bot active.", { status: 200 });
  }

  if (WEBHOOK_SECRET && req.headers.get("x-telegram-bot-api-secret-token") !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 403 });
  }

  try {
    const body = await req.json();
    const message = body?.message;
    if (!message?.text) return new Response("ok", { status: 200 });

    const chatId = String(message.chat.id);
    const text = (message.text || "").trim();
    const lower = text.toLowerCase();

    await typing(chatId);

    // ─── Slash Commands ─────────────────────────────────────
    if (lower === "/start") {
      const welcome = `${BRAND.DIVIDER}\n✦ <b>Welcome to Asper Beauty Support</b> ✦\n${BRAND.DIVIDER}\n\n${BRAND.TAGLINE}\n\nI'm your AI beauty concierge — powered by Dr. Sami & Ms. Zain.\nAsk me anything about skincare, beauty, or your orders!\n${BRAND.FOOTER}`;

      if (isAdmin(chatId)) {
        await sendKeyboard(chatId, welcome, [
          ["🎫 Tickets", "💬 Respond"],
          ["🔬 Dr. Sami", "✨ Ms. Zain"],
          ["🔄 Reset", "❓ Help"],
        ]);
      } else {
        await sendKeyboard(chatId, welcome, [
          ["🔬 Dr. Sami", "✨ Ms. Zain"],
          ["📦 Track Order", "🔄 Reset"],
          ["❓ Help"],
        ]);
      }
      // Notify group about new user
      if (!isAdmin(chatId)) {
        const name = esc(message.from?.first_name || "Unknown");
        await groupNotify(`👋 New support user: <b>${name}</b> (<code>${chatId}</code>)`);
      }
      return new Response("ok", { status: 200 });
    }

    if (lower === "/help" || text === "❓ Help") {
      await send(chatId, isAdmin(chatId) ? getAdminHelp() : getCustomerHelp());
      return new Response("ok", { status: 200 });
    }

    if (lower === "/tickets" || text === "🎫 Tickets") {
      await cmdTickets(chatId);
      return new Response("ok", { status: 200 });
    }

    if (lower.startsWith("/respond ")) {
      await cmdRespond(chatId, text.slice(9).trim());
      return new Response("ok", { status: 200 });
    }

    if (text === "💬 Respond") {
      await send(chatId, "💬 Usage: <code>/respond &lt;chat-id&gt; &lt;message&gt;</code>\n\nUse /tickets to see active conversations first.");
      return new Response("ok", { status: 200 });
    }

    if (lower.startsWith("/persona ")) {
      await cmdPersona(chatId, text.slice(9).trim());
      return new Response("ok", { status: 200 });
    }

    if (text === "🔬 Dr. Sami") {
      await cmdPersona(chatId, "sami");
      return new Response("ok", { status: 200 });
    }

    if (text === "✨ Ms. Zain") {
      await cmdPersona(chatId, "zain");
      return new Response("ok", { status: 200 });
    }

    if (lower.startsWith("/track ")) {
      await cmdTrack(chatId, text.slice(7).trim());
      return new Response("ok", { status: 200 });
    }

    if (text === "📦 Track Order") {
      await send(chatId, "📦 Usage: <code>/track &lt;order-id or phone&gt;</code>");
      return new Response("ok", { status: 200 });
    }

    if (lower === "/reset" || text === "🔄 Reset") {
      await resetConversation(chatId);
      await send(chatId, "🔄 <b>Conversation reset.</b>\n\nFresh start — ask me anything!");
      return new Response("ok", { status: 200 });
    }

    if (lower === "/verbose") {
      await cmdVerbose(chatId);
      return new Response("ok", { status: 200 });
    }

    // ─── Default: AI Concierge ──────────────────────────────
    await handleAI(chatId, text);
    return new Response("ok", { status: 200 });
  } catch (err) {
    await adminAlert(err, "support-bot/main");
    return new Response("ok", { status: 200 });
  }
});
