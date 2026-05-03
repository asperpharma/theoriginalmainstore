/**
 * ASPER BEAUTY SHOP — MARKETING BOT
 * Broadcasts, coupons, announcements, site config, deals, and campaigns.
 *
 * Webhook:
 *   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/marketing-bot
 *
 * Required secrets:
 *   MARKETING_BOT_TOKEN, TELEGRAM_CHAT_ID, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Config ───────────────────────────────────────────────────

const BOT_TOKEN = Deno.env.get("MARKETING_BOT_TOKEN");
if (!BOT_TOKEN) throw new Error("Missing MARKETING_BOT_TOKEN");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://vhgwvfedgfmcixhdyttt.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const ADMIN_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") || "";
const SITE_URL = Deno.env.get("SITE_URL") || "https://asperbeautyshop.com";
const ASPER_GROUP_ID = Deno.env.get("ASPER_GROUP_ID") || "";

// ─── Brand DNA Visual Tokens ───────────────────────────────────
const BRAND = {
  DIVIDER:  "✦ ─────────────────── ✦",
  MINI_DIV: "◈ ─────── ◈",
  FOOTER:   "\n<i>✦ ASPER.AI · Amman · JOD · Nature Contained.</i>",
  MS_ZAIN:  "✨ <b>Ms. Zain</b>",
  TAGLINE:  "Nature Contained. Intelligence Active.",
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// In-memory broadcast drafts (resets on cold start — intentional)
const broadcastDrafts = new Map<string, string>();

// ─── Telegram API ─────────────────────────────────────────────

async function send(chatId: string, text: string, opts: Record<string, unknown> = {}) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...opts }),
  });
  if (!res.ok) {
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

async function adminAlert(error: unknown, context: string): Promise<void> {
  if (!ADMIN_CHAT_ID) return;
  const msg = `${BRAND.DIVIDER}\n✦ <b>ASPER.AI · System Alert</b>\n${BRAND.DIVIDER}\n\n<b>Where:</b> ${esc(context)}\n<b>Error:</b> ${esc(String(error)).slice(0, 500)}`;
  try { await send(ADMIN_CHAT_ID, msg); } catch { /* silent */ }
}

async function groupNotify(text: string): Promise<void> {
  if (!ASPER_GROUP_ID) return;
  try { await send(ASPER_GROUP_ID, text); } catch { /* silent */ }
}

// ─── Keyboard ─────────────────────────────────────────────────

const MARKETING_KEYBOARD = [
  ["📢 Broadcast", "🎟️ Coupon"],
  ["📣 Announce", "⚙️ Site Config"],
  ["💎 Deals", "🏆 Top Sellers"],
  ["🎯 Campaign", "❓ Help"],
];

// ─── 📢 BROADCAST ─────────────────────────────────────────────

async function cmdBroadcast(chatId: string, message: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  if (!message) return send(chatId, "📢 Usage: <code>/broadcast Your message</code>");

  const { count } = await supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true });

  broadcastDrafts.set(chatId, message);
  await send(chatId, `${BRAND.DIVIDER}\n◈ <b>BROADCAST PREVIEW</b> ◈\n${BRAND.DIVIDER}\n\n${esc(message)}\n\n📧 Would reach <b>${count || 0}</b> subscribers.\n\n<i>To send: /confirm-broadcast</i>`);
}

async function cmdConfirmBroadcast(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  const draft = broadcastDrafts.get(chatId);
  if (!draft) return send(chatId, "⚠️ No pending broadcast. Use /broadcast &lt;message&gt; first.");

  broadcastDrafts.delete(chatId);

  const { count } = await supabase
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true });

  if (!count) return send(chatId, "📧 No subscribers to send to.");

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ type: "broadcast", message: draft }),
    });
    if (res.ok) {
      await send(chatId, `✅ <b>Broadcast sent!</b>\n📧 Dispatched to <b>${count}</b> subscribers.\n\n<i>${esc(draft.slice(0, 100))}${draft.length > 100 ? "…" : ""}</i>`);
      await groupNotify(`📢 Broadcast sent to <b>${count}</b> subscribers`);
    } else {
      await send(chatId, `⚠️ Broadcast queued (email service returned ${res.status}). Check /health.`);
    }
  } catch (e) {
    await send(chatId, `❌ Broadcast failed: ${esc(String(e).slice(0, 200))}`);
  }
}

async function cmdSubscribers(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");

  const { count: total } = await supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true });
  const today = new Date().toISOString().split("T")[0];
  const { count: todayCount } = await supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).gte("subscribed_at", today);

  const { data: recent } = await supabase
    .from("newsletter_subscribers")
    .select("email, subscribed_at")
    .order("subscribed_at", { ascending: false })
    .limit(5);

  let msg = `${BRAND.DIVIDER}\n◈ <b>NEWSLETTER SUBSCRIBERS</b> ◈\n${BRAND.DIVIDER}\n\n`;
  msg += `📊 Total: <b>${total || 0}</b>\n`;
  msg += `📅 Today: <b>${todayCount || 0}</b>\n\n`;

  if (recent?.length) {
    msg += `<b>Recent:</b>\n`;
    for (const s of recent) {
      msg += `  📧 ${esc(s.email)}\n`;
    }
  }
  await send(chatId, msg);
}

// ─── 🎟️ COUPON ──────────────────────────────────────────────

async function cmdCoupon(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  if (!args) {
    const { data } = await supabase
      .from("site_config")
      .select("key, value")
      .or("key.eq.promo_code,key.eq.promo_discount,key.eq.promo_expires");

    let msg = `🎫 <b>Coupon Management</b>\n\n`;
    if (data?.length) {
      data.forEach(c => { msg += `🔧 <b>${esc(c.key)}</b>: <code>${esc(c.value)}</code>\n`; });
    } else {
      msg += `No active coupons.\n`;
    }
    msg += `\nSet coupon:\n<code>/coupon CODE 20</code> (20% off)\n<code>/coupon off</code> (disable)`;
    await send(chatId, msg);
    return;
  }

  if (args.toLowerCase() === "off") {
    await supabase.from("site_config").delete().eq("key", "promo_code");
    await supabase.from("site_config").delete().eq("key", "promo_discount");
    await supabase.from("site_config").delete().eq("key", "promo_expires");
    await groupNotify(`🎟️ Coupon <b>disabled</b>`);
    return send(chatId, "✅ Coupon disabled.");
  }

  const parts = args.split(" ");
  const code = parts[0].toUpperCase();
  const discount = parseFloat(parts[1] || "0");
  if (!discount || discount <= 0 || discount > 90) return send(chatId, "❌ Discount must be 1-90%.");

  await supabase.from("site_config").upsert({ key: "promo_code", value: code, updated_at: new Date().toISOString() }, { onConflict: "key" });
  await supabase.from("site_config").upsert({ key: "promo_discount", value: String(discount), updated_at: new Date().toISOString() }, { onConflict: "key" });

  await send(chatId, `🎫 <b>Coupon Active</b>\n\nCode: <code>${esc(code)}</code>\nDiscount: <b>${discount}%</b>`);
  await groupNotify(`🎟️ Coupon activated: <code>${esc(code)}</code> — ${discount}% off`);
}

// ─── 📣 ANNOUNCE ─────────────────────────────────────────────

async function cmdAnnounce(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  if (!args) {
    const { data } = await supabase.from("site_config").select("value").eq("key", "announcement").single();
    const current = data?.value || "(none)";
    return send(chatId,
      `📢 <b>Announcement Banner</b>\n\n` +
      `Current: <code>${esc(current)}</code>\n\n` +
      `Set: <code>/announce Your message here</code>\n` +
      `Clear: <code>/announce off</code>`
    );
  }

  if (args.toLowerCase() === "off") {
    await supabase.from("site_config").delete().eq("key", "announcement");
    await groupNotify(`📣 Announcement banner <b>cleared</b>`);
    return send(chatId, "✅ Announcement cleared.");
  }

  await supabase.from("site_config").upsert({ key: "announcement", value: args, updated_at: new Date().toISOString() }, { onConflict: "key" });
  await send(chatId, `📢 <b>Announcement set:</b>\n${esc(args)}`);
  await groupNotify(`📣 Announcement: ${esc(args.slice(0, 100))}`);
}

// ─── ⚙️ SITE CONFIG ─────────────────────────────────────────

async function cmdSiteConfig(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  if (!args) {
    const { data } = await supabase.from("site_config").select("key, value").order("key");
    if (!data?.length) {
      return send(chatId,
        `🎨 <b>Site Config</b>\n\nNo config entries yet.\n\n` +
        `Usage: <code>/site &lt;key&gt; &lt;value&gt;</code>\n\n` +
        `Keys:\n` +
        `• <code>announcement</code> — Top banner text\n` +
        `• <code>hero_title</code> — Hero section title\n` +
        `• <code>hero_subtitle</code> — Hero section subtitle\n` +
        `• <code>free_shipping_min</code> — Min order for free shipping\n` +
        `• <code>promo_code</code> — Active promo code\n` +
        `• <code>promo_discount</code> — Discount percentage\n` +
        `• <code>maintenance</code> — true/false for maintenance mode`
      );
    }

    let msg = `${BRAND.DIVIDER}\n◈ <b>SITE CONFIG</b> ◈\n${BRAND.DIVIDER}\n\n`;
    data.forEach((c) => {
      msg += `🔧 <b>${esc(c.key)}</b>\n   <code>${esc(String(c.value).slice(0, 100))}</code>\n\n`;
    });
    msg += `\nEdit: <code>/site &lt;key&gt; &lt;value&gt;</code>`;
    return send(chatId, msg);
  }

  const spaceIdx = args.indexOf(" ");
  if (spaceIdx === -1) {
    const { data } = await supabase.from("site_config").select("value").eq("key", args).single();
    if (!data) return send(chatId, `❌ Key not found: <code>${esc(args)}</code>`);
    return send(chatId, `🔧 <b>${esc(args)}</b> = <code>${esc(String(data.value))}</code>`);
  }

  const key = args.slice(0, spaceIdx).toLowerCase();
  const value = args.slice(spaceIdx + 1).trim();

  const { error } = await supabase
    .from("site_config")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) return send(chatId, `❌ ${esc(error.message)}`);
  await send(chatId, `✅ <b>${esc(key)}</b> → <code>${esc(value.slice(0, 100))}</code>`);
  await groupNotify(`⚙️ Site config: <b>${esc(key)}</b> updated`);
}

// ─── 💎 DEALS ────────────────────────────────────────────────

async function cmdDeals(chatId: string) {
  const { data } = await supabase
    .from("products")
    .select("title, brand, price, compare_at_price")
    .eq("available", true)
    .not("compare_at_price", "is", null)
    .order("bestseller_rank", { ascending: true, nullsFirst: false })
    .limit(10);

  const deals = (data || []).filter((p) => p.compare_at_price && p.compare_at_price > p.price);

  if (!deals.length) {
    const { data: best } = await supabase
      .from("products")
      .select("title, brand, price")
      .eq("available", true)
      .not("bestseller_rank", "is", null)
      .order("bestseller_rank", { ascending: true })
      .limit(8);

    let msg = `${BRAND.DIVIDER}\n◈ ${BRAND.MS_ZAIN} · <b>FEATURED PRODUCTS</b> ◈\n${BRAND.DIVIDER}\n\n`;
    (best || []).forEach((p, i) => {
      msg += `${i + 1}. ${esc(p.title)}\n   ${esc(p.brand || "—")} — <b>${(p.price || 0).toFixed(2)} JOD</b>\n\n`;
    });
    return send(chatId, msg);
  }

  let msg = `${BRAND.DIVIDER}\n◈ ${BRAND.MS_ZAIN} · <b>ACTIVE DEALS</b> · ${deals.length} ◈\n${BRAND.DIVIDER}\n\n`;
  deals.forEach((p) => {
    const save = ((p.compare_at_price - p.price) / p.compare_at_price * 100).toFixed(0);
    msg += `• ${esc(p.title)}\n`;
    msg += `  🏷️ ${esc(p.brand || "—")}\n`;
    msg += `  <b>${p.price.toFixed(2)} JOD</b> <s>${p.compare_at_price.toFixed(2)}</s> 🔥 ${save}% off\n\n`;
  });
  msg += `🌐 <a href="${SITE_URL}/shop?sale=true">All deals →</a>`;
  await send(chatId, msg);
}

// ─── 🏆 TOP SELLERS ─────────────────────────────────────────

async function cmdTopSellers(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");

  const { data, error } = await supabase.rpc("top_sellers_30d", { p_limit: 15 });

  if (error) return send(chatId, `❌ Query failed: ${esc(error.message)}`);
  if (!data?.length) return send(chatId, "📊 No order data in the last 30 days.");

  let msg = `${BRAND.DIVIDER}\n◈ <b>TOP SELLERS</b> (30 days) ◈\n${BRAND.DIVIDER}\n\n`;
  (data as Array<{ product_name: string; total_sold: number }>).forEach((row, i) => {
    msg += `<b>${i + 1}.</b> ${esc(row.product_name)} — ${row.total_sold} sold\n`;
  });
  msg += BRAND.FOOTER;
  await send(chatId, msg);
}

// ─── 🎯 CAMPAIGN ────────────────────────────────────────────

async function cmdCampaign(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  if (!args) {
    // List active campaigns
    const { data } = await supabase
      .from("site_config")
      .select("key, value")
      .like("key", "campaign_%")
      .order("key");

    if (!data?.length) {
      return send(chatId,
        `🎯 <b>Campaign Manager</b>\n\nNo active campaigns.\n\n` +
        `Create: <code>/campaign &lt;name&gt; &lt;message&gt;</code>\n` +
        `Remove: <code>/campaign off &lt;name&gt;</code>\n\n` +
        `Example: <code>/campaign summer Free shipping on all orders!</code>`
      );
    }

    let msg = `${BRAND.DIVIDER}\n◈ <b>ACTIVE CAMPAIGNS</b> ◈\n${BRAND.DIVIDER}\n\n`;
    data.forEach(c => {
      const name = c.key.replace("campaign_", "");
      msg += `🎯 <b>${esc(name)}</b>\n   ${esc(String(c.value).slice(0, 100))}\n\n`;
    });
    msg += `Remove: <code>/campaign off &lt;name&gt;</code>`;
    return send(chatId, msg);
  }

  // /campaign off <name>
  if (args.toLowerCase().startsWith("off ")) {
    const name = args.slice(4).trim().toLowerCase().replace(/\s+/g, "_");
    const { error } = await supabase.from("site_config").delete().eq("key", `campaign_${name}`);
    if (error) return send(chatId, `❌ ${esc(error.message)}`);
    await groupNotify(`🎯 Campaign <b>${esc(name)}</b> ended`);
    return send(chatId, `✅ Campaign <b>${esc(name)}</b> removed.`);
  }

  // /campaign <name> <message>
  const spaceIdx = args.indexOf(" ");
  if (spaceIdx === -1) return send(chatId, "Usage: <code>/campaign &lt;name&gt; &lt;message&gt;</code>");

  const name = args.slice(0, spaceIdx).toLowerCase().replace(/\s+/g, "_");
  const message = args.slice(spaceIdx + 1).trim();

  const { error } = await supabase
    .from("site_config")
    .upsert({ key: `campaign_${name}`, value: message, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) return send(chatId, `❌ ${esc(error.message)}`);
  await send(chatId, `🎯 <b>Campaign "${esc(name)}" activated</b>\n\n${esc(message)}`);
  await groupNotify(`🎯 Campaign <b>${esc(name)}</b> launched: ${esc(message.slice(0, 80))}`);
}

// ─── ❓ HELP ──────────────────────────────────────────────────

function getMarketingHelp(): string {
  return `${BRAND.DIVIDER}\n◈ <b>MARKETING BOT · Commands</b> ◈\n${BRAND.DIVIDER}\n\n` +
    `📢 <b>Broadcast</b>\n` +
    `  /broadcast &lt;message&gt; — Draft broadcast\n` +
    `  /confirm-broadcast — Send drafted broadcast\n` +
    `  /subscribers — Newsletter stats\n\n` +
    `🎟️ <b>Promotions</b>\n` +
    `  /coupon &lt;code&gt; &lt;%&gt; — Set coupon\n` +
    `  /coupon off — Disable coupon\n` +
    `  /deals — Products on sale\n\n` +
    `📣 <b>Site</b>\n` +
    `  /announce &lt;message&gt; — Set banner\n` +
    `  /announce off — Clear banner\n` +
    `  /site — View/edit site config\n` +
    `  /site &lt;key&gt; &lt;value&gt; — Set config\n\n` +
    `🎯 <b>Campaigns</b>\n` +
    `  /campaign — List campaigns\n` +
    `  /campaign &lt;name&gt; &lt;message&gt; — Create\n` +
    `  /campaign off &lt;name&gt; — Remove\n\n` +
    `🏆 <b>Analytics</b>\n` +
    `  /topsellers — Top products (30d)\n` +
    BRAND.FOOTER;
}

// ─── Router ───────────────────────────────────────────────────

async function handleMessage(chatId: string, text: string) {
  await typing(chatId);

  const lower = text.toLowerCase().trim();
  const parts = lower.split(" ");
  const cmd = parts[0];
  const args = text.slice(cmd.length).trim();

  // Keyboard text mappings
  if (text === "📢 Broadcast") return send(chatId, "📢 Usage: <code>/broadcast Your message here</code>");
  if (text === "🎟️ Coupon") return cmdCoupon(chatId, "");
  if (text === "📣 Announce") return cmdAnnounce(chatId, "");
  if (text === "⚙️ Site Config") return cmdSiteConfig(chatId, "");
  if (text === "💎 Deals") return cmdDeals(chatId);
  if (text === "🏆 Top Sellers") return cmdTopSellers(chatId);
  if (text === "🎯 Campaign") return cmdCampaign(chatId, "");
  if (text === "❓ Help") return send(chatId, getMarketingHelp());

  // Slash commands
  if (cmd === "/start") {
    return sendKeyboard(chatId,
      `${BRAND.DIVIDER}\n◈ <b>ASPER MARKETING BOT</b> ◈\n${BRAND.DIVIDER}\n\n` +
      `${BRAND.TAGLINE}\n\nManage broadcasts, coupons, deals, and campaigns.`,
      MARKETING_KEYBOARD
    );
  }
  if (cmd === "/help") return send(chatId, getMarketingHelp());
  if (cmd === "/broadcast") return cmdBroadcast(chatId, args);
  if (cmd === "/confirm-broadcast") return cmdConfirmBroadcast(chatId);
  if (cmd === "/subscribers") return cmdSubscribers(chatId);
  if (cmd === "/coupon") return cmdCoupon(chatId, args);
  if (cmd === "/announce") return cmdAnnounce(chatId, args);
  if (cmd === "/site") return cmdSiteConfig(chatId, args);
  if (cmd === "/deals") return cmdDeals(chatId);
  if (cmd === "/topsellers") return cmdTopSellers(chatId);
  if (cmd === "/campaign") return cmdCampaign(chatId, args);

  await send(chatId, `Unknown command. Type /help or tap a button below.`);
}

// ─── Serve ────────────────────────────────────────────────────

const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") || "";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("OK");

  if (WEBHOOK_SECRET && req.headers.get("x-telegram-bot-api-secret-token") !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 403 });
  }

  const respond = (chatId: string, text: string) => {
    handleMessage(chatId, text).catch((err) => adminAlert(err, `marketing-bot:${text.slice(0, 30)}`));
    return new Response("OK");
  };

  try {
    const body = await req.json();

    if (body.callback_query) {
      const cb = body.callback_query;
      const chatId = String(cb.message?.chat?.id || cb.from?.id);
      const data = cb.data || "";
      return respond(chatId, data);
    }

    const msg = body.message;
    if (!msg?.text) return new Response("OK");
    const chatId = String(msg.chat.id);
    const text = msg.text.trim();

    return respond(chatId, text);
  } catch (err) {
    await adminAlert(err, "marketing-bot:serve");
    return new Response("OK");
  }
});
