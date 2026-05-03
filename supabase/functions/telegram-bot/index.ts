/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  ASPER BEAUTY SHOP — TELEGRAM COMMAND CENTER                ║
 * ║  The Magnificent Controller                                  ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║                                                              ║
 * ║  🤖 AI Concierge    — Dr. Sami + Ms. Zain beauty assistant  ║
 * ║  📦 Orders           — Real-time order dashboard             ║
 * ║  📊 Analytics        — Sales, leads, traffic stats           ║
 * ║  🛍️ Catalog          — Products, brands, search              ║
 * ║  🔧 Site Management  — Deploy, sync, health, toggle          ║
 * ║  📢 Marketing        — Broadcast, campaigns, social          ║
 * ║                                                              ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Webhook:
 *   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/telegram-bot
 *
 * Required secrets:
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Config ───────────────────────────────────────────────────

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
if (!BOT_TOKEN) throw new Error("Missing TELEGRAM_BOT_TOKEN");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://vhgwvfedgfmcixhdyttt.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const ADMIN_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") || "";
const SITE_URL = Deno.env.get("SITE_URL") || "https://asperbeautyshop.com";
const BEAUTY_ASSISTANT_URL = `${SUPABASE_URL}/functions/v1/beauty-assistant`;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";
const CLAUDE_MODEL = "claude-sonnet-4-6";
const ENABLE_PROJECT_THREADS = Deno.env.get("ENABLE_PROJECT_THREADS") === "true";
const GITHUB_REPO = Deno.env.get("GITHUB_REPO") || "Asper-Beauty-Shop/asperbeauty.understand-project";
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN") || "";
// AGENTIC_MODE=false → Classic developer terminal (13 commands + inline keyboards)
// default true → shop AI concierge mode
const AGENTIC_MODE = Deno.env.get("AGENTIC_MODE") !== "false";

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
// In-memory CWD per chat for Classic Mode (resets on cold start — intentional)
const cwdMap = new Map<string, string>();
function getCwd(chatId: string): string { return cwdMap.get(chatId) ?? "/"; }
// Pending broadcast drafts (admin only — resets on cold start)
const broadcastDrafts = new Map<string, string>();

// ─── Conversation Persistence ──────────────────────────────────
// Replaces in-memory Map — survives Edge Function cold starts (fixes #46502)


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

  const { data: created } = await supabase
    .from("conversations")
    .insert({ user_id: null, title })
    .select("id")
    .single();
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

// ���������������── Telegram API ─────────────────────────────────────────────

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

function esc(s: string): string {
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

// ─── 📦 ORDERS ───────────────────────────────────────────────

async function cmdOrders(chatId: string) {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("cod_orders")
    .select("id, customer_name, customer_phone, total, status, delivery_address, created_at, items")
    .gte("created_at", today)
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) return send(chatId, `❌ Error: ${esc(error.message)}`);
  if (!data?.length) return send(chatId, "📦 <b>No orders today yet.</b>\n\nWaiting for the first order...");

  const revenue = data.reduce((s, o) => s + (o.total || 0), 0);
  const pending = data.filter((o) => o.status === "pending").length;
  const shipped = data.filter((o) => o.status === "shipped").length;
  const delivered = data.filter((o) => o.status === "delivered").length;

  let msg = `${BRAND.DIVIDER}\n◈ <b>TODAY'S ORDERS</b> · ${data.length} total ◈\n${BRAND.DIVIDER}\n\n`;
  msg += `💰 Revenue: <b>${revenue.toFixed(2)} JOD</b>\n`;
  msg += `⏳ Pending: ${pending}  🚚 Shipped: ${shipped}  ✅ Delivered: ${delivered}\n\n`;

  for (const o of data.slice(0, 8)) {
    const emoji = o.status === "delivered" ? "✅" : o.status === "shipped" ? "🚚" : "⏳";
    const time = new Date(o.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    msg += `${emoji} <b>${esc(o.customer_name || "Customer")}</b>\n`;
    msg += `   📞 ${o.customer_phone || "—"}  💰 ${(o.total || 0).toFixed(2)} JOD\n`;
    msg += `   📍 ${esc((o.delivery_address || "—").slice(0, 40))}\n`;
    msg += `   🕐 ${time}  📋 ${o.status || "pending"}\n\n`;
  }

  if (data.length > 8) msg += `<i>...and ${data.length - 8} more orders</i>`;
  await send(chatId, msg);
}

async function cmdOrderDetail(chatId: string, orderId: string) {
  const { data, error } = await supabase
    .from("cod_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !data) return send(chatId, `❌ Order not found: ${esc(orderId)}`);

  let msg = `${BRAND.DIVIDER}\n◈ <b>ORDER DETAIL</b> ◈\n${BRAND.DIVIDER}\n\n`;
  msg += `🆔 ${data.id}\n`;
  msg += `👤 ${esc(data.customer_name || "—")}\n`;
  msg += `📞 ${data.customer_phone || "—"}\n`;
  msg += `📍 ${esc(data.delivery_address || "—")}\n`;
  msg += `💰 ${(data.total || 0).toFixed(2)} JOD\n`;
  msg += `📋 Status: <b>${data.status || "pending"}</b>\n`;
  msg += `🕐 ${new Date(data.created_at).toLocaleString()}\n`;

  if (data.items && Array.isArray(data.items)) {
    msg += `\n🛍️ <b>Items:</b>\n`;
    for (const item of data.items.slice(0, 10)) {
      const i = item as Record<string, unknown>;
      msg += `  • ${esc(String(i.title || i.name || "Item"))} × ${i.quantity || 1}\n`;
    }
  }

  if (data.driver_name) msg += `\n🚗 Driver: ${esc(data.driver_name)}`;
  if (data.notes) msg += `\n📝 Notes: ${esc(data.notes)}`;

  await send(chatId, msg);
}

async function cmdUpdateOrder(chatId: string, orderId: string, status: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  const valid = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!valid.includes(status)) return send(chatId, `❌ Invalid status. Use: ${valid.join(", ")}`);

  const { error } = await supabase.from("cod_orders").update({ status }).eq("id", orderId);
  if (error) return send(chatId, `❌ ${esc(error.message)}`);
  await send(chatId, `✅ Order ${esc(orderId.slice(0, 8))}... updated to <b>${status}</b>`);
}

// ─── 📊 ANALYTICS ─────────────────────────────────────────────

async function cmdStats(chatId: string) {
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const [todayOrders, weekOrders, monthOrders, products, brands, todayLeads, weekLeads, todayRev, subscribers] = await Promise.all([
    supabase.from("cod_orders").select("id", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("cod_orders").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("cod_orders").select("id", { count: "exact", head: true }).gte("created_at", monthAgo),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("available", true),
    supabase.from("brands").select("id", { count: "exact", head: true }),
    supabase.from("customer_leads").select("id", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("customer_leads").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("cod_orders").select("total").gte("created_at", today),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
  ]);

  const todayRevenue = (todayRev.data || []).reduce((s, o) => s + (o.total || 0), 0);

  let msg = `${BRAND.DIVIDER}\n◈ <b>ASPER BEAUTY DASHBOARD</b> ◈\n${BRAND.DIVIDER}\n\n`;
  msg += `📅 <b>Today</b>\n`;
  msg += `  📦 Orders: <b>${todayOrders.count || 0}</b>\n`;
  msg += `  💰 Revenue: <b>${todayRevenue.toFixed(2)} JOD</b>\n`;
  msg += `  👤 New Leads: <b>${todayLeads.count || 0}</b>\n\n`;
  msg += `📆 <b>This Week</b>\n`;
  msg += `  📦 Orders: <b>${weekOrders.count || 0}</b>\n`;
  msg += `  👤 Leads: <b>${weekLeads.count || 0}</b>\n\n`;
  msg += `📆 <b>This Month</b>\n`;
  msg += `  📦 Orders: <b>${monthOrders.count || 0}</b>\n\n`;
  msg += `🏪 <b>Catalog</b>\n`;
  msg += `  🛍️ Products: <b>${(products.count || 0).toLocaleString()}</b>\n`;
  msg += `  🏷️ Brands: <b>${brands.count || 0}</b>\n`;
  msg += `  📧 Subscribers: <b>${subscribers.count || 0}</b>\n`;
  msg += BRAND.FOOTER;

  await send(chatId, msg);
}

async function cmdLeads(chatId: string) {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("customer_leads")
    .select("email, phone, skin_concern, created_at")
    .gte("created_at", today)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!data?.length) return send(chatId, "👤 No new leads today.");

  let msg = `${BRAND.DIVIDER}\n◈ <b>LEADS TODAY</b> · ${data.length} ◈\n${BRAND.DIVIDER}\n\n`;
  for (const lead of data) {
    msg += `📧 ${esc(lead.email || "—")}\n`;
    msg += `📞 ${lead.phone || "—"}\n`;
    if (lead.skin_concern) msg += `🔬 ${esc(lead.skin_concern)}\n`;
    msg += `\n`;
  }
  await send(chatId, msg);
}

// ─── 🛍️ CATALOG ──────────────────────────────────────────────

async function cmdProducts(chatId: string) {
  const { data } = await supabase
    .from("products")
    .select("title, brand, price, bestseller_rank")
    .eq("available", true)
    .not("bestseller_rank", "is", null)
    .order("bestseller_rank", { ascending: true })
    .limit(10);

  if (!data?.length) return send(chatId, "🛍️ No bestseller data.");

  let msg = `${BRAND.DIVIDER}\n◈ <b>BESTSELLERS</b> ◈\n${BRAND.DIVIDER}\n\n`;
  data.forEach((p, i) => {
    msg += `<b>${i + 1}.</b> ${esc(p.title)}\n`;
    msg += `   🏷️ ${esc(p.brand || "—")} — <b>${(p.price || 0).toFixed(2)} JOD</b>\n\n`;
  });
  msg += BRAND.FOOTER;
  await send(chatId, msg);
}

async function cmdSearch(chatId: string, query: string) {
  if (!query) return send(chatId, "🔍 Usage: <code>/search vitamin c serum</code>");

  const { data } = await supabase
    .from("products")
    .select("title, brand, price, primary_concern, image_url")
    .eq("available", true)
    .ilike("title", `%${query}%`)
    .order("bestseller_rank", { ascending: true, nullsFirst: false })
    .limit(8);

  if (!data?.length) {
    // Try brand search
    const { data: brandData } = await supabase
      .from("products")
      .select("title, brand, price")
      .eq("available", true)
      .ilike("brand", `%${query}%`)
      .limit(5);

    if (!brandData?.length) return send(chatId, `🔍 No results for "<b>${esc(query)}</b>".`);

    let msg = `🔍 <b>Brand: "${esc(query)}"</b>\n\n`;
    brandData.forEach((p, i) => {
      msg += `${i + 1}. ${esc(p.title)}\n   ${(p.price || 0).toFixed(2)} JOD\n\n`;
    });
    return send(chatId, msg);
  }

  let msg = `${BRAND.DIVIDER}\n◈ <b>SEARCH RESULTS</b> · "${esc(query)}" ◈\n${BRAND.DIVIDER}\n\n`;
  data.forEach((p, i) => {
    const concern = p.primary_concern ? p.primary_concern.replace("Concern_", "") : "";
    msg += `<b>${i + 1}.</b> ${esc(p.title)}\n`;
    msg += `   🏷️ ${esc(p.brand || "—")} — <b>${(p.price || 0).toFixed(2)} JOD</b>`;
    if (concern) msg += ` — ${concern}`;
    msg += `\n\n`;
  });
  msg += `🌐 <a href="${SITE_URL}/shop?q=${encodeURIComponent(query)}">View on website</a>`;
  await send(chatId, msg);
}

async function cmdBrands(chatId: string) {
  const { data } = await supabase.from("brands").select("name").order("name").limit(30);
  if (!data?.length) return send(chatId, "🏷️ No brands found.");

  let msg = `${BRAND.DIVIDER}\n◈ <b>OUR BRANDS</b> · ${data.length} ◈\n${BRAND.DIVIDER}\n\n`;
  const cols = 2;
  for (let i = 0; i < data.length; i += cols) {
    const row = data.slice(i, i + cols).map((b) => esc(b.name)).join("  •  ");
    msg += `${row}\n`;
  }
  msg += `\n🌐 <a href="${SITE_URL}/brands">All brands →</a>`;
  await send(chatId, msg);
}

async function cmdNewArrivals(chatId: string) {
  const { data } = await supabase
    .from("products")
    .select("title, brand, price, created_at")
    .eq("available", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (!data?.length) return send(chatId, "🆕 No new products.");

  let msg = `${BRAND.DIVIDER}\n◈ <b>NEW ARRIVALS</b> ◈\n${BRAND.DIVIDER}\n\n`;
  data.forEach((p, i) => {
    msg += `<b>${i + 1}.</b> ${esc(p.title)}\n`;
    msg += `   🏷️ ${esc(p.brand || "—")} — <b>${(p.price || 0).toFixed(2)} JOD</b>\n\n`;
  });
  await send(chatId, msg);
}

// ─── 🔧 SITE MANAGEMENT ──────────────────────────────────────

async function cmdSync(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  await send(chatId, "🔄 Triggering Shopify catalog sync...");

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/sync-shopify-catalog`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      await send(chatId, `✅ <b>Sync complete!</b>\n${JSON.stringify(data).slice(0, 300)}`);
    } else {
      await send(chatId, `❌ Sync failed: ${(await res.text()).slice(0, 200)}`);
    }
  } catch (e) {
    await send(chatId, `❌ ${String(e).slice(0, 200)}`);
  }
}

async function cmdHealth(chatId: string) {
  const checks: Array<{ name: string; ok: boolean; detail: string }> = [];

  // Check Supabase
  try {
    const { count } = await supabase.from("products").select("id", { count: "exact", head: true });
    checks.push({ name: "Supabase DB", ok: true, detail: `${count} products` });
  } catch {
    checks.push({ name: "Supabase DB", ok: false, detail: "Connection failed" });
  }

  // Check Beauty Assistant
  try {
    const res = await fetch(BEAUTY_ASSISTANT_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: "ping" }] }) });
    checks.push({ name: "AI Concierge", ok: res.ok, detail: res.ok ? "Online" : `HTTP ${res.status}` });
  } catch {
    checks.push({ name: "AI Concierge", ok: false, detail: "Offline" });
  }

  // Check site
  try {
    const res = await fetch(SITE_URL, { method: "HEAD" });
    checks.push({ name: "Website", ok: res.status < 400, detail: `HTTP ${res.status}` });
  } catch {
    checks.push({ name: "Website", ok: false, detail: "Unreachable" });
  }

  const allOk = checks.every((c) => c.ok);
  let msg = `${BRAND.DIVIDER}\n◈ <b>SYSTEM HEALTH CHECK</b> ${allOk ? "✅" : "⚠️"} ◈\n${BRAND.DIVIDER}\n\n`;
  for (const c of checks) {
    msg += `${c.ok ? "✅" : "❌"} <b>${c.name}</b>: ${esc(c.detail)}\n`;
  }
  msg += `\n��� ${new Date().toLocaleString()}`;
  await send(chatId, msg);
}

async function cmdEdgeFunctions(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");

  const functions = [
    "beauty-assistant", "sync-shopify-catalog", "asper-intelligence",
    "concierge-tip", "ai-product-search", "telegram-bot", "telegram-notify",
    "send-email", "sitemap", "meta-bot", "meta-capi",
  ];

  let msg = `${BRAND.DIVIDER}\n◈ <b>EDGE FUNCTIONS</b> ◈\n${BRAND.DIVIDER}\n\n`;
  for (const fn of functions) {
    msg += `• <code>${fn}</code>\n`;
  }
  msg += `\nTotal: <b>${functions.length}</b> functions`;
  await send(chatId, msg);
}

// ─── 📢 MARKETING ──────────────────────────����������──�����──────────────

async function cmdBroadcast(chatId: string, message: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  if (!message) return send(chatId, "📢 Usage: <code>/broadcast Your message</code>");

  // Get subscriber count
  const { count } = await supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true });

  broadcastDrafts.set(chatId, message);
  await send(chatId, `${BRAND.DIVIDER}\n◈ <b>BROADCAST PREVIEW</b> ◈\n${BRAND.DIVIDER}\n\n${esc(message)}\n\n📧 Would reach <b>${count || 0}</b> subscribers.\n\n<i>To send: /confirm-broadcast</i>`);
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

async function cmdConfirmBroadcast(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  const draft = broadcastDrafts.get(chatId);
  if (!draft) return send(chatId, "⚠️ No pending broadcast. Use /broadcast &lt;message&gt; first.");

  broadcastDrafts.delete(chatId);

  // Fetch all subscribers
  const { data: subs } = await supabase
    .from("newsletter_subscribers")
    .select("email");

  const count = subs?.length ?? 0;
  if (!count) return send(chatId, "📧 No subscribers to send to.");

  // Send via send-email edge function in batches (fire-and-forget)
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ type: "broadcast", message: draft }),
    });
    if (res.ok) {
      await send(chatId, `✅ <b>Broadcast sent!</b>\n📧 Dispatched to <b>${count}</b> subscribers.\n\n<i>${esc(draft.slice(0, 100))}${draft.length > 100 ? "…" : ""}</i>`);
    } else {
      await send(chatId, `⚠️ Broadcast queued (email service returned ${res.status}). Check /health.`);
    }
  } catch (e) {
    await send(chatId, `❌ Broadcast failed: ${esc(String(e).slice(0, 200))}`);
  }
}

async function cmdConcern(chatId: string, concern: string) {
  if (!concern) {
    return send(chatId,
      `${BRAND.DIVIDER}\n◈ ${BRAND.DR_SAMI} · <b>Browse by Concern</b> ◈\n${BRAND.DIVIDER}\n\n` +
      "Usage: <code>/concern &lt;type&gt;</code>\n\n" +
      "Examples:\n" +
      "  /concern acne\n  /concern aging\n  /concern brightening\n" +
      "  /concern hydration\n  /concern sensitive\n  /concern oily\n  /concern dark spots"
    );
  }

  const { data } = await supabase
    .from("products")
    .select("title, brand, price, primary_concern, asper_category")
    .eq("available", true)
    .ilike("primary_concern", `%${concern}%`)
    .order("bestseller_rank", { ascending: true, nullsFirst: false })
    .limit(10);

  if (!data?.length) {
    // Try title/description fallback
    const { data: fallback } = await supabase
      .from("products")
      .select("title, brand, price")
      .eq("available", true)
      .ilike("title", `%${concern}%`)
      .limit(6);

    if (!fallback?.length) return send(chatId, `🔬 No products found for concern: <b>${esc(concern)}</b>\n\nTry /concern for the full list.`);

    let msg = `${BRAND.DIVIDER}\n◈ ${BRAND.DR_SAMI} · <b>"${esc(concern)}"</b> ◈\n${BRAND.DIVIDER}\n\n`;
    fallback.forEach((p, i) => {
      msg += `${i + 1}. ${esc(p.title)}\n   ${esc(p.brand || "—")} — <b>${(p.price || 0).toFixed(2)} JOD</b>\n\n`;
    });
    return send(chatId, msg);
  }

  let msg = `${BRAND.DIVIDER}\n◈ ${BRAND.DR_SAMI} · <b>${esc(concern)}</b> · ${data.length} products ◈\n${BRAND.DIVIDER}\n\n`;
  data.forEach((p, i) => {
    const cat = p.asper_category ? ` · ${p.asper_category}` : "";
    msg += `<b>${i + 1}.</b> ${esc(p.title)}\n`;
    msg += `   🏷️ ${esc(p.brand || "—")} — <b>${(p.price || 0).toFixed(2)} JOD</b>${esc(cat)}\n\n`;
  });
  msg += `🌐 <a href="${SITE_URL}/shop?concern=${encodeURIComponent(concern)}">View on website →</a>`;
  await send(chatId, msg);
}

async function cmdBrandSearch(chatId: string, brandName: string) {
  if (!brandName) return send(chatId, "🏷️ Usage: <code>/brand &lt;name&gt;</code>\nExample: <code>/brand La Roche-Posay</code>");

  const { data: brandData } = await supabase
    .from("brands")
    .select("name, slug")
    .ilike("name", `%${brandName}%`)
    .limit(1)
    .maybeSingle();

  const resolvedBrand = brandData?.name || brandName;

  const { data } = await supabase
    .from("products")
    .select("title, brand, price, primary_concern")
    .eq("available", true)
    .ilike("brand", `%${resolvedBrand}%`)
    .order("bestseller_rank", { ascending: true, nullsFirst: false })
    .limit(10);

  if (!data?.length) return send(chatId, `🏷️ No products found for brand: <b>${esc(brandName)}</b>`);

  let msg = `${BRAND.DIVIDER}\n◈ <b>${esc(resolvedBrand)}</b> · ${data.length} products ◈\n${BRAND.DIVIDER}\n\n`;
  data.forEach((p, i) => {
    const concern = p.primary_concern ? ` · ${p.primary_concern.replace("Concern_", "")}` : "";
    msg += `<b>${i + 1}.</b> ${esc(p.title)}\n`;
    msg += `   <b>${(p.price || 0).toFixed(2)} JOD</b>${esc(concern)}\n\n`;
  });
  if (brandData?.slug) {
    msg += `🌐 <a href="${SITE_URL}/brands/${esc(brandData.slug)}">All ${esc(resolvedBrand)} →</a>`;
  }
  await send(chatId, msg);
}

async function cmdRevenue(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");

  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const [todayRev, weekRev, monthRev, allTime] = await Promise.all([
    supabase.from("cod_orders").select("total").gte("created_at", today).neq("status", "cancelled"),
    supabase.from("cod_orders").select("total").gte("created_at", weekAgo).neq("status", "cancelled"),
    supabase.from("cod_orders").select("total").gte("created_at", monthAgo).neq("status", "cancelled"),
    supabase.from("cod_orders").select("total").neq("status", "cancelled"),
  ]);

  const sum = (rows: { total: number }[] | null) =>
    (rows ?? []).reduce((s, r) => s + (r.total || 0), 0);

  const t = sum(todayRev.data);
  const w = sum(weekRev.data);
  const m = sum(monthRev.data);
  const a = sum(allTime.data);

  let msg = `${BRAND.DIVIDER}\n◈ <b>REVENUE REPORT</b> ◈\n${BRAND.DIVIDER}\n\n`;
  msg += `📅 <b>Today:</b>      <b>${t.toFixed(2)} JOD</b>  (${todayRev.data?.length ?? 0} orders)\n`;
  msg += `📆 <b>This Week:</b>  <b>${w.toFixed(2)} JOD</b>  (${weekRev.data?.length ?? 0} orders)\n`;
  msg += `🗓️ <b>This Month:</b> <b>${m.toFixed(2)} JOD</b>  (${monthRev.data?.length ?? 0} orders)\n`;
  msg += `♾️ <b>All Time:</b>   <b>${a.toFixed(2)} JOD</b>  (${allTime.data?.length ?? 0} orders)\n`;

  if (weekRev.data?.length && weekRev.data.length > 0) {
    const avg = w / weekRev.data.length;
    msg += `\n📊 <b>Avg order (7d):</b> ${avg.toFixed(2)} JOD`;
  }
  msg += `\n\n🕐 ${new Date().toLocaleString()}`;
  await send(chatId, msg);
}

async function cmdCancelOrder(chatId: string, orderId: string) {
  if (!isAdmin(chatId)) return send(chatId, "�� Admin only.");
  if (!orderId) return send(chatId, "❌ Usage: <code>/cancel &lt;order-id&gt;</code>");

  const { data: existing } = await supabase
    .from("cod_orders")
    .select("id, status, customer_name, total")
    .eq("id", orderId)
    .single();

  if (!existing) return send(chatId, `❌ Order not found: <code>${esc(orderId)}</code>`);
  if (existing.status === "delivered") return send(chatId, `⚠️ Cannot cancel — order already delivered.`);
  if (existing.status === "cancelled") return send(chatId, `⚠️ Order already cancelled.`);

  const { error } = await supabase.from("cod_orders").update({ status: "cancelled" }).eq("id", orderId);
  if (error) return send(chatId, `❌ ${esc(error.message)}`);

  await send(chatId,
    `🚫 <b>Order Cancelled</b>\n` +
    `👤 ${esc(existing.customer_name || "Customer")}\n` +
    `💰 ${(existing.total || 0).toFixed(2)} JOD\n` +
    `🆔 ${esc(String(orderId).slice(0, 8))}…`
  );
}

// ─── 🛒 PRODUCT MANAGEMENT (Admin) ─────────────────────────────

async function cmdAddProduct(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  // Format: /addproduct Title | Price | Brand | Category
  const parts = args.split("|").map((s) => s.trim());
  if (parts.length < 2) {
    return send(chatId,
      `📦 <b>Add Product</b>\n\n` +
      `Usage: <code>/addproduct Title | Price | Brand | Category</code>\n\n` +
      `Example:\n<code>/addproduct CeraVe Moisturizing Cream | 12.50 | CeraVe | Skin Care</code>\n\n` +
      `• Title &amp; Price are required\n• Brand defaults to "Asper"\n• Category defaults to "Skin Care"`
    );
  }
  const title = parts[0];
  const price = parseFloat(parts[1]);
  if (isNaN(price) || price <= 0) return send(chatId, "❌ Invalid price. Use a number like 12.50");

  const brand = parts[2] || "Asper";
  const category = parts[3] || "Skin Care";

  const { data, error } = await supabase
    .from("products")
    .insert({
      title,
      price,
      brand,
      asper_category: category,
      available: true,
    })
    .select("id, title, price, brand, asper_category")
    .single();

  if (error) return send(chatId, `❌ ${esc(error.message)}`);

  await send(chatId,
    `✅ <b>Product Added</b>\n\n` +
    `📦 ${esc(data.title)}\n` +
    `💰 ${data.price.toFixed(2)} JOD\n` +
    `🏷️ ${esc(data.brand)}\n` +
    `📂 ${esc(data.asper_category)}\n` +
    `🆔 <code>${data.id}</code>`
  );
}

async function cmdEditProduct(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  // Format: /editproduct <id> <field> <value>
  const parts = args.split(" ");
  if (parts.length < 3) {
    return send(chatId,
      `✏️ <b>Edit Product</b>\n\n` +
      `Usage: <code>/editproduct &lt;id&gt; &lt;field&gt; &lt;value&gt;</code>\n\n` +
      `Fields: title, price, brand, category, available\n\n` +
      `Examples:\n` +
      `<code>/editproduct abc123 price 15.99</code>\n` +
      `<code>/editproduct abc123 title New Name Here</code>\n` +
      `<code>/editproduct abc123 available false</code>`
    );
  }
  const id = parts[0];
  const field = parts[1].toLowerCase();
  const value = parts.slice(2).join(" ");

  const allowedFields: Record<string, string> = {
    title: "title",
    price: "price",
    brand: "brand",
    category: "asper_category",
    available: "available",
    image: "image_url",
    description: "description",
    bestseller: "bestseller_rank",
  };

  const dbField = allowedFields[field];
  if (!dbField) return send(chatId, `❌ Unknown field: ${esc(field)}\nAllowed: ${Object.keys(allowedFields).join(", ")}`);

  // Type conversion
  let dbValue: string | number | boolean = value;
  if (dbField === "price" || dbField === "bestseller_rank") {
    dbValue = parseFloat(value);
    if (isNaN(dbValue)) return send(chatId, `❌ ${esc(field)} must be a number.`);
  }
  if (dbField === "available") dbValue = value.toLowerCase() === "true";

  const { error } = await supabase
    .from("products")
    .update({ [dbField]: dbValue })
    .eq("id", id);

  if (error) return send(chatId, `❌ ${esc(error.message)}`);

  await send(chatId, `✅ Updated <b>${esc(field)}</b> → <code>${esc(String(dbValue))}</code>\n🆔 ${esc(id.slice(0, 8))}…`);
}

async function cmdRemoveProduct(chatId: string, idOrTitle: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  if (!idOrTitle) return send(chatId, "🗑️ Usage: <code>/removeproduct &lt;id or title&gt;</code>");

  // Try by ID first, then by title search
  let product: Record<string, unknown> | null = null;
  const { data: byId } = await supabase.from("products").select("id, title, brand, price").eq("id", idOrTitle).single();
  if (byId) {
    product = byId;
  } else {
    const { data: byTitle } = await supabase
      .from("products")
      .select("id, title, brand, price")
      .ilike("title", `%${idOrTitle}%`)
      .limit(1)
      .single();
    product = byTitle;
  }

  if (!product) return send(chatId, `❌ Product not found: <code>${esc(idOrTitle)}</code>`);

  // Soft-delete by setting available = false
  const { error } = await supabase.from("products").update({ available: false }).eq("id", product.id);
  if (error) return send(chatId, `❌ ${esc(error.message)}`);

  await send(chatId,
    `🗑️ <b>Product Hidden</b> (set available=false)\n\n` +
    `📦 ${esc(String(product.title))}\n` +
    `🏷️ ${esc(String(product.brand || "—"))} — ${(Number(product.price) || 0).toFixed(2)} JOD\n` +
    `🆔 <code>${product.id}</code>\n\n` +
    `<i>To permanently delete, use SQL. To restore: /editproduct ${product.id} available true</i>`
  );
}

async function cmdListProducts(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  // List products with optional filter
  const page = parseInt(args) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const { data, count } = await supabase
    .from("products")
    .select("id, title, brand, price, available, asper_category", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!data?.length) return send(chatId, "📋 No products found.");

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  let msg = `${BRAND.DIVIDER}\n◈ <b>PRODUCT LIST</b> · Page ${page}/${totalPages} (${total} total) ◈\n${BRAND.DIVIDER}\n\n`;
  data.forEach((p, i) => {
    const status = p.available ? "✅" : "❌";
    msg += `${status} <b>${offset + i + 1}.</b> ${esc(p.title || "—")}\n`;
    msg += `   🏷️ ${esc(p.brand || "—")} · ${(p.price || 0).toFixed(2)} JOD · ${esc(p.asper_category || "—")}\n`;
    msg += `   🆔 <code>${p.id}</code>\n\n`;
  });

  if (totalPages > 1) msg += `📄 Page ${page}/${totalPages} — <code>/listproducts ${page + 1}</code>`;
  await send(chatId, msg);
}

// ─── 🎨 SITE CONFIG (Admin) ──────────────────────────────────

async function cmdSiteConfig(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  if (!args) {
    // Show current config
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
    // Show single key value
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
}

async function cmdFeature(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  // Feature a product on homepage digital tray
  if (!args) {
    return send(chatId,
      `⭐ <b>Feature Product</b>\n\n` +
      `Usage: <code>/feature &lt;product-id&gt;</code> — Add to digital tray\n` +
      `       <code>/unfeature &lt;product-id&gt;</code> — Remove from digital tray`
    );
  }

  const { data: product } = await supabase.from("products").select("id, title").eq("id", args).single();
  if (!product) return send(chatId, `❌ Product not found: <code>${esc(args)}</code>`);

  const { error } = await supabase
    .from("digital_tray_products")
    .upsert({ product_id: args }, { onConflict: "product_id" });

  if (error) return send(chatId, `❌ ${esc(error.message)}`);
  await send(chatId, `⭐ <b>Featured:</b> ${esc(product.title)}\nNow showing on homepage digital tray.`);
}

async function cmdUnfeature(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  if (!args) return send(chatId, "Usage: <code>/unfeature &lt;product-id&gt;</code>");

  const { error } = await supabase.from("digital_tray_products").delete().eq("product_id", args);
  if (error) return send(chatId, `❌ ${esc(error.message)}`);
  await send(chatId, `✅ Removed from digital tray.`);
}

async function cmdBestseller(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  // Format: /bestseller <id> <rank>
  const parts = args.split(" ");
  if (parts.length < 2) {
    return send(chatId,
      `🏆 <b>Set Bestseller Rank</b>\n\n` +
      `Usage: <code>/bestseller &lt;product-id&gt; &lt;rank&gt;</code>\n` +
      `Rank 1 = top bestseller. Use 0 to remove.\n\n` +
      `Example: <code>/bestseller abc123 5</code>`
    );
  }
  const id = parts[0];
  const rank = parseInt(parts[1]);
  if (isNaN(rank)) return send(chatId, "❌ Rank must be a number.");

  const update = rank === 0
    ? { bestseller_rank: null, is_bestseller: false }
    : { bestseller_rank: rank, is_bestseller: true };

  const { error } = await supabase.from("products").update(update).eq("id", id);
  if (error) return send(chatId, `❌ ${esc(error.message)}`);

  await send(chatId, rank === 0
    ? `✅ Removed bestseller status for <code>${esc(id.slice(0, 8))}…</code>`
    : `🏆 Set bestseller rank <b>#${rank}</b> for <code>${esc(id.slice(0, 8))}…</code>`
  );
}

async function cmdPrice(chatId: string, query: string) {
  if (!query) return send(chatId, "💰 Usage: <code>/price &lt;product name&gt;</code>");

  const { data } = await supabase
    .from("products")
    .select("title, brand, price, compare_at_price")
    .eq("available", true)
    .ilike("title", `%${query}%`)
    .order("price", { ascending: true })
    .limit(8);

  if (!data?.length) return send(chatId, `💰 No products found matching "<b>${esc(query)}</b>"`);

  let msg = `${BRAND.DIVIDER}\n◈ <b>PRICE LOOKUP</b> · "${esc(query)}" ◈\n${BRAND.DIVIDER}\n\n`;
  data.forEach((p) => {
    const compare = p.compare_at_price && p.compare_at_price > p.price
      ? ` <s>${p.compare_at_price.toFixed(2)}</s>` : "";
    msg += `• ${esc(p.title)}\n  🏷️ ${esc(p.brand || "—")} — <b>${(p.price || 0).toFixed(2)} JOD</b>${compare}\n\n`;
  });
  await send(chatId, msg);
}

async function cmdDeals(chatId: string) {
  // Products with compare_at_price > price (on sale)
  const { data } = await supabase
    .from("products")
    .select("title, brand, price, compare_at_price")
    .eq("available", true)
    .not("compare_at_price", "is", null)
    .order("bestseller_rank", { ascending: true, nullsFirst: false })
    .limit(10);

  const deals = (data || []).filter((p) => p.compare_at_price && p.compare_at_price > p.price);

  if (!deals.length) {
    // Fallback: show top bestsellers
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

// ─── ℹ️ STATUS / VERBOSE / REPO / SYNC_THREADS ───────────────

async function cmdStatus(chatId: string) {
  const { count: convCount } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .like("title", "telegram:%");

  const today = new Date().toISOString().split("T")[0];
  const { count: orderCount } = await supabase
    .from("cod_orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today);

  const aiEngine = ANTHROPIC_API_KEY ? `Claude ${CLAUDE_MODEL}` : "Gemini (beauty-assistant)";
  const verboseOn = verboseChats.has(chatId);

  let msg = `${BRAND.DIVIDER}\n◈ <b>BOT STATUS</b> ◈\n${BRAND.DIVIDER}\n\n`;
  msg += `⚡ <b>Status:</b> Online\n`;
  msg += `🧠 <b>AI Engine:</b> ${esc(aiEngine)}\n`;
  msg += `💬 <b>Active Threads:</b> ${convCount ?? 0}\n`;
  msg += `📦 <b>Orders Today:</b> ${orderCount ?? 0}\n`;
  msg += `🔊 <b>Verbose Mode:</b> ${verboseOn ? "ON" : "OFF"}\n`;
  if (ENABLE_PROJECT_THREADS) msg += `🧵 <b>Project Threads:</b> Enabled\n`;
  msg += `\n🕐 ${new Date().toLocaleString()}`;
  await send(chatId, msg);
}

async function cmdVerbose(chatId: string) {
  if (verboseChats.has(chatId)) {
    verboseChats.delete(chatId);
    await send(chatId, "🔇 <b>Verbose mode OFF</b>\nAI responses will be concise.");
  } else {
    verboseChats.add(chatId);
    await send(chatId, "��������� <b>Verbose mode ON</b>\nAI responses will show which model replied.");
  }
}

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = { "User-Agent": "asper-beauty-bot", "Accept": "application/vnd.github+json" };
  if (GITHUB_TOKEN) h["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function ghGet(path: string): Promise<Record<string, unknown>[] | Record<string, unknown> | null> {
  const url = path.startsWith("http") ? path : `https://api.github.com/repos/${GITHUB_REPO}${path}`;
  const res = await fetch(url, { headers: ghHeaders() });
  if (!res.ok) return null;
  return res.json();
}

async function ghTree(path: string): Promise<Record<string, unknown>[] | null> {
  const cleanPath = path.replace(/^\/+/, "").replace(/\/+$/, "");
  const endpoint = cleanPath ? `/contents/${cleanPath}` : "/contents";
  const data = await ghGet(endpoint);
  if (!Array.isArray(data)) return null;
  return data as Record<string, unknown>[];
}

async function cmdRepo(chatId: string, sub: string) {
  const repoUrl = `https://github.com/${GITHUB_REPO}`;

  // /repo issues
  if (sub === "issues") {
    const data = await ghGet("/issues?state=open&per_page=10") as Record<string, unknown>[] | null;
    if (!data?.length) return send(chatId, `📋 <b>No open issues</b>\n🔗 <a href="${repoUrl}/issues">View on GitHub</a>`);
    let msg = `${BRAND.DIVIDER}\n◈ <b>OPEN ISSUES</b> · ${data.length} ◈\n${BRAND.DIVIDER}\n\n`;
    for (const i of data) {
      const labels = ((i.labels as Record<string, unknown>[]) ?? []).map((l) => `#${esc(String(l.name ?? ""))}`).join(" ");
      msg += `<b>#${i.number}</b> ${esc(String(i.title ?? ""))}\n`;
      if (labels) msg += `   ${labels}\n`;
      msg += `\n`;
    }
    msg += `🔗 <a href="${repoUrl}/issues">All issues →</a>`;
    return send(chatId, msg);
  }

  // /repo prs
  if (sub === "prs") {
    const data = await ghGet("/pulls?state=open&per_page=10") as Record<string, unknown>[] | null;
    if (!data?.length) return send(chatId, `🔀 <b>No open pull requests</b>\n🔗 <a href="${repoUrl}/pulls">View on GitHub</a>`);
    let msg = `${BRAND.DIVIDER}\n◈ <b>OPEN PULL REQUESTS</b> · ${data.length} ◈\n${BRAND.DIVIDER}\n\n`;
    for (const pr of data) {
      const head = String((pr.head as Record<string, unknown>)?.ref ?? "");
      const base = String((pr.base as Record<string, unknown>)?.ref ?? "");
      msg += `<b>#${pr.number}</b> ${esc(String(pr.title ?? ""))}\n`;
      msg += `   <code>${esc(head)}</code> → <code>${esc(base)}</code>\n\n`;
    }
    msg += `🔗 <a href="${repoUrl}/pulls">All PRs →</a>`;
    return send(chatId, msg);
  }

  // /repo commits
  if (sub === "commits") {
    const data = await ghGet("/commits?per_page=8") as Record<string, unknown>[] | null;
    if (!data?.length) return send(chatId, "📝 Could not fetch commits.");
    let msg = `${BRAND.DIVIDER}\n◈ <b>RECENT COMMITS</b> ◈\n${BRAND.DIVIDER}\n\n`;
    for (const c of data) {
      const commit = c.commit as Record<string, unknown>;
      const author = (commit.author as Record<string, unknown>)?.name ?? "unknown";
      const message = String(commit.message ?? "").split("\n")[0].slice(0, 60);
      const sha = String(c.sha ?? "").slice(0, 7);
      msg += `<code>${sha}</code> ${esc(message)}\n   <i>${esc(String(author))}</i>\n\n`;
    }
    msg += `🔗 <a href="${repoUrl}/commits">Full history →</a>`;
    return send(chatId, msg);
  }

  // /repo — overview
  const data = await ghGet("") as Record<string, unknown> | null;
  let msg = `${BRAND.DIVIDER}\n◈ <b>REPOSITORY</b> · ${esc(GITHUB_REPO)} ◈\n${BRAND.DIVIDER}\n\n`;
  msg += `🔗 <a href="${repoUrl}">Open on GitHub</a>\n\n`;
  if (data) {
    msg += `🌿 Branch: <b>${esc(String(data.default_branch ?? "main"))}</b>\n`;
    if (data.pushed_at) msg += `🕐 Last push: <b>${new Date(String(data.pushed_at)).toLocaleDateString()}</b>\n`;
    if (typeof data.open_issues_count === "number") {
      msg += `📋 Open issues: <b>${data.open_issues_count}</b>\n`;
    }
    msg += `⭐ ${data.stargazers_count ?? 0}  🍴 ${data.forks_count ?? 0}\n`;
  }
  msg += `\n<b>Subcommands:</b>\n`;
  msg += `  /repo issues — open issues\n`;
  msg += `  /repo prs — open pull requests\n`;
  msg += `  /repo commits — recent commits`;
  await send(chatId, msg);
}

async function cmdSyncThreads(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  if (!ENABLE_PROJECT_THREADS) {
    return send(chatId, "⚠️ Project threads not enabled.\nSet <code>ENABLE_PROJECT_THREADS=true</code> in edge function secrets.");
  }

  const cutoff = new Date(Date.now() - CONVERSATION_TTL_MS).toISOString();

  const [totalResult, recentResult] = await Promise.all([
    supabase.from("conversations").select("id", { count: "exact", head: true }).like("title", "telegram:%"),
    supabase.from("messages").select("conversation_id", { count: "exact", head: true }).gte("created_at", cutoff),
  ]);

  const total = totalResult.count ?? 0;
  const activeMessages = recentResult.count ?? 0;

  let msg = `${BRAND.DIVIDER}\n◈ <b>THREAD SYNC STATUS</b> ◈\n${BRAND.DIVIDER}\n\n`;
  msg += `💬 Total threads: <b>${total}</b>\n`;
  msg += `🕐 TTL window: <b>24h</b>\n`;
  msg += `💾 Recent messages: <b>${activeMessages}</b>\n\n`;
  msg += `<i>Stale threads expire lazily on next use.\nUse /reset to clear your thread now.</i>`;
  await send(chatId, msg);
}

// ─── 🖥️ CLASSIC MODE COMMANDS ────��───────────────────────────

async function cmdCd(chatId: string, path: string) {
  if (!path || path === "~") {
    cwdMap.set(chatId, "/");
    return send(chatId, `📂 <code>/</code>`);
  }

  const cwd = getCwd(chatId);
  let next: string;

  if (path === "..") {
    const parts = cwd.split("/").filter(Boolean);
    parts.pop();
    next = parts.length ? "/" + parts.join("/") : "/";
  } else if (path.startsWith("/")) {
    next = path;
  } else {
    next = cwd === "/" ? `/${path}` : `${cwd}/${path}`;
  }
  next = next.replace(/\/+/g, "/").replace(/\/$/, "") || "/";

  const entries = await ghTree(next);
  if (entries === null) {
    return send(chatId, `❌ Path not found: <code>${esc(next)}</code>`);
  }

  cwdMap.set(chatId, next);
  const display = next === "/" ? "/" : `${next}/`;
  await send(chatId, `📂 Directory changed to <code>${esc(display)}</code>`);
}

async function cmdLs(chatId: string) {
  const cwd = getCwd(chatId);
  const entries = await ghTree(cwd);

  if (entries === null) return send(chatId, `❌ Could not read <code>${esc(cwd)}</code>`);
  if (!entries.length) return send(chatId, `📂 <code>${esc(cwd)}</code>\n<i>(empty)</i>`);

  const dirs = entries
    .filter((e) => e.type === "dir")
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  const files = entries
    .filter((e) => e.type !== "dir")
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));

  const dirTokens = dirs.map(d => `${String(d.name)}/`);
  const fileTokens = files.map(f => {
    const kb = typeof f.size === "number" && f.size > 0 ? ` (${(f.size / 1024).toFixed(1)}k)` : "";
    return `${String(f.name)}${kb}`;
  });

  let msg = `📂 <code>${esc(cwd)}</code>\n\n`;
  msg += `<code>${esc([...dirTokens, ...fileTokens].join("  "))}</code>\n`;
  msg += `\n<i>${dirs.length} dirs, ${files.length} files</i>`;
  await send(chatId, msg);
}

async function cmdPwd(chatId: string) {
  await send(chatId, `📂 <code>${esc(getCwd(chatId))}</code>`);
}

async function cmdProjectsList(chatId: string) {
  const entries = await ghTree("/");
  if (!entries) return send(chatId, "❌ Could not fetch repository root.");

  const dirs = entries.filter((e) => e.type === "dir");
  let msg = `${BRAND.DIVIDER}\n◈ <b>REPOSITORY</b> · ${esc(GITHUB_REPO)} ◈\n${BRAND.DIVIDER}\n\n`;
  for (const d of dirs) msg += `📁 <code>${esc(String(d.name))}</code>\n`;
  msg += `\n<i>Use /cd &lt;folder&gt; to navigate</i>`;
  await send(chatId, msg);
}

async function cmdExport(chatId: string) {
  const title = `telegram:${chatId}`;
  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("title", title)
    .maybeSingle();

  if (!conv?.id) return send(chatId, "💬 No active conversation to export.");

  const { data: msgs } = await supabase
    .from("messages")
    .select("role, content, created_at")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });

  if (!msgs?.length) return send(chatId, "💬 Conversation is empty.");

  let text = `ASPER BEAUTY — CONVERSATION EXPORT\n`;
  text += `Exported: ${new Date().toLocaleString()}\n`;
  text += `Messages: ${msgs.length}\n`;
  text += `${"─".repeat(40)}\n\n`;

  for (const m of msgs) {
    const role = m.role === "user" ? "You" : "Bot";
    const time = new Date(m.created_at).toLocaleTimeString();
    text += `[${time}] ${role}:\n${m.content}\n\n`;
  }

  const blob = new Blob([text], { type: "text/plain" });
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("document", blob, `conversation-${chatId}-${Date.now()}.txt`);
  form.append("caption", `💬 Exported ${msgs.length} messages`);

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) await send(chatId, "❌ Could not send export file.");
}

async function cmdActionsMenu(chatId: string) {
  if (!AGENTIC_MODE) {
    const devKeyboard = [
      [
        { text: "🔀 Open PRs", callback_data: "dev:prs" },
        { text: "📋 Issues", callback_data: "dev:issues" },
      ],
      [
        { text: "📝 Commits", callback_data: "dev:commits" },
        { text: "❤️ Health", callback_data: "dev:health" },
      ],
      [
        { text: "🔄 Sync Catalog", callback_data: "dev:sync" },
        { text: "📊 Stats", callback_data: "dev:stats" },
      ],
      [
        { text: "📂 Browse Root", callback_data: "dev:root" },
        { text: "💾 Export Session", callback_data: "dev:export" },
      ],
      ...(ENABLE_PROJECT_THREADS ? [[
        { text: "🧵 Sync Threads", callback_data: "dev:threads" },
      ]] : []),
    ];
    await send(chatId, `🖥️ <b>Classic Mode — Quick Actions</b>\nChoose an action:`, {
      reply_markup: { inline_keyboard: devKeyboard },
    });
    return;
  }

  const admin = isAdmin(chatId);
  const keyboard = [
    [
      { text: "📊 Stats", callback_data: "action:stats" },
      { text: "📦 Orders", callback_data: "action:orders" },
    ],
    [
      { text: "❤️ Health", callback_data: "action:health" },
      { text: "🏆 Bestsellers", callback_data: "action:products" },
    ],
    [
      { text: "🏷️ Deals", callback_data: "action:deals" },
      { text: "🆕 New Arrivals", callback_data: "action:new" },
    ],
    [
      { text: "🔀 Open PRs", callback_data: "action:prs" },
      { text: "📋 Issues", callback_data: "action:issues" },
    ],
    [
      { text: "📝 Commits", callback_data: "action:commits" },
      { text: "🔊 Verbose", callback_data: "action:verbose" },
    ],
    ...(admin ? [[
      { text: "🔄 Sync Catalog", callback_data: "action:sync" },
      { text: "💰 Revenue", callback_data: "action:revenue" },
    ]] : []),
  ];
  await send(chatId, `⚡ <b>Quick Actions</b>\nChoose an action:`, {
    reply_markup: { inline_keyboard: keyboard },
  });
}

async function cmdGitAlias(chatId: string, sub: string) {
  const s = sub.toLowerCase();
  if (s === "log") return cmdRepo(chatId, "commits");
  if (s === "prs" || s === "pr") return cmdRepo(chatId, "prs");
  if (s === "issues" || s === "issue") return cmdRepo(chatId, "issues");
  return cmdRepo(chatId, "");
}

async function handleCallback(chatId: string, callbackQueryId: string, data: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });

  switch (data) {
    case "action:sync":     return cmdSync(chatId);
    case "action:health":   return cmdHealth(chatId);
    case "action:stats":    return cmdStats(chatId);
    case "action:orders":   return cmdOrders(chatId);
    case "action:prs":      return cmdRepo(chatId, "prs");
    case "action:issues":   return cmdRepo(chatId, "issues");
    case "action:commits":  return cmdRepo(chatId, "commits");
    case "action:verbose":  return cmdVerbose(chatId);
    case "action:products": return cmdProducts(chatId);
    case "action:deals":    return cmdDeals(chatId);
    case "action:new":      return cmdNewArrivals(chatId);
    case "action:revenue":  return cmdRevenue(chatId);
    // ─── Classic Mode dev actions ───
    case "dev:prs":     return cmdRepo(chatId, "prs");
    case "dev:issues":  return cmdRepo(chatId, "issues");
    case "dev:commits": return cmdRepo(chatId, "commits");
    case "dev:health":  return cmdHealth(chatId);
    case "dev:sync":    return cmdSync(chatId);
    case "dev:stats":   return cmdStats(chatId);
    case "dev:root":    cwdMap.set(chatId, "/"); return cmdLs(chatId);
    case "dev:export":  return cmdExport(chatId);
    case "dev:threads": return cmdSyncThreads(chatId);
    default:            return send(chatId, `⚠️ Unknown action: <code>${esc(data)}</code>`);
  }
}

// ─── BOT PROFILE SETUP ────────────────────────────────────────

async function cmdSetupProfile(chatId: string) {
  const tg = (method: string, body: Record<string, unknown>) =>
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  await tg("setMyDescription", {
    description:
      "Your personal beauty intelligence assistant. 🔬 Dr. Sami — Clinical Dermo-Solutions · ✨ Ms. Zain — Luxury Daily Rituals. 10,000+ pharmacist-curated products from 350+ brands. Asper Beauty Shop — Amman, Jordan. asperbeautyshop.com",
  });

  await tg("setMyShortDescription", {
    short_description: "Asper Beauty AI — Dr. Sami & Ms. Zain · Nature Contained.",
  });

  await tg("setMyCommands", {
    commands: [
      { command: "start",    description: "Welcome & keyboard" },
      { command: "help",     description: "All commands" },
      { command: "search",   description: "Search products" },
      { command: "products", description: "Top bestsellers" },
      { command: "concern",  description: "Browse by skin concern" },
      { command: "brands",   description: "Explore all brands" },
      { command: "deals",    description: "Featured & sale items" },
      { command: "new",      description: "New arrivals" },
      { command: "price",    description: "Price lookup" },
      { command: "reset",    description: "Clear conversation" },
      { command: "status",   description: "Bot status" },
    ],
  });

  await send(chatId,
    `${BRAND.DIVIDER}\n✦ <b>Bot Profile Updated</b>\n${BRAND.DIVIDER}\n\n` +
    `✅ Description set\n✅ Short description set\n✅ Commands registered\n\n` +
    `<i>${BRAND.TAGLINE}</i>`
  );
}

// ─── HELP & MENUS ──────────────────────────────────────����───����─

function getHelp(admin: boolean): string {
  let msg = `${BRAND.DIVIDER}\n`;
  msg += `   𝗔𝗦𝗣𝗘𝗥.𝗔𝗜 — Command Center\n`;
  msg += `${BRAND.DIVIDER}\n\n`;

  msg += `🔬 <b>Dr. Sami · Clinical</b>\n`;
  msg += `  /concern &lt;type&gt; — Browse by skin concern\n`;
  msg += `  /search &lt;keyword&gt; — Find products\n`;
  msg += `  /price &lt;product&gt; — Price lookup\n\n`;

  msg += `✨ <b>Ms. Zain · Aesthetic</b>\n`;
  msg += `  /products — Top bestsellers\n`;
  msg += `  /brands — Explore all brands\n`;
  msg += `  /brand &lt;name&gt; — Brand spotlight\n`;
  msg += `  /new — New arrivals\n`;
  msg += `  /deals — Featured &amp; sale items\n\n`;

  if (admin) {
    msg += `📦 <b>Orders</b>\n`;
    msg += `  /orders — Today's orders\n`;
    msg += `  /order &lt;id&gt; — Order detail\n`;
    msg += `  /update &lt;id&gt; &lt;status&gt; — Update status\n`;
    msg += `  /cancel &lt;id&gt; — Cancel order\n\n`;
    msg += `📊 <b>Analytics</b>\n`;
    msg += `  /stats — Full dashboard\n`;
    msg += `  /revenue — Revenue breakdown\n`;
    msg += `  /leads — Today's leads\n`;
    msg += `  /subscribers — Newsletter stats\n\n`;
    msg += `🔧 <b>Management</b>\n`;
    msg += `  /sync — Sync Shopify catalog\n`;
    msg += `  /health — System health check\n`;
    msg += `  /functions — Edge functions list\n`;
    msg += `  /setup-profile — Update bot profile\n\n`;
    msg += `📢 <b>Marketing</b>\n`;
    msg += `  /broadcast &lt;msg&gt; — Draft broadcast\n`;
    msg += `  /confirm-broadcast — Send drafted broadcast\n\n`;
    msg += `🛒 <b>Product Management</b>\n`;
    msg += `  /addproduct Title | Price | Brand | Category\n`;
    msg += `  /editproduct &lt;id&gt; &lt;field&gt; &lt;value&gt;\n`;
    msg += `  /removeproduct &lt;id or title&gt;\n`;
    msg += `  /listproducts [page] — Browse all products\n`;
    msg += `  /feature &lt;id&gt; — Add to homepage tray\n`;
    msg += `  /unfeature &lt;id&gt; — Remove from tray\n`;
    msg += `  /bestseller &lt;id&gt; &lt;rank&gt; — Set rank\n\n`;
    msg += `🎨 <b>Site Config</b>\n`;
    msg += `  /site — View all settings\n`;
    msg += `  /site &lt;key&gt; &lt;value&gt; — Update setting\n\n`;
  }

  msg += `⚙️ <b>System</b>\n`;
  msg += `  /start · /help · /reset · /status · /verbose · /repo\n`;
  if (admin && ENABLE_PROJECT_THREADS) {
    msg += `  /sync_threads — Sync conversation threads\n`;
  }

  if (!AGENTIC_MODE) {
    msg += `\n🖥️ <b>Classic Mode</b>\n`;
    msg += `  /new · /continue · /end · /cd · /ls · /pwd · /projects · /export\n`;
    if (ENABLE_PROJECT_THREADS) msg += `  /sync_threads — Sync threads\n`;
  }

  msg += `\n${BRAND.MINI_DIV}\n`;
  msg += `<i>✦ Type any beauty question to chat with ${BRAND.DR_SAMI} &amp; ${BRAND.MS_ZAIN}</i>`;
  return msg;
}

// ─── MAIN ROUTER ──────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
  if (req.method !== "POST") return new Response("OK", { status: 200 });

  let update: Record<string, unknown>;
  try { update = await req.json(); } catch { return new Response("Bad", { status: 400 }); }

  // Handle inline keyboard callbacks
  const callbackQuery = update.callback_query as Record<string, unknown> | undefined;
  if (callbackQuery) {
    const cbChat = (callbackQuery.message as Record<string, unknown>)?.chat as Record<string, unknown>;
    const cbChatId = String(cbChat?.id ?? "");
    const cbId = String(callbackQuery.id ?? "");
    const cbData = String(callbackQuery.data ?? "");
    if (cbChatId && cbData) {
      try { await handleCallback(cbChatId, cbId, cbData); } catch (err) { await adminAlert(err, "callback_query"); }
    }
    return new Response("OK");
  }

  const message = update.message as Record<string, unknown> | undefined;
  if (!message) return new Response("OK");

  const chatId = String((message.chat as Record<string, unknown>)?.id ?? "");
  const text = (message.text as string || "").trim();
  const firstName = ((message.from as Record<string, unknown>)?.first_name as string) || "there";

  if (!chatId || !text) return new Response("OK");

  const cmd = text.split(" ")[0].toLowerCase();
  const args = text.slice(cmd.length).trim();
  const admin = isAdmin(chatId);

  await typing(chatId);

  switch (cmd) {
    // ─── General ───
    case "/start": {
      if (!AGENTIC_MODE) {
        const classicWelcome =
          `${BRAND.DIVIDER}\n` +
          `🖥️ <b>ASPER.AI — Classic Dev Terminal</b>\n` +
          `${BRAND.DIVIDER}\n\n` +
          `Welcome, <b>${esc(firstName)}</b>!\n\n` +
          `<b>Session</b>  /new · /continue · /end\n` +
          `<b>Navigate</b> /cd &lt;path&gt; · /ls · /pwd · /projects\n` +
          `<b>Tools</b>    /actions · /git · /export · /status\n` +
          `<b>General</b>  /help · /repo · /reset · /verbose\n` +
          (ENABLE_PROJECT_THREADS ? `<b>Threads</b>  /sync_threads\n` : "") +
          `\n<i>Type any message to chat with the AI concierge.</i>`;
        await sendKeyboard(chatId, classicWelcome, [
          ["/ls", "/status", "/actions"],
          ["/git log", "/git prs", "/help"],
        ]);
        return new Response("OK");
      }
      const welcome =
        `${BRAND.DIVIDER}\n` +
        `   𝗔𝗦𝗣𝗘𝗥.𝗔𝗜  —  Beauty Intelligence\n` +
        `${BRAND.DIVIDER}\n\n` +
        `مرحباً / Welcome, <b>${esc(firstName)}</b>!\n\n` +
        `🔬 <b>Dr. Sami</b> — Clinical Dermo-Solutions\n` +
        `   Skincare · Supplements · Sun Protection · Baby &amp; Mom\n\n` +
        `✨ <b>Ms. Zain</b> — Luxury Daily Rituals\n` +
        `   Makeup · Fragrances · Hair Care · Body &amp; Bath\n\n` +
        `${BRAND.MINI_DIV}\n` +
        `10,000+ products · 350+ brands · Pharmacist-curated\n` +
        `Free delivery in Amman · asperbeautyshop.com\n\n` +
        `<i>${BRAND.TAGLINE}</i>`;
      await sendKeyboard(chatId, welcome,
        [
          ["🔬 Dr. Sami",  "✨ Ms. Zain"],
          ["🔍 Search",    "💎 Deals"],
          ["📦 Orders",    "📊 Dashboard"],
          ["🏷️ Brands",   "❓ Help"],
        ],
      );
      return new Response("OK");
    }

    case "/help": await send(chatId, getHelp(admin)); return new Response("OK");
    case "/status": await cmdStatus(chatId); return new Response("OK");
    case "/verbose": await cmdVerbose(chatId); return new Response("OK");
    case "/repo": await cmdRepo(chatId, args.toLowerCase()); return new Response("OK");
    case "/sync_threads": await cmdSyncThreads(chatId); return new Response("OK");
    case "/reset":
      await resetConversation(chatId);
      await send(chatId, "✅ Conversation cleared.");
      return new Response("OK");

    // ─── Classic Mode ───
    case "/new":
      if (!AGENTIC_MODE) {
        await resetConversation(chatId);
        cwdMap.delete(chatId);
        await send(chatId, "✅ <b>New session started.</b>\nConversation cleared. Type anything to begin.");
      } else {
        await cmdNewArrivals(chatId);
      }
      return new Response("OK");
    case "/continue": {
      if (!AGENTIC_MODE) {
        const convId = await getOrCreateConversation(chatId);
        const history = await getHistory(convId);
        if (!history.length) {
          await send(chatId, "💬 No active session. Use /new to start one.");
        } else {
          const last = history[history.length - 1];
          await send(chatId,
            `💬 <b>Resuming session</b> (${history.length} messages)\n\nLast message:\n<i>${esc(last.content.slice(0, 200))}</i>`
          );
        }
      }
      return new Response("OK");
    }
    case "/end": {
      if (!AGENTIC_MODE) {
        await resetConversation(chatId);
        cwdMap.delete(chatId);
        await send(chatId, "👋 <b>Session ended.</b>\nHistory cleared. Use /new to start fresh.");
      }
      return new Response("OK");
    }
    case "/cd":    if (!AGENTIC_MODE) await cmdCd(chatId, args); return new Response("OK");
    case "/ls":    if (!AGENTIC_MODE) await cmdLs(chatId); return new Response("OK");
    case "/pwd":   if (!AGENTIC_MODE) await cmdPwd(chatId); return new Response("OK");
    case "/projects": if (!AGENTIC_MODE) await cmdProjectsList(chatId); return new Response("OK");
    case "/export":   if (!AGENTIC_MODE) await cmdExport(chatId); return new Response("OK");
    case "/actions":  await cmdActionsMenu(chatId); return new Response("OK");
    case "/git":      await cmdGitAlias(chatId, args); return new Response("OK");

    // ─── Keyboard shortcuts (new persona-grouped layout) ───
    case "🔬 Dr. Sami": await cmdConcern(chatId, "acne"); return new Response("OK");
    case "✨ Ms. Zain":  await cmdDeals(chatId); return new Response("OK");
    case "🔍 Search":   await send(chatId, `${BRAND.DR_SAMI}: Use <code>/search &lt;keyword&gt;</code> to find products.\n\nExample: <code>/search vitamin C serum</code>`); return new Response("OK");
    case "💎 Deals":    await cmdDeals(chatId); return new Response("OK");
    case "📦 Orders":   await cmdOrders(chatId); return new Response("OK");
    case "📊 Dashboard": await cmdStats(chatId); return new Response("OK");
    case "🏷️ Brands":  await cmdBrands(chatId); return new Response("OK");
    case "❓ Help":     await send(chatId, getHelp(admin)); return new Response("OK");

    // ─── Shopping ───
    case "/search": case "🔍": await cmdSearch(chatId, args); return new Response("OK");
    case "/products": case "🛍️": await cmdProducts(chatId); return new Response("OK");
    case "/brands": case "🏷️": await cmdBrands(chatId); return new Response("OK");
    case "🆕": await cmdNewArrivals(chatId); return new Response("OK");

    // ─── Orders ───
    case "/orders": case "📦": await cmdOrders(chatId); return new Response("OK");
    case "/order": await cmdOrderDetail(chatId, args); return new Response("OK");
    case "/update": {
      const [oid, ...rest] = args.split(" ");
      await cmdUpdateOrder(chatId, oid, rest.join(" "));
      return new Response("OK");
    }

    // ─── Analytics ───
    case "/stats": case "📊": await cmdStats(chatId); return new Response("OK");
    case "/leads": await cmdLeads(chatId); return new Response("OK");
    case "/subscribers": await cmdSubscribers(chatId); return new Response("OK");

    // ─── Management ───
    case "/sync": await cmdSync(chatId); return new Response("OK");
    case "/health": case "❤️": await cmdHealth(chatId); return new Response("OK");
    case "/functions": await cmdEdgeFunctions(chatId); return new Response("OK");

    // ─── Shopping (extended) ───
    case "/concern":  await cmdConcern(chatId, args); return new Response("OK");
    case "/brand":    await cmdBrandSearch(chatId, args); return new Response("OK");
    case "/price":    await cmdPrice(chatId, args); return new Response("OK");
    case "/deals":    await cmdDeals(chatId); return new Response("OK");

    // ─── Admin Orders ───
    case "/cancel":   await cmdCancelOrder(chatId, args); return new Response("OK");

    // ─── Product Management (Admin) ───
    case "/addproduct":    await cmdAddProduct(chatId, args); return new Response("OK");
    case "/editproduct":   await cmdEditProduct(chatId, args); return new Response("OK");
    case "/removeproduct": await cmdRemoveProduct(chatId, args); return new Response("OK");
    case "/listproducts":  await cmdListProducts(chatId, args); return new Response("OK");
    case "/feature":       await cmdFeature(chatId, args); return new Response("OK");
    case "/unfeature":     await cmdUnfeature(chatId, args); return new Response("OK");
    case "/bestseller":    await cmdBestseller(chatId, args); return new Response("OK");

    // ─── Site Config (Admin) ───
    case "/site":          await cmdSiteConfig(chatId, args); return new Response("OK");

    // ─── Admin Analytics ───
    case "/revenue":  await cmdRevenue(chatId); return new Response("OK");

    // ─── Marketing ───
    case "/broadcast":         await cmdBroadcast(chatId, args); return new Response("OK");
    case "/confirm-broadcast": await cmdConfirmBroadcast(chatId); return new Response("OK");

    // ─── Bot Profile ───
    case "/setup-profile": {
      if (!admin) { await send(chatId, "🔒 Admin only."); return new Response("OK"); }
      await cmdSetupProfile(chatId);
      return new Response("OK");
    }

    // ─── AI Concierge (default) ───
    default:
      await handleAI(chatId, text);
      return new Response("OK");
  }
  } catch (err) {
    await adminAlert(err, "Unhandled error in request handler").catch(() => {});
    return new Response("OK"); // Return OK so Telegram doesn't retry
  }
});
