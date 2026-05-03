/**
 * shopify-webhooks — Real-time Shopify Event Handler
 * Syncs products, orders, and inventory from Shopify to Supabase
 * Sends Telegram notifications for critical events
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SHOPIFY_WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET")!;
const ADMIN_BOT_TOKEN = Deno.env.get("ADMIN_BOT_TOKEN");
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID"); // Your Telegram ID: 7690075431

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  tags: string;
  status: string;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    sku: string;
    inventory_quantity: number;
    inventory_item_id: number;
  }>;
  images: Array<{
    id: number;
    src: string;
    position: number;
  }>;
}

interface ShopifyOrder {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  line_items: Array<{
    id: number;
    product_id: number;
    variant_id: number;
    title: string;
    quantity: number;
    price: string;
    sku: string;
  }>;
  shipping_address: {
    first_name: string;
    last_name: string;
    address1: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone: string;
  };
}

interface ShopifyInventoryLevel {
  inventory_item_id: number;
  location_id: number;
  available: number;
  updated_at: string;
}

// ==================== HMAC VERIFICATION ====================

function verifyWebhook(body: string, hmacHeader: string | null): boolean {
  if (!hmacHeader || !SHOPIFY_WEBHOOK_SECRET) {
    console.error("Missing HMAC header or webhook secret");
    return false;
  }

  const hash = createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
    .update(body)
    .digest("base64");

  return hash === hmacHeader;
}

// ==================== TELEGRAM NOTIFICATIONS ====================

async function sendTelegramNotification(message: string) {
  if (!ADMIN_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("Telegram notifications not configured");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${ADMIN_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (error) {
    console.error("Telegram notification failed:", error);
  }
}

// ==================== PRODUCT HANDLERS ====================

async function handleProductUpdate(product: ShopifyProduct) {
  console.log(`Processing product update: ${product.id} - ${product.title}`);

  // Get primary variant (first variant or default)
  const variant = product.variants[0];
  const primaryImage = product.images.find(img => img.position === 1) || product.images[0];

  // Upsert product into Supabase
  const { error } = await supabase
    .from("products")
    .upsert({
      shopify_id: product.id.toString(),
      name: product.title,
      handle: product.handle,
      description: product.body_html?.replace(/<[^>]*>/g, "") || "", // Strip HTML
      brand: product.vendor,
      category: product.product_type,
      price: parseFloat(variant.price),
      sku: variant.sku || `SHOPIFY-${product.id}`,
      stock_quantity: variant.inventory_quantity || 0,
      image_url: primaryImage?.src,
      tags: product.tags.split(",").map(t => t.trim()),
      availability_status: product.status === "active" ? "in_stock" : "out_of_stock",
      updated_at: product.updated_at,
    }, {
      onConflict: "shopify_id",
    });

  if (error) {
    console.error("Product upsert error:", error);
    throw error;
  }

  // Check for low stock alert
  if (variant.inventory_quantity < 10 && product.status === "active") {
    await sendTelegramNotification(
      `⚠️ *Low Stock Alert*\n\n📦 ${product.title}\nStock: *${variant.inventory_quantity}* units\nSKU: ${variant.sku}`
    );
  }

  return { success: true, product_id: product.id };
}

async function handleProductDelete(productId: number) {
  console.log(`Deleting product: ${productId}`);

  const { error } = await supabase
    .from("products")
    .update({ availability_status: "discontinued" })
    .eq("shopify_id", productId.toString());

  if (error) {
    console.error("Product delete error:", error);
    throw error;
  }

  return { success: true, product_id: productId };
}

// ==================== ORDER HANDLERS ====================

async function handleOrderCreate(order: ShopifyOrder) {
  console.log(`Processing new order: ${order.id}`);

  // Create order record
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .upsert({
      shopify_id: order.id.toString(),
      customer_email: order.email,
      customer_name: `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.trim(),
      customer_phone: order.customer?.phone,
      total_amount: parseFloat(order.total_price),
      subtotal_amount: parseFloat(order.subtotal_price),
      tax_amount: parseFloat(order.total_tax),
      currency: order.currency || "JOD",
      status: order.financial_status === "paid" ? "completed" : "pending",
      fulfillment_status: order.fulfillment_status || "unfulfilled",
      shipping_address: order.shipping_address,
      created_at: order.created_at,
    }, {
      onConflict: "shopify_id",
    })
    .select()
    .single();

  if (orderError) {
    console.error("Order upsert error:", orderError);
    throw orderError;
  }

  // Create order items
  for (const item of order.line_items) {
    const { error: itemError } = await supabase
      .from("order_items")
      .upsert({
        order_id: orderData.id,
        product_id: item.product_id.toString(),
        variant_id: item.variant_id.toString(),
        quantity: item.quantity,
        price: parseFloat(item.price),
        sku: item.sku,
      }, {
        onConflict: "order_id,product_id,variant_id",
      });

    if (itemError) {
      console.error("Order item error:", itemError);
    }
  }

  // Send Telegram notification for new order
  const itemsList = order.line_items
    .map(item => `• ${item.title} (x${item.quantity})`)
    .join("\n");

  await sendTelegramNotification(
    `🎉 *New Order Received!*\n\n💰 Total: ${order.total_price} ${order.currency}\n📦 Items:\n${itemsList}\n\n👤 Customer: ${order.customer?.first_name || "Guest"}\n📍 ${order.shipping_address?.city || "N/A"}`
  );

  return { success: true, order_id: order.id };
}

async function handleOrderPaid(order: ShopifyOrder) {
  console.log(`Order paid: ${order.id}`);

  const { error } = await supabase
    .from("orders")
    .update({
      status: "completed",
      financial_status: "paid",
    })
    .eq("shopify_id", order.id.toString());

  if (error) {
    console.error("Order update error:", error);
    throw error;
  }

  return { success: true, order_id: order.id };
}

// ==================== INVENTORY HANDLERS ====================

async function handleInventoryUpdate(inventoryLevel: ShopifyInventoryLevel) {
  console.log(`Updating inventory: Item ${inventoryLevel.inventory_item_id} = ${inventoryLevel.available}`);

  // Find product by inventory_item_id (stored in metadata or variant mapping)
  const { error } = await supabase
    .from("products")
    .update({ stock_quantity: inventoryLevel.available })
    .eq("inventory_item_id", inventoryLevel.inventory_item_id.toString());

  if (error) {
    console.error("Inventory update error:", error);
  }

  // Low stock notification
  if (inventoryLevel.available < 10 && inventoryLevel.available > 0) {
    await sendTelegramNotification(
      `⚠️ *Low Stock Alert*\n\nInventory Item: ${inventoryLevel.inventory_item_id}\nAvailable: *${inventoryLevel.available}* units`
    );
  } else if (inventoryLevel.available === 0) {
    await sendTelegramNotification(
      `🚨 *Out of Stock*\n\nInventory Item: ${inventoryLevel.inventory_item_id}\nStatus: *SOLD OUT*`
    );
  }

  return { success: true, inventory_item_id: inventoryLevel.inventory_item_id };
}

// ==================== MAIN HANDLER ====================

Deno.serve(async (req) => {
  // Health check
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "active", service: "shopify-webhooks" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Read body as text for HMAC verification
    const bodyText = await req.text();
    const hmacHeader = req.headers.get("X-Shopify-Hmac-SHA256");
    const topic = req.headers.get("X-Shopify-Topic");

    console.log(`Received webhook: ${topic}`);

    // Verify webhook authenticity
    if (!verifyWebhook(bodyText, hmacHeader)) {
      console.error("HMAC verification failed");
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse body
    const data = JSON.parse(bodyText);
    let result;

    // Route to appropriate handler
    switch (topic) {
      case "products/create":
      case "products/update":
        result = await handleProductUpdate(data);
        break;

      case "products/delete":
        result = await handleProductDelete(data.id);
        break;

      case "orders/create":
        result = await handleOrderCreate(data);
        break;

      case "orders/paid":
        result = await handleOrderPaid(data);
        break;

      case "inventory_levels/update":
        result = await handleInventoryUpdate(data);
        break;

      default:
        console.log(`Unhandled webhook topic: ${topic}`);
        return new Response(JSON.stringify({ message: "Topic not handled" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
