import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../_lib/supabase";
import { setCors } from "../_lib/cors";
import { checkRateLimit, getClientIp } from "../_lib/rateLimit";

interface CartItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

interface CreateOrderBody {
  fullName: string;
  phone: string;
  city: string;
  area?: string;
  address: string;
  paymentMethod: "cod" | "card";
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
}

function generateOrderNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ASP-${ymd}-${rand}`;
}

function generateToken(length = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limit: 10 orders per IP per hour
  const ip = getClientIp(req.headers as Record<string, string | string[] | undefined>);
  const rl = checkRateLimit(`orders:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const body = req.body as CreateOrderBody;

  // Validate required fields and lengths
  if (!body.fullName || !body.phone || !body.city || !body.address || !body.items?.length) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (
    typeof body.fullName !== "string" || body.fullName.length > 120 ||
    typeof body.phone !== "string" || body.phone.length > 20 ||
    typeof body.city !== "string" || body.city.length > 80 ||
    typeof body.address !== "string" || body.address.length > 300 ||
    !Array.isArray(body.items) || body.items.length > 100
  ) {
    return res.status(400).json({ error: "Invalid field values" });
  }

  const orderNumber = generateOrderNumber();
  const token = generateToken();
  const total = body.subtotal + (body.deliveryFee ?? 0);

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      order_number: orderNumber,
      token,
      status: "pending",
      customer_name: body.fullName,
      phone: body.phone,
      city: body.city,
      area: body.area || null,
      delivery_address: body.address,
      payment_method: body.paymentMethod,
      items: body.items,
      subtotal: body.subtotal,
      shipping_cost: body.deliveryFee,
      total,
    })
    .select("id, order_number, token")
    .single();

  if (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ error: "Failed to create order" });
  }

  return res.status(201).json({
    success: true,
    orderNumber: data.order_number,
    token: data.token,
    total,
  });
}
