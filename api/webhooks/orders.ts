import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../_lib/supabase";
import { setCors } from "../_lib/cors";

const VALID_STATUSES = [
  "pending", "confirmed", "processing",
  "shipped", "out_for_delivery", "delivered", "cancelled",
] as const;

type OrderStatus = (typeof VALID_STATUSES)[number];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Verify webhook secret
  const secret = req.headers["x-webhook-secret"];
  if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { orderNumber, status, note } = req.body as {
    orderNumber: string;
    status: OrderStatus;
    note?: string;
  };

  if (!orderNumber || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (note) update.delivery_note = note;

  const { error } = await supabaseAdmin
    .from("orders")
    .update(update)
    .eq("order_number", orderNumber.toUpperCase());

  if (error) {
    console.error("Webhook order update error:", error);
    return res.status(500).json({ error: "Failed to update order status" });
  }

  return res.status(200).json({ success: true, orderNumber, status });
}
