import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "./_lib/supabase";
import { setCors } from "./_lib/cors";
import { checkRateLimit, getClientIp } from "./_lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limit: 5 subscriptions per IP per 10 minutes
  const ip = getClientIp(req.headers as Record<string, string | string[] | undefined>);
  const rl = checkRateLimit(`newsletter:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    return res.status(429).json({ error: "Too many requests. Please try again shortly." });
  }

  const { email } = req.body as { email?: unknown };

  if (!email || typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Valid email address is required" });
  }

  const { error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .upsert({ email: email.toLowerCase().trim(), subscribed_at: new Date().toISOString() }, { onConflict: "email" });

  if (error) {
    console.error("Newsletter subscribe error:", error);
    return res.status(500).json({ error: "Failed to subscribe" });
  }

  return res.status(200).json({ success: true });
}
