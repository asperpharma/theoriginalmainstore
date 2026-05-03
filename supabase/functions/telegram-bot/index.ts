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
const conversations = new Map<string, Array<{ role: string; content: string }>>();

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

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── 📦 ORDERS ───────────────────────────────────────────────

async function cmdOrders(chatId: string) {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("cod_orders")
    .select("id, customer_name, customer_phone, total_amount, status, delivery_address, created_at, items")
    .gte("created_at", today)
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) return send(chatId, `❌ Error: ${esc(error.message)}`);
  if (!data?.length) return send(chatId, "📦 <b>No orders today yet.</b>\n\nWaiting for the first order...");

  const revenue = data.reduce((s, o) => s + (o.total_amount || 0), 0);
  const pending = data.filter((o) => o.status === "pending").length;
  const shipped = data.filter((o) => o.status === "shipped").length;
  const delivered = data.filter((o) => o.status === "delivered").length;

  let msg = `📦 <b>Today's Orders</b> — ${data.length} total\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 Revenue: <b>${revenue.toFixed(2)} JOD</b>\n`;
  msg += `⏳ Pending: ${pending}  🚚 Shipped: ${shipped}  ✅ Delivered: ${delivered}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  for (const o of data.slice(0, 8)) {
    const emoji = o.status === "delivered" ? "✅" : o.status === "shipped" ? "🚚" : "⏳";
    const time = new Date(o.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    msg += `${emoji} <b>${esc(o.customer_name || "Customer")}</b>\n`;
    msg += `   📞 ${o.customer_phone || "—"}  💰 ${(o.total_amount || 0).toFixed(2)} JOD\n`;
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

  let msg = `📋 <b>Order Detail</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🆔 ${data.id}\n`;
  msg += `👤 ${esc(data.customer_name || "—")}\n`;
  msg += `📞 ${data.customer_phone || "—"}\n`;
  msg += `📍 ${esc(data.delivery_address || "—")}\n`;
  msg += `💰 ${(data.total_amount || 0).toFixed(2)} JOD\n`;
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
    supabase.from("cod_orders").select("total_amount").gte("created_at", today),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
  ]);

  const todayRevenue = (todayRev.data || []).reduce((s, o) => s + (o.total_amount || 0), 0);

  let msg = `📊 <b>ASPER BEAUTY — DASHBOARD</b>\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
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

  let msg = `👤 <b>Today's Leads</b> — ${data.length}\n━━━━━━━━━━━━━━━━━━━━\n\n`;
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

  let msg = `🏆 <b>Top 10 Best Sellers</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  data.forEach((p, i) => {
    msg += `<b>${i + 1}.</b> ${esc(p.title)}\n`;
    msg += `   🏷️ ${esc(p.brand || "—")} — <b>${(p.price || 0).toFixed(2)} JOD</b>\n\n`;
  });
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

  let msg = `🔍 <b>Results for "${esc(query)}"</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
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

  let msg = `🏷️ <b>Our Brands</b> (${data.length})\n━━━━━━━━━━━━━━━━━━━━\n\n`;
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

  let msg = `🆕 <b>New Arrivals</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
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
  let msg = `${allOk ? "✅" : "⚠️"} <b>System Health Check</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  for (const c of checks) {
    msg += `${c.ok ? "✅" : "❌"} <b>${c.name}</b>: ${esc(c.detail)}\n`;
  }
  msg += `\n🕐 ${new Date().toLocaleString()}`;
  await send(chatId, msg);
}

async function cmdEdgeFunctions(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");

  const functions = [
    "beauty-assistant", "sync-shopify-catalog", "asper-intelligence",
    "concierge-tip", "ai-product-search", "telegram-bot", "telegram-notify",
    "send-email", "sitemap", "meta-bot", "meta-capi",
  ];

  let msg = `⚡ <b>Edge Functions</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  for (const fn of functions) {
    msg += `• <code>${fn}</code>\n`;
  }
  msg += `\nTotal: <b>${functions.length}</b> functions`;
  await send(chatId, msg);
}

// ─── 📢 MARKETING ─────────────────────────────────────────────

async function cmdBroadcast(chatId: string, message: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  if (!message) return send(chatId, "📢 Usage: <code>/broadcast Your message</code>");

  // Get subscriber count
  const { count } = await supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true });

  await send(chatId, `📢 <b>Broadcast Preview</b>\n━━━━━━━━━━━━━━━━━━━━\n\n${esc(message)}\n\n📧 Would reach <b>${count || 0}</b> subscribers.\n\n<i>To send: /confirm-broadcast</i>`);
}

async function cmdSubscribers(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");

  const { count: total } = await supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true });
  const today = new Date().toISOString().split("T")[0];
  const { count: todayCount } = await supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).gte("created_at", today);

  const { data: recent } = await supabase
    .from("newsletter_subscribers")
    .select("email, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  let msg = `📧 <b>Newsletter Subscribers</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
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

// ─── 🤖 AI CONCIERGE ─────────────────────────────────────────

async function handleAI(chatId: string, text: string) {
  const history = conversations.get(chatId) || [];
  history.push({ role: "user", content: text });
  if (history.length > 12) history.splice(0, history.length - 12);

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
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const textBlock = data.content?.find((b: Record<string, unknown>) => b.type === "text");
        reply = textBlock?.text || reply;
        history.push({ role: "assistant", content: reply });
        conversations.set(chatId, history);
        await send(chatId, reply);
        return;
      }
      console.error("Claude API error:", res.status, await res.text());
    } catch (err) {
      console.error("Claude API error:", err);
    }
  }

  // Fallback: beauty-assistant (Gemini)
  try {
    const res = await fetch(BEAUTY_ASSISTANT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    if (res.ok) {
      const data = await res.json();
      reply = data.reply || reply;
      history.push({ role: "assistant", content: reply });
      conversations.set(chatId, history);
    }
  } catch (err) {
    console.error("Fallback AI error:", err);
  }
  await send(chatId, reply);
}

// ─── HELP & MENUS ─────────────────────────────────────────────

function getHelp(admin: boolean): string {
  let msg = `🤖 <b>ASPER BEAUTY — COMMAND CENTER</b>\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `💬 <b>Shopping & AI</b>\n`;
  msg += `  /search &lt;keyword&gt; — Find products\n`;
  msg += `  /products — Top bestsellers\n`;
  msg += `  /brands — All brands\n`;
  msg += `  /new — New arrivals\n`;
  msg += `  <i>Or just type naturally!</i>\n\n`;

  if (admin) {
    msg += `📦 <b>Orders</b>\n`;
    msg += `  /orders — Today's orders\n`;
    msg += `  /order &lt;id&gt; — Order detail\n`;
    msg += `  /update &lt;id&gt; &lt;status&gt; — Update order\n\n`;
    msg += `📊 <b>Analytics</b>\n`;
    msg += `  /stats — Full dashboard\n`;
    msg += `  /leads — Today's leads\n`;
    msg += `  /subscribers — Newsletter stats\n\n`;
    msg += `🔧 <b>Management</b>\n`;
    msg += `  /sync — Sync Shopify catalog\n`;
    msg += `  /health — System health check\n`;
    msg += `  /functions — Edge functions list\n\n`;
    msg += `📢 <b>Marketing</b>\n`;
    msg += `  /broadcast &lt;msg&gt; — Send broadcast\n\n`;
  }

  msg += `⚙️ <b>General</b>\n`;
  msg += `  /start — Welcome\n`;
  msg += `  /reset — Clear conversation\n`;
  msg += `  /help — This menu\n\n`;
  msg += `💡 <i>Type any beauty question to chat with Dr. Sami &amp; Ms. Zain!</i>`;
  return msg;
}

// ─── MAIN ROUTER ──────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("OK", { status: 200 });

  let update: Record<string, unknown>;
  try { update = await req.json(); } catch { return new Response("Bad", { status: 400 }); }

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
    case "/start":
      await sendKeyboard(chatId,
        `✨ <b>Welcome to Asper Beauty, ${esc(firstName)}!</b>\n\n` +
        `I'm your personal beauty command center.\n\n` +
        `🛍️ <b>10,000+</b> products from <b>350+</b> brands\n` +
        `🔬 Pharmacist-curated skincare\n` +
        `🤖 AI-powered by Dr. Sami &amp; Ms. Zain\n\n` +
        `Type /help for all commands, or just tell me your skin concern!`,
        [
          ["🛍️ /products", "🔍 /search"],
          ["📦 /orders", "📊 /stats"],
          ["🏷️ /brands", "🆕 /new"],
          ["❤️ /health", "❓ /help"],
        ],
      );
      return new Response("OK");

    case "/help": await send(chatId, getHelp(admin)); return new Response("OK");
    case "/reset":
      conversations.delete(chatId);
      await send(chatId, "✅ Conversation cleared.");
      return new Response("OK");

    // ─── Shopping ───
    case "/search": case "🔍": await cmdSearch(chatId, args); return new Response("OK");
    case "/products": case "🛍️": await cmdProducts(chatId); return new Response("OK");
    case "/brands": case "🏷️": await cmdBrands(chatId); return new Response("OK");
    case "/new": case "🆕": await cmdNewArrivals(chatId); return new Response("OK");

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

    // ─── Marketing ───
    case "/broadcast": await cmdBroadcast(chatId, args); return new Response("OK");

    // ─── AI Concierge (default) ───
    default:
      await handleAI(chatId, text);
      return new Response("OK");
  }
});
