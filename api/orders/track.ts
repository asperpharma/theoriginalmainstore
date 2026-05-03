import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../_lib/supabase";
import { setCors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { orderNumber, token } = req.body as { orderNumber: string; token: string };

  if (!orderNumber?.trim() || !token?.trim()) {
    return res.status(400).json({ error: "Order number and token are required" });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
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
