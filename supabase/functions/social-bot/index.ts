/**
 * ASPER BEAUTY SHOP — SOCIAL MEDIA MANAGER BOT
 *
 * Telegram bot for scheduling & managing social media posts.
 *
 * Webhook:
 *   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://mpcxpydkzvwlflxcujnz.supabase.co/functions/v1/social-bot
 *
 * Required secrets:
 *   SOCIAL_BOT_TOKEN, TELEGRAM_CHAT_ID, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Config ───────────────────────────────────────────────────

const BOT_TOKEN = Deno.env.get("SOCIAL_BOT_TOKEN");
if (!BOT_TOKEN) throw new Error("Missing SOCIAL_BOT_TOKEN");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://mpcxpydkzvwlflxcujnz.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const ADMIN_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") || "";
const SITE_URL = Deno.env.get("SITE_URL") || "https://asperbeautyshop.com";
const ASPER_GROUP_ID = Deno.env.get("ASPER_GROUP_ID") || "";

// ─── Brand DNA Visual Tokens ───────────────────────────────────
const BRAND = {
  DIVIDER:  "✦ ─────────────────── ✦",
  MINI_DIV: "◈ ─────── ◈",
  FOOTER:   "\n<i>✦ ASPER.AI · Amman · JOD · Nature Contained.</i>",
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

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function adminAlert(error: unknown, context: string): Promise<void> {
  if (!ADMIN_CHAT_ID) return;
  const msg = `${BRAND.DIVIDER}\n✦ <b>Social Bot · Alert</b>\n${BRAND.DIVIDER}\n\n<b>Where:</b> ${esc(context)}\n<b>Error:</b> ${esc(String(error)).slice(0, 500)}`;
  try { await send(ADMIN_CHAT_ID, msg); } catch { /* silent */ }
}

async function groupNotify(text: string): Promise<void> {
  if (!ASPER_GROUP_ID) return;
  try { await send(ASPER_GROUP_ID, text); } catch { /* silent */ }
}

// ─── Platforms ─────────────────────────────────────────────────

const PLATFORMS = ["instagram", "facebook", "tiktok", "twitter", "linkedin", "pinterest", "snapchat", "youtube"];

// ─── Command Functions ────────────────────────────────────────

async function cmdPost(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  if (!args) {
    return send(chatId,
      `📝 <b>Queue a Post</b>\n\n` +
      `Usage: <code>/post &lt;platform&gt; &lt;text&gt;</code>\n\n` +
      `Platforms: ${PLATFORMS.join(", ")}\n\n` +
      `Example:\n<code>/post instagram Check out our new CeraVe collection! 🌿</code>`
    );
  }
  const spaceIdx = args.indexOf(" ");
  if (spaceIdx === -1) return send(chatId, "❌ Provide both platform and text.\nUsage: <code>/post &lt;platform&gt; &lt;text&gt;</code>");
  const platform = args.slice(0, spaceIdx).toLowerCase();
  const content = args.slice(spaceIdx + 1).trim();
  if (!PLATFORMS.includes(platform)) return send(chatId, `❌ Unknown platform: ${esc(platform)}\nValid: ${PLATFORMS.join(", ")}`);
  if (!content) return send(chatId, "❌ Post content cannot be empty.");

  const { data, error } = await supabase
    .from("social_posts")
    .insert({ platform, content, status: "queued", created_by: chatId })
    .select("id, platform, content, status")
    .single();

  if (error) return send(chatId, `❌ ${esc(error.message)}`);

  await send(chatId,
    `✅ <b>Post Queued</b>\n\n` +
    `📱 Platform: <b>${esc(platform)}</b>\n` +
    `📝 ${esc(content.slice(0, 150))}${content.length > 150 ? "…" : ""}\n` +
    `🆔 <code>${data.id}</code>`
  );
  await groupNotify(`📝 Social post queued: ${esc(platform)} · ${esc(content.slice(0, 60))}…`);
}

async function cmdSchedule(chatId: string, args: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");
  if (!args) {
    return send(chatId,
      `⏰ <b>Schedule a Post</b>\n\n` +
      `Usage: <code>/schedule &lt;platform&gt; &lt;datetime&gt; &lt;text&gt;</code>\n\n` +
      `Datetime format: YYYY-MM-DD HH:MM\n\n` +
      `Example:\n<code>/schedule instagram 2026-04-20 14:00 Spring sale starts now! 🌸</code>`
    );
  }
  const parts = args.split(" ");
  if (parts.length < 4) return send(chatId, "❌ Need: platform, date, time, and text.\nUsage: <code>/schedule &lt;platform&gt; &lt;YYYY-MM-DD&gt; &lt;HH:MM&gt; &lt;text&gt;</code>");

  const platform = parts[0].toLowerCase();
  const dateStr = parts[1];
  const timeStr = parts[2];
  const content = parts.slice(3).join(" ");

  if (!PLATFORMS.includes(platform)) return send(chatId, `❌ Unknown platform: ${esc(platform)}`);

  const scheduledAt = new Date(`${dateStr}T${timeStr}:00`);
  if (isNaN(scheduledAt.getTime())) return send(chatId, "❌ Invalid date/time. Use format: YYYY-MM-DD HH:MM");
  if (scheduledAt.getTime() < Date.now()) return send(chatId, "❌ Scheduled time must be in the future.");

  const { data, error } = await supabase
    .from("social_posts")
    .insert({ platform, content, status: "scheduled", scheduled_at: scheduledAt.toISOString(), created_by: chatId })
    .select("id")
    .single();

  if (error) return send(chatId, `❌ ${esc(error.message)}`);

  await send(chatId,
    `✅ <b>Post Scheduled</b>\n\n` +
    `📱 ${esc(platform)}\n` +
    `⏰ ${scheduledAt.toLocaleString()}\n` +
    `📝 ${esc(content.slice(0, 100))}…\n` +
    `🆔 <code>${data.id}</code>`
  );
  await groupNotify(`⏰ Post scheduled: ${esc(platform)} at ${scheduledAt.toLocaleString()}`);
}

async function cmdQueue(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");

  const { data } = await supabase
    .from("social_posts")
    .select("id, platform, content, status, scheduled_at, created_at")
    .in("status", ["queued", "scheduled"])
    .order("created_at", { ascending: false })
    .limit(15);

  if (!data?.length) return send(chatId, "📋 Queue is empty. Use /post or /schedule to add content.");

  let msg = `${BRAND.DIVIDER}\n◈ <b>POST QUEUE</b> · ${data.length} pending ◈\n${BRAND.DIVIDER}\n\n`;
  data.forEach((p, i) => {
    const statusEmoji = p.status === "scheduled" ? "⏰" : "📝";
    const time = p.scheduled_at ? new Date(p.scheduled_at).toLocaleString() : "ASAP";
    msg += `${statusEmoji} <b>${i + 1}.</b> ${esc(p.platform)}\n`;
    msg += `   ${esc(p.content.slice(0, 60))}${p.content.length > 60 ? "…" : ""}\n`;
    msg += `   📅 ${time} · <code>${String(p.id).slice(0, 8)}</code>\n\n`;
  });
  await send(chatId, msg);
}

async function cmdAccounts(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");

  const { data } = await supabase
    .from("site_config")
    .select("key, value")
    .like("key", "social_%")
    .order("key");

  let msg = `${BRAND.DIVIDER}\n◈ <b>SOCIAL ACCOUNTS</b> ◈\n${BRAND.DIVIDER}\n\n`;

  if (data?.length) {
    data.forEach(a => {
      const platform = a.key.replace("social_", "");
      msg += `🔗 <b>${esc(platform)}</b>: ${esc(a.value)}\n`;
    });
  } else {
    msg += `No accounts configured.\n\n`;
    msg += `Set accounts via site_config:\n`;
    msg += `<code>social_instagram</code> = @username\n`;
    msg += `<code>social_facebook</code> = page URL\n`;
    msg += `<code>social_tiktok</code> = @username\n`;
  }
  await send(chatId, msg);
}

async function cmdAnalytics(chatId: string) {
  if (!isAdmin(chatId)) return send(chatId, "🔒 Admin only.");

  const { count: postedCount } = await supabase.from("social_posts").select("id", { count: "exact", head: true }).eq("status", "posted");
  const { count: queuedCount } = await supabase.from("social_posts").select("id", { count: "exact", head: true }).eq("status", "queued");
  const { count: scheduledCount } = await supabase.from("social_posts").select("id", { count: "exact", head: true }).eq("status", "scheduled");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: recent } = await supabase
    .from("social_posts")
    .select("platform")
    .gte("created_at", thirtyDaysAgo);

  const byPlatform: Record<string, number> = {};
  (recent || []).forEach(p => { byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1; });

  let msg = `${BRAND.DIVIDER}\n◈ <b>SOCIAL ANALYTICS</b> ◈\n${BRAND.DIVIDER}\n\n`;
  msg += `📊 <b>Post Status</b>\n`;
  msg += `  ✅ Posted: <b>${postedCount ?? 0}</b>\n`;
  msg += `  📝 Queued: <b>${queuedCount ?? 0}</b>\n`;
  msg += `  ⏰ Scheduled: <b>${scheduledCount ?? 0}</b>\n\n`;

  if (Object.keys(byPlatform).length) {
    msg += `📱 <b>By Platform (30d)</b>\n`;
    Object.entries(byPlatform).sort((a, b) => b[1] - a[1]).forEach(([p, c]) => {
      msg += `  ${esc(p)}: <b>${c}</b>\n`;
    });
  }

  msg += `\n<i>Full analytics dashboard coming in Phase 2.</i>`;
  await send(chatId, msg);
}

// ─── Help ─────────────────────────────────────────────────────

function getSocialHelp(): string {
  return (
    `${BRAND.DIVIDER}\n◈ <b>SOCIAL BOT COMMANDS</b> ◈\n${BRAND.DIVIDER}\n\n` +
    `📝 /post &lt;platform&gt; &lt;text&gt;\n   Queue a post for publishing\n\n` +
    `⏰ /schedule &lt;platform&gt; &lt;date&gt; &lt;time&gt; &lt;text&gt;\n   Schedule a post for a future time\n\n` +
    `📋 /queue\n   View pending & scheduled posts\n\n` +
    `📊 /analytics\n   Post counts & platform breakdown\n\n` +
    `🔗 /accounts\n   View connected social accounts\n\n` +
    `❓ /help\n   Show this menu\n\n` +
    `<b>Supported platforms:</b>\n${PLATFORMS.join(", ")}` +
    BRAND.FOOTER
  );
}

// ─── Main Router ──────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("OK", { status: 200 });
  }

  try {
    const body = await req.json();
    const msg = body?.message;
    if (!msg?.text) return new Response("OK", { status: 200 });

    const chatId = String(msg.chat.id);
    const text = msg.text.trim();

    await typing(chatId);

    // Parse command and arguments
    const match = text.match(/^\/(\w+)(?:@\S+)?\s*([\s\S]*)$/);
    const cmd = match ? match[1].toLowerCase() : "";
    const args = match ? match[2].trim() : "";

    // ─── Slash commands ─────────────────────────────────
    if (cmd === "start") {
      return respond(async () => {
        await sendKeyboard(chatId,
          `${BRAND.DIVIDER}\n   𝗔𝗦𝗣𝗘𝗥.𝗔𝗜 — Social Media Manager\n${BRAND.DIVIDER}\n\n` +
          `Welcome! Manage social media content & scheduling.\n\n` +
          `📝 Post · ⏰ Schedule · 📋 Queue\n📊 Analytics · 🔗 Accounts`,
          [["📝 Post", "⏰ Schedule"], ["📋 Queue", "📊 Analytics"], ["🔗 Accounts", "❓ Help"]]
        );
      });
    }
    if (cmd === "help") return respond(() => send(chatId, getSocialHelp()));
    if (cmd === "post") return respond(() => cmdPost(chatId, args));
    if (cmd === "schedule") return respond(() => cmdSchedule(chatId, args));
    if (cmd === "queue") return respond(() => cmdQueue(chatId));
    if (cmd === "accounts") return respond(() => cmdAccounts(chatId));
    if (cmd === "analytics") return respond(() => cmdAnalytics(chatId));

    // ─── Keyboard text shortcuts ────────────────────────
    if (text === "📝 Post") return respond(() => cmdPost(chatId, ""));
    if (text === "⏰ Schedule") return respond(() => cmdSchedule(chatId, ""));
    if (text === "📋 Queue") return respond(() => cmdQueue(chatId));
    if (text === "📊 Analytics") return respond(() => cmdAnalytics(chatId));
    if (text === "🔗 Accounts") return respond(() => cmdAccounts(chatId));
    if (text === "❓ Help") return respond(() => send(chatId, getSocialHelp()));

    // ─── Unknown ────────────────────────────────────────
    return respond(() => send(chatId, `Unknown command. Send /help to see available commands.`));
  } catch (err) {
    await adminAlert(err, "social-bot/main");
    return new Response("OK", { status: 200 });
  }
});

/** Fire-and-forget wrapper that always returns 200 to Telegram. */
function respond(fn: () => Promise<void>): Response {
  fn().catch((err) => adminAlert(err, "social-bot/respond"));
  return new Response("OK", { status: 200 });
}
