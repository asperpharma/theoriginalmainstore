import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../_lib/supabase";
import { setCors } from "../_lib/cors";
import { checkRateLimit, getClientIp } from "../_lib/rateLimit";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limit: 30 lookups per IP per hour
  const ip = getClientIp(req.headers as Record<string, string | string[] | undefined>);
  const rl = checkRateLimit(`track:${ip}`, 30, 60 * 60 * 1000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const { orderNumber, token } = req.body as { orderNumber: string; token: string };

  if (!orderNumber?.trim() || !token?.trim()) {
    return res.status(400).json({ error: "Order number and token are required" });
  }

  const { data, error } = await supabaseAdmin
    .from("cod_orders")
    .select(
      "order_number, status, items, subtotal, shipping_cost, total, city, area, delivery_address, created_at, updated_at"
    )
    .eq("order_number", orderNumber.trim().toUpperCase())
    .eq("token", token.trim().toUpperCase())
    .maybeSingle();

  if (error) {
    console.error("Track order error:", error);
    return res.status(500).json({ error: "Failed to look up order" });
  }

  if (!data) {
    return res.status(404).json({ error: "Order not found. Please check your order number and access code." });
  }

  return res.status(200).json({ order: data });
}
