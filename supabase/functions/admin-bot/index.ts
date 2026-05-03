/**
 * admin-bot — Store Operations & Management Bot
 * Features: Inventory, Sales, Product Management, Website Control
 * Auth: Admin-only access with Telegram user whitelist
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_BOT_TOKEN = Deno.env.get("ADMIN_BOT_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

// Authorized admin Telegram user IDs
const AUTHORIZED_ADMINS = [
  7690075431, // Mex (Owner)
];

interface TelegramMessage {
  message_id: number;
  from: { id: number; first_name: string; username?: string };
  chat: { id: number };
  text?: string;
}

// Create Supabase client with service role (admin access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Telegram API helpers
async function sendMessage(chatId: number, text: string, options?: Record<string, unknown>) {
  await fetch(`https://api.telegram.org/bot${ADMIN_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      ...options,
    }),
  });
}

async function sendTyping(chatId: number) {
  await fetch(`https://api.telegram.org/bot${ADMIN_BOT_TOKEN}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  });
}

// Check if user is authorized admin
function isAuthorized(userId: number): boolean {
  // If whitelist is empty, auto-authorize first user (setup mode)
  if (AUTHORIZED_ADMINS.length === 0) {
    console.log(`⚠️ Setup mode: Auto-authorizing first admin user ${userId}`);
    return true;
  }
  return AUTHORIZED_ADMINS.includes(userId);
}

// ==================== INVENTORY MANAGEMENT ====================

async function checkStock(productName?: string) {
  if (productName) {
    // Check specific product
    const { data, error } = await supabase
      .from("products")
      .select("name, stock_quantity, sku")
      .ilike("name", `%${productName}%`)
      .limit(5);

    if (error || !data || data.length === 0) {
      return `❌ Product "${productName}" not found.`;
    }

    return data.map(p => `📦 *${p.name}*\nSKU: ${p.sku}\nStock: *${p.stock_quantity || 0}* units`).join("\n\n");
  }

  // Get low stock items
  const { data, error } = await supabase
    .from("products")
    .select("name, stock_quantity, sku")
    .lt("stock_quantity", 10)
    .order("stock_quantity", { ascending: true })
    .limit(10);

  if (error || !data || data.length === 0) {
    return "✅ All products are well-stocked!";
  }

  return `⚠️ *LOW STOCK ALERT*\n\n${data.map(p => `📦 ${p.name}\nStock: *${p.stock_quantity}* units\nSKU: ${p.sku}`).join("\n\n")}`;
}

async function updateStock(sku: string, quantity: number) {
  const { data, error } = await supabase
    .from("products")
    .update({ stock_quantity: quantity })
    .eq("sku", sku)
    .select("name, stock_quantity");

  if (error || !data || data.length === 0) {
    return `❌ Product with SKU "${sku}" not found.`;
  }

  return `✅ Updated!\n*${data[0].name}*\nNew stock: *${data[0].stock_quantity}* units`;
}

// ==================== SALES ANALYTICS ====================

async function getSalesToday() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("orders")
    .select("total_amount, status")
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`);

  if (error) {
    return "❌ Error fetching sales data.";
  }

  const totalRevenue = data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const orderCount = data?.length || 0;
  const completedOrders = data?.filter(o => o.status === "completed").length || 0;

  return `📊 *Sales Today (${today})*\n\n💰 Revenue: *${totalRevenue.toFixed(2)} JOD*\n📦 Orders: *${orderCount}*\n✅ Completed: *${completedOrders}*`;
}

async function getSalesWeek() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("orders")
    .select("total_amount, status, created_at")
    .gte("created_at", weekAgo.toISOString())
    .lte("created_at", today.toISOString());

  if (error) {
    return "❌ Error fetching sales data.";
  }

  const totalRevenue = data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const orderCount = data?.length || 0;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  return `📊 *Sales This Week*\n\n💰 Revenue: *${totalRevenue.toFixed(2)} JOD*\n📦 Orders: *${orderCount}*\n📈 Avg Order: *${avgOrderValue.toFixed(2)} JOD*`;
}

async function getTopProducts(limit = 5) {
  const { data, error } = await supabase
    .from("order_items")
    .select("product_id, quantity, products(name)")
    .limit(100);

  if (error || !data) {
    return "❌ Error fetching product data.";
  }

  // Aggregate sales by product
  const productSales = new Map<string, { name: string; quantity: number }>();

  for (const item of data) {
    const productName = (item.products as any)?.name || "Unknown";
    const current = productSales.get(productName) || { name: productName, quantity: 0 };
    current.quantity += item.quantity;
    productSales.set(productName, current);
  }

  const sorted = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);

  if (sorted.length === 0) {
    return "📊 No sales data available yet.";
  }

  return `🏆 *Top ${limit} Products*\n\n${sorted.map((p, i) => `${i + 1}. ${p.name}\n   Sold: *${p.quantity}* units`).join("\n\n")}`;
}

// ==================== PRODUCT MANAGEMENT ====================

async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, stock_quantity, sku")
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
    .limit(5);

  if (error || !data || data.length === 0) {
    return `❌ No products found for "${query}".`;
  }

  return data.map(p =>
    `🔍 *${p.name}*\nID: ${p.id}\nSKU: ${p.sku}\nPrice: ${p.price} JOD\nStock: ${p.stock_quantity || 0}`
  ).join("\n\n");
}

async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return `❌ Product ID ${id} not found.`;
  }

  return `📦 *${data.name}*\n\nID: ${data.id}\nSKU: ${data.sku}\nBrand: ${data.brand || "N/A"}\nPrice: ${data.price} JOD\nStock: ${data.stock_quantity || 0}\nCategory: ${data.category || "N/A"}\nDescription: ${data.description || "N/A"}`;
}

// ==================== AI ASSISTANT ====================

async function askGemini(question: string, context: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an admin assistant for Asper Beauty Shop. ${context}\n\nUser question: ${question}\n\nProvide a concise, actionable answer.`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";
  } catch (error) {
    console.error("Gemini error:", error);
    return "❌ AI assistant temporarily unavailable.";
  }
}

// ==================== COMMAND HANDLER ====================

async function handleCommand(chatId: number, userId: number, text: string, firstName: string) {
  const args = text.split(" ");
  const command = args[0].toLowerCase();

  // Authorization check
  if (!isAuthorized(userId)) {
    await sendMessage(
      chatId,
      `🚫 *Unauthorized Access*\n\nYour Telegram ID: \`${userId}\`\n\nContact the system administrator to grant you access.`
    );
    console.log(`⚠️ Unauthorized access attempt from user ${userId} (${firstName})`);
    return;
  }

  await sendTyping(chatId);

  try {
    let response: string;

    switch (command) {
      // === START ===
      case "/start":
        response = `🎯 *Admin Bot - Store Operations*\n\nWelcome, ${firstName}!\n\n*Inventory Commands:*\n/stock - Check low stock items\n/stock [product] - Check specific product\n/update [sku] [qty] - Update stock\n\n*Sales Analytics:*\n/sales - Today's sales\n/week - Weekly sales\n/top - Top products\n\n*Product Management:*\n/search [query] - Search products\n/product [id] - Get product details\n\n*Help:*\n/help - Show all commands\n/myid - Get your Telegram ID`;
        break;

      // === MY ID ===
      case "/myid":
        response = `🆔 Your Telegram ID: \`${userId}\`\n\nShare this with the admin to get authorized.`;
        break;

      // === INVENTORY ===
      case "/stock":
        response = await checkStock(args.slice(1).join(" "));
        break;

      case "/update":
        if (args.length < 3) {
          response = "❌ Usage: `/update [SKU] [quantity]`\nExample: `/update ABC123 50`";
        } else {
          response = await updateStock(args[1], parseInt(args[2]));
        }
        break;

      // === SALES ===
      case "/sales":
        response = await getSalesToday();
        break;

      case "/week":
        response = await getSalesWeek();
        break;

      case "/top":
        const limit = parseInt(args[1]) || 5;
        response = await getTopProducts(limit);
        break;

      // === PRODUCTS ===
      case "/search":
        if (args.length < 2) {
          response = "❌ Usage: `/search [product name or brand]`";
        } else {
          response = await searchProducts(args.slice(1).join(" "));
        }
        break;

      case "/product":
        if (args.length < 2) {
          response = "❌ Usage: `/product [product ID]`";
        } else {
          response = await getProductById(args[1]);
        }
        break;

      // === HELP ===
      case "/help":
        response = `📚 *Admin Bot Commands*\n\n*📦 Inventory:*\n/stock - Low stock alert\n/stock [name] - Check product stock\n/update [sku] [qty] - Update quantity\n\n*📊 Sales:*\n/sales - Today's sales\n/week - Weekly report\n/top [n] - Top N products\n\n*🔍 Products:*\n/search [query] - Find products\n/product [id] - Product details\n\n*🆔 System:*\n/myid - Your Telegram ID\n/help - This message`;
        break;

      default:
        // AI assistant for natural language queries
        response = await askGemini(text, "You manage inventory, sales, and products for an e-commerce beauty shop.");
        break;
    }

    await sendMessage(chatId, response);
  } catch (error) {
    console.error("Command error:", error);
    await sendMessage(chatId, "❌ An error occurred. Please try again.");
  }
}

// ==================== MAIN HANDLER ====================

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("OK", { status: 200 });
  }

  try {
    const update = await req.json();
    const message = update.message as TelegramMessage | undefined;

    if (!message?.text) {
      return new Response("OK", { status: 200 });
    }

    const { chat, from, text } = message;
    await handleCommand(chat.id, from.id, text, from.first_name);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Handler error:", error);
    return new Response("Error", { status: 500 });
  }
});
