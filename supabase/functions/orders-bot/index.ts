/**
 * ASPER BEAUTY SHOP — ORDERS BOT
 * Dedicated order management, revenue tracking, and reporting.
 *
 * Webhook:
 *   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/orders-bot
 *
 * Required secrets:
 *   ORDERS_BOT_TOKEN, TELEGRAM_CHAT_ID, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Config ───────────────────────────────────────────────────

const BOT_TOKEN = Deno.env.get("ORDERS_BOT_TOKEN");
if (!BOT_TOKEN) throw new Error("Missing ORDERS_BOT_TOKEN");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://vhgwvfedgfmcixhdyttt.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const ADMIN_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") || "";
const SITE_URL = Deno.env.get("SITE_URL") || "https://asperbeautyshop.com";
const ASPER_GROUP_ID = Deno.env.get("ASPER_GROUP_ID") || "";
const BEAUTY_ASSISTANT_URL = `${SUPABASE_URL}/functions/v1/beauty-assistant`;

// ─── Brand DNA Visual Tokens ───────────────────────────────────
const BRAND = {
  DIVIDER:  "✦ ─────────────────── ✦",
  MINI_DIV: "◈ ─────── ◈",
  FOOTER:   "\n<i>✦ ASPER.AI · Amman · JOD · Nature Contained.</i>",
  TAGLINE:  "Nature Contained. Intelligence Active.",
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

const ORDERS_KEYBOARD = [
  ["📦 Orders", "💰 Revenue"],
  ["📋 Leads", "👤 Customer"],
  ["📊 Report", "❓ Help"],
];

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
    const time = new Date(o.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Amman" });
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

async function cmdUpdateOrder(chatId: string, orderId: string, rawStatus: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  const status = rawStatus.toLowerCase().trim();
  const valid = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!valid.includes(status)) return send(chatId, `❌ Invalid status. Use: ${valid.join(", ")}`);

  const { error } = await supabase.from("cod_orders").update({ status }).eq("id", orderId);
  if (error) return send(chatId, `❌ ${esc(error.message)}`);
  await send(chatId, `✅ Order ${esc(orderId.slice(0, 8))}... updated to <b>${status}</b>`);
  await groupNotify(`📦 Order <b>${esc(orderId.slice(0, 8))}…</b> → <b>${status}</b>`);
}

async function cmdCancelOrder(chatId: string, orderId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
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
  await groupNotify(`🚫 Order cancelled: ${esc(existing.customer_name || "Customer")} · ${(existing.total || 0).toFixed(2)} JOD`);
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

async function cmdCustomer(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  if (!args) return send(chatId, "👤 Usage: <code>/customer &lt;name or phone&gt;</code>");

  const { data } = await supabase
    .from("cod_orders")
    .select("id, customer_name, customer_phone, total, status, created_at, delivery_address")
    .or(`customer_name.ilike.%${args}%,customer_phone.ilike.%${args}%`)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!data?.length) return send(chatId, `👤 No orders found for "<b>${esc(args)}</b>"`);

  const totalSpent = data.reduce((s, o) => s + (o.total || 0), 0);

  let msg = `${BRAND.DIVIDER}\n◈ <b>CUSTOMER LOOKUP</b> ◈\n${BRAND.DIVIDER}\n\n`;
  msg += `👤 <b>${esc(data[0].customer_name || "Unknown")}</b>\n`;
  msg += `📞 ${data[0].customer_phone || "—"}\n`;
  msg += `💰 Total spent: <b>${totalSpent.toFixed(2)} JOD</b> (${data.length} orders)\n\n`;

  data.slice(0, 5).forEach(o => {
    const date = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const emoji = o.status === "delivered" ? "✅" : o.status === "shipped" ? "🚚" : "⏳";
    msg += `${emoji} ${date} · ${(o.total || 0).toFixed(2)} JOD · ${o.status}\n`;
  });

  if (data.length > 5) msg += `\n<i>...${data.length - 5} more orders</i>`;
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

// ─── 📊 REPORTS ───────────────────────────────────────────────

async function cmdReport(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

  const [orders, products, leads, subs] = await Promise.all([
    supabase.from("cod_orders").select("total, status", { count: "exact" }).gte("created_at", today),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("available", true),
    supabase.from("customer_leads").select("id", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("cod_orders").select("total, status", { count: "exact" }).gte("created_at", weekAgo),
  ]);

  const todayRev = (orders.data || []).reduce((s, o) => s + (o.total || 0), 0);
  const todayCount = orders.count || 0;
  const weekRev = (subs.data || []).reduce((s, o) => s + (o.total || 0), 0);
  const weekCount = subs.count || 0;
  const activeProducts = products.count || 0;
  const todayLeads = leads.count || 0;
  const pendingOrders = (orders.data || []).filter(o => o.status === "pending").length;

  let msg = `${BRAND.DIVIDER}\n◈ <b>DAILY REPORT</b> · ${today} ◈\n${BRAND.DIVIDER}\n\n`;
  msg += `📦 <b>Today</b>\n`;
  msg += `   Orders: <b>${todayCount}</b> · Revenue: <b>${todayRev.toFixed(2)} JOD</b>\n`;
  msg += `   Pending: ${pendingOrders} · Leads: ${todayLeads}\n\n`;
  msg += `📅 <b>This Week</b>\n`;
  msg += `   Orders: <b>${weekCount}</b> · Revenue: <b>${weekRev.toFixed(2)} JOD</b>\n`;
  msg += `   Avg/day: ${(weekRev / 7).toFixed(2)} JOD\n\n`;
  msg += `🛍️ Active products: <b>${activeProducts}</b>\n`;
  msg += BRAND.FOOTER;
  await send(chatId, msg);
}

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

// ─── 🏥 HEALTH CHECK ─────────────────────────────────────────

async function cmdHealth(chatId: string) {
  const checks: Array<{ name: string; ok: boolean; detail: string }> = [];

  try {
    const { count } = await supabase.from("products").select("id", { count: "exact", head: true });
    checks.push({ name: "Supabase DB", ok: true, detail: `${count} products` });
  } catch {
    checks.push({ name: "Supabase DB", ok: false, detail: "Connection failed" });
  }

  try {
    const res = await fetch(BEAUTY_ASSISTANT_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: "ping" }] }) });
    checks.push({ name: "AI Concierge", ok: res.ok, detail: res.ok ? "Online" : `HTTP ${res.status}` });
  } catch {
    checks.push({ name: "AI Concierge", ok: false, detail: "Offline" });
  }

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
  msg += `\n🕐 ${new Date().toLocaleString()}`;
  await send(chatId, msg);
}

// ─── ❓ HELP ──────────────────────────────────────────────────

function getOrdersHelp(): string {
  return `${BRAND.DIVIDER}\n◈ <b>ORDERS BOT · Commands</b> ◈\n${BRAND.DIVIDER}\n\n` +
    `📦 <b>Orders</b>\n` +
    `  /orders — Today's orders\n` +
    `  /order &lt;id&gt; — Order details\n` +
    `  /update &lt;id&gt; &lt;status&gt; — Update status\n` +
    `  /cancel &lt;id&gt; — Cancel order\n\n` +
    `📊 <b>Analytics</b>\n` +
    `  /stats — Dashboard overview\n` +
    `  /revenue — Revenue breakdown\n` +
    `  /report — Daily summary\n` +
    `  /topsellers — Top selling products (30d)\n\n` +
    `👤 <b>Customers</b>\n` +
    `  /leads — Today's leads\n` +
    `  /customer &lt;name/phone&gt; — Customer lookup\n\n` +
    `🔧 <b>System</b>\n` +
    `  /health — System health check\n` +
    BRAND.FOOTER;
}

// ─── Router ───────────────────────────────────────────────────

async function handleMessage(chatId: string, text: string) {
  await typing(chatId);

  const lower = text.toLowerCase().trim();
  const parts = lower.split(" ");
  const cmd = parts[0];
  const args = text.slice(cmd.length).trim();

  const isPublic = cmd === "/start" || cmd === "/help" || text === "❓ Help";
  if (!isAdmin(chatId) && !isPublic) {
    return send(chatId, "🔒 Admin only.");
  }

  // Keyboard text mappings
  if (text === "📦 Orders") return cmdOrders(chatId);
  if (text === "💰 Revenue") return cmdRevenue(chatId);
  if (text === "📋 Leads") return cmdLeads(chatId);
  if (text === "👤 Customer") return send(chatId, "👤 Usage: <code>/customer &lt;name or phone&gt;</code>");
  if (text === "📊 Report") return cmdReport(chatId);
  if (text === "❓ Help") return send(chatId, getOrdersHelp());

  // Slash commands
  if (cmd === "/start") {
    return sendKeyboard(chatId,
      `${BRAND.DIVIDER}\n◈ <b>ASPER ORDERS BOT</b> ◈\n${BRAND.DIVIDER}\n\n` +
      `${BRAND.TAGLINE}\n\nManage orders, track revenue, and monitor your business.`,
      ORDERS_KEYBOARD
    );
  }
  if (cmd === "/help") return send(chatId, getOrdersHelp());
  if (cmd === "/orders") return cmdOrders(chatId);
  if (cmd === "/order") return args ? cmdOrderDetail(chatId, args) : send(chatId, "Usage: <code>/order &lt;id&gt;</code>");
  if (cmd === "/update") {
    const updateParts = args.split(" ");
    if (updateParts.length < 2) return send(chatId, "Usage: <code>/update &lt;id&gt; &lt;status&gt;</code>");
    return cmdUpdateOrder(chatId, updateParts[0], updateParts[1]);
  }
  if (cmd === "/cancel") return cmdCancelOrder(chatId, args);
  if (cmd === "/stats") return cmdStats(chatId);
  if (cmd === "/leads") return cmdLeads(chatId);
  if (cmd === "/customer") return cmdCustomer(chatId, args);
  if (cmd === "/revenue") return cmdRevenue(chatId);
  if (cmd === "/report") return cmdReport(chatId);
  if (cmd === "/topsellers") return cmdTopSellers(chatId);
  if (cmd === "/health") return cmdHealth(chatId);

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
    handleMessage(chatId, text).catch((err) => adminAlert(err, `orders-bot:${text.slice(0, 30)}`));
    return new Response("OK");
  };

  try {
    const body = await req.json();

    // Handle callback queries
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
    await adminAlert(err, "orders-bot:serve");
    return new Response("OK");
  }
});
