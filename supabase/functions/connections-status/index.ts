/**
 * connections-status — Single endpoint that reports the live connection state
 * of every channel wired to Asper Beauty Shop:
 *
 *   shopify  · meta (FB Page + IG Graph) · whatsapp · telegram · slack · gemini
 *
 * For each channel we (a) confirm the required secrets are present and
 * (b) do a lightweight read-only ping against the platform API so the admin
 * UI can show a real green/red indicator instead of a guess.
 *
 * Returns 200 JSON regardless of channel health — the per-channel `status`
 * field carries the result. Never throws, so cold-start failures won't break
 * the admin Connections page.
 */

const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") || "https://mpcxpydkzvwlflxcujnz.supabase.co";
const META_GRAPH_VERSION = Deno.env.get("META_GRAPH_VERSION") || "v19.0";
const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;
const GEMINI_API_VERSION = Deno.env.get("GEMINI_API_VERSION") || "v1beta";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

type Status = "connected" | "missing_secrets" | "error" | "unknown";

interface ChannelReport {
  channel: string;
  label: string;
  status: Status;
  detail?: string;
  webhook_url?: string;
  required_secrets: string[];
  missing_secrets: string[];
  meta?: Record<string, unknown>;
}

const fnUrl = (name: string, qs = "") =>
  `${SUPABASE_URL}/functions/v1/${name}${qs}`;

function checkSecrets(names: string[]): {
  missing: string[];
  values: Record<string, string | undefined>;
} {
  const values: Record<string, string | undefined> = {};
  const missing: string[] = [];
  for (const n of names) {
    const v = Deno.env.get(n);
    values[n] = v;
    if (!v) missing.push(n);
  }
  return { missing, values };
}

async function safeFetch(
  url: string,
  init?: RequestInit,
  timeoutMs = 6000,
): Promise<{ ok: boolean; status: number; data: unknown; error?: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    let data: unknown = null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      data = await res.json().catch(() => null);
    } else {
      data = await res.text().catch(() => null);
    }
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: e instanceof Error ? e.message : String(e),
    };
  } finally {
    clearTimeout(t);
  }
}

async function checkShopify(): Promise<ChannelReport> {
  const required = [
    "SHOPIFY_ACCESS_TOKEN",
    "SHOPIFY_STORE_DOMAIN",
    "SHOPIFY_API_VERSION",
  ];
  const { missing, values } = checkSecrets(required);
  const report: ChannelReport = {
    channel: "shopify",
    label: "Shopify Storefront & Admin",
    status: "unknown",
    required_secrets: required,
    missing_secrets: missing,
    webhook_url: fnUrl("shopify-webhooks"),
  };
  if (missing.length) {
    report.status = "missing_secrets";
    report.detail = `Set ${missing.join(", ")} in Supabase Edge Function secrets.`;
    return report;
  }
  const domain = values.SHOPIFY_STORE_DOMAIN!;
  const ver = values.SHOPIFY_API_VERSION!;
  const r = await safeFetch(
    `https://${domain}/admin/api/${ver}/shop.json`,
    { headers: { "X-Shopify-Access-Token": values.SHOPIFY_ACCESS_TOKEN! } },
  );
  if (r.ok && r.data && typeof r.data === "object" && "shop" in r.data) {
    const shop = (r.data as { shop: { name: string; myshopify_domain: string } })
      .shop;
    report.status = "connected";
    report.detail = `Linked to ${shop.name} (${shop.myshopify_domain})`;
    report.meta = { shop_name: shop.name, domain: shop.myshopify_domain };
  } else {
    report.status = "error";
    report.detail = `Shopify Admin returned HTTP ${r.status}${r.error ? `: ${r.error}` : ""}`;
  }
  return report;
}

async function checkMeta(): Promise<ChannelReport[]> {
  const required = ["META_VERIFY_TOKEN", "META_PAGE_ACCESS_TOKEN"];
  const { missing, values } = checkSecrets(required);
  const webhook = fnUrl("meta-bot");

  const facebook: ChannelReport = {
    channel: "meta_facebook",
    label: "Facebook Messenger / Page",
    status: "unknown",
    required_secrets: required,
    missing_secrets: missing,
    webhook_url: webhook,
  };
  const instagram: ChannelReport = {
    channel: "meta_instagram",
    label: "Instagram DMs / Graph",
    status: "unknown",
    required_secrets: required,
    missing_secrets: missing,
    webhook_url: webhook,
  };

  if (missing.length) {
    const detail = `Set ${missing.join(", ")} in Supabase Edge Function secrets.`;
    facebook.status = "missing_secrets";
    facebook.detail = detail;
    instagram.status = "missing_secrets";
    instagram.detail = detail;
    return [facebook, instagram];
  }

  const tok = values.META_PAGE_ACCESS_TOKEN!;
  const me = await safeFetch(
    `${META_GRAPH_BASE}/me?fields=id,name,instagram_business_account&access_token=${encodeURIComponent(tok)}`,
  );
  if (me.ok && me.data && typeof me.data === "object" && "id" in me.data) {
    const d = me.data as {
      id: string;
      name?: string;
      instagram_business_account?: { id: string };
    };
    facebook.status = "connected";
    facebook.detail = `Page "${d.name ?? d.id}" linked.`;
    facebook.meta = { page_id: d.id, page_name: d.name };
    if (d.instagram_business_account?.id) {
      instagram.status = "connected";
      instagram.detail = `IG business account ${d.instagram_business_account.id} linked to page.`;
      instagram.meta = { ig_account_id: d.instagram_business_account.id };
    } else {
      instagram.status = "error";
      instagram.detail =
        "Page is linked but no Instagram Business Account is attached. Connect IG → FB Page in Meta Business Suite.";
    }
  } else {
    const errMsg =
      me.data && typeof me.data === "object" && "error" in me.data
        ? JSON.stringify((me.data as { error: unknown }).error)
        : `HTTP ${me.status}`;
    facebook.status = "error";
    facebook.detail = `Meta Graph rejected the page token: ${errMsg}`;
    instagram.status = "error";
    instagram.detail = facebook.detail;
  }
  return [facebook, instagram];
}

async function checkWhatsApp(): Promise<ChannelReport> {
  const required = ["META_PAGE_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"];
  const { missing, values } = checkSecrets(required);
  const report: ChannelReport = {
    channel: "whatsapp",
    label: "WhatsApp Business (+962 79 065 6666)",
    status: "unknown",
    required_secrets: required,
    missing_secrets: missing,
    webhook_url: fnUrl("meta-bot"),
  };
  if (missing.length) {
    report.status = "missing_secrets";
    report.detail = `Set ${missing.join(", ")} in Supabase Edge Function secrets.`;
    return report;
  }
  const r = await safeFetch(
    `${META_GRAPH_BASE}/${values.WHATSAPP_PHONE_NUMBER_ID}?fields=display_phone_number,verified_name,quality_rating&access_token=${encodeURIComponent(values.META_PAGE_ACCESS_TOKEN!)}`,
  );
  if (r.ok && r.data && typeof r.data === "object" && "display_phone_number" in r.data) {
    const d = r.data as {
      display_phone_number: string;
      verified_name?: string;
      quality_rating?: string;
    };
    report.status = "connected";
    report.detail = `Number ${d.display_phone_number}${d.verified_name ? ` ("${d.verified_name}")` : ""}, quality ${d.quality_rating ?? "n/a"}.`;
    report.meta = d as unknown as Record<string, unknown>;
  } else {
    const errMsg =
      r.data && typeof r.data === "object" && "error" in r.data
        ? JSON.stringify((r.data as { error: unknown }).error)
        : `HTTP ${r.status}`;
    report.status = "error";
    report.detail = `WhatsApp Cloud API rejected the request: ${errMsg}`;
  }
  return report;
}

async function checkTelegram(): Promise<ChannelReport[]> {
  const reports: ChannelReport[] = [];
  for (const [chan, label, secretName, hookFn] of [
    ["telegram_bot", "Telegram — Concierge Bot", "TELEGRAM_BOT_TOKEN", "telegram-bot"],
    ["telegram_notify", "Telegram — Notification Bot", "TELEGRAM_BOT_TOKEN", "telegram-notify"],
    ["telegram_social", "Telegram — Social Scheduler", "SOCIAL_BOT_TOKEN", "social-bot"],
    ["telegram_marketing", "Telegram — Marketing Bot", "MARKETING_BOT_TOKEN", "marketing-bot"],
    ["telegram_orders", "Telegram — Orders Bot", "ORDERS_BOT_TOKEN", "orders-bot"],
    ["telegram_support", "Telegram — Support Bot", "SUPPORT_BOT_TOKEN", "support-bot"],
  ] as const) {
    const tok = Deno.env.get(secretName);
    const r: ChannelReport = {
      channel: chan,
      label,
      status: "unknown",
      required_secrets: [secretName],
      missing_secrets: tok ? [] : [secretName],
      webhook_url: fnUrl(hookFn),
    };
    if (!tok) {
      r.status = "missing_secrets";
      r.detail = `Set ${secretName} in Supabase Edge Function secrets, then call setWebhook on the bot pointing at the URL above.`;
      reports.push(r);
      continue;
    }
    const ping = await safeFetch(`https://api.telegram.org/bot${tok}/getMe`);
    if (
      ping.ok &&
      ping.data &&
      typeof ping.data === "object" &&
      (ping.data as { ok?: boolean }).ok
    ) {
      const u = (ping.data as { result: { username: string; first_name: string } })
        .result;
      r.status = "connected";
      r.detail = `Bot @${u.username} ("${u.first_name}") is alive.`;
      r.meta = u as unknown as Record<string, unknown>;
      const wh = await safeFetch(
        `https://api.telegram.org/bot${tok}/getWebhookInfo`,
      );
      if (
        wh.ok &&
        wh.data &&
        typeof wh.data === "object" &&
        (wh.data as { ok?: boolean }).ok
      ) {
        const info = (wh.data as { result: { url: string; pending_update_count: number } })
          .result;
        r.meta = { ...r.meta, webhook: info };
        if (!info.url) {
          r.detail += ` ⚠ No webhook set — POST to https://api.telegram.org/bot<token>/setWebhook?url=${encodeURIComponent(r.webhook_url!)}`;
        } else if (info.url !== r.webhook_url) {
          r.detail += ` ⚠ Webhook points to ${info.url} (expected ${r.webhook_url}).`;
        }
      }
    } else {
      r.status = "error";
      r.detail = `Telegram getMe failed (HTTP ${ping.status}). Token may be revoked.`;
    }
    reports.push(r);
  }
  return reports;
}

async function checkSlack(): Promise<ChannelReport> {
  const required = ["SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET"];
  const { missing, values } = checkSecrets(required);
  const report: ChannelReport = {
    channel: "slack",
    label: "Slack Workspace Bot",
    status: "unknown",
    required_secrets: required,
    missing_secrets: missing,
    webhook_url: fnUrl("slack-bot"),
  };
  if (missing.length) {
    report.status = "missing_secrets";
    report.detail = `Set ${missing.join(", ")} in Supabase Edge Function secrets.`;
    return report;
  }
  const r = await safeFetch("https://slack.com/api/auth.test", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${values.SLACK_BOT_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  if (
    r.ok &&
    r.data &&
    typeof r.data === "object" &&
    (r.data as { ok?: boolean }).ok
  ) {
    const d = r.data as { team: string; user: string; team_id: string };
    report.status = "connected";
    report.detail = `Connected to workspace "${d.team}" as ${d.user}.`;
    report.meta = d as unknown as Record<string, unknown>;
  } else {
    const err =
      r.data && typeof r.data === "object" && "error" in r.data
        ? (r.data as { error: string }).error
        : `HTTP ${r.status}`;
    report.status = "error";
    report.detail = `Slack auth.test failed: ${err}`;
  }
  return report;
}

async function checkGemini(): Promise<ChannelReport> {
  const required = ["GEMINI_API_KEY"];
  const { missing, values } = checkSecrets(required);
  const report: ChannelReport = {
    channel: "gemini",
    label: "Google Gemini (AI brain)",
    status: "unknown",
    required_secrets: required,
    missing_secrets: missing,
  };
  if (missing.length) {
    report.status = "missing_secrets";
    report.detail = `Set ${missing.join(", ")} in Supabase Edge Function secrets.`;
    return report;
  }
  const r = await safeFetch(
    `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models?key=${encodeURIComponent(values.GEMINI_API_KEY!)}`,
  );
  if (r.ok) {
    report.status = "connected";
    report.detail = "Gemini API key validated against models endpoint.";
  } else {
    report.status = "error";
    report.detail = `Gemini rejected key (HTTP ${r.status}).`;
  }
  return report;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const [shopify, meta, whatsapp, telegram, slack, gemini] = await Promise.all([
      checkShopify(),
      checkMeta(),
      checkWhatsApp(),
      checkTelegram(),
      checkSlack(),
      checkGemini(),
    ]);

    const channels: ChannelReport[] = [
      shopify,
      ...meta,
      whatsapp,
      ...telegram,
      slack,
      gemini,
    ];

    const summary = {
      total: channels.length,
      connected: channels.filter((c) => c.status === "connected").length,
      missing_secrets: channels.filter((c) => c.status === "missing_secrets").length,
      error: channels.filter((c) => c.status === "error").length,
    };

    return new Response(
      JSON.stringify({
        generated_at: new Date().toISOString(),
        domain: "https://asperbeautyshop.com",
        whatsapp_number: "+962790656666",
        summary,
        channels,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : String(e),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
