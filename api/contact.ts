import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "./_lib/supabase";
import { setCors } from "./_lib/cors";
import { checkRateLimit, getClientIp } from "./_lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limit: 3 messages per IP per 30 minutes
  const ip = getClientIp(req.headers as Record<string, string | string[] | undefined>);
  const rl = checkRateLimit(`contact:${ip}`, 3, 30 * 60 * 1000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const { name, email, message } = req.body as { name?: unknown; email?: unknown; message?: unknown };

  if (
    !name || typeof name !== "string" || name.trim().length < 1 || name.length > 120 ||
    !email || typeof email !== "string" || !EMAIL_RE.test(email) || email.length > 254 ||
    !message || typeof message !== "string" || message.trim().length < 1 || message.length > 2000
  ) {
    return res.status(400).json({ error: "Please fill in all fields correctly." });
  }

  const { error } = await supabaseAdmin
    .from("contact_messages")
    .insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
      ip,
    });

  if (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({ error: "Failed to send message. Please try again." });
  }

  return res.status(200).json({ success: true });
}
