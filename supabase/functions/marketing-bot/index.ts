/**
 * marketing-bot — Social Media & Marketing Intelligence Bot
 * Features: Content generation, post scheduling, campaigns, analytics
 * Powered by: Gemini 2.0 Flash for creative content
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MARKETING_BOT_TOKEN = Deno.env.get("MARKETING_BOT_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

// Authorized marketing team Telegram user IDs
const AUTHORIZED_USERS = [
  7690075431, // Mex (Owner)
];

interface TelegramMessage {
  message_id: number;
  from: { id: number; first_name: string; username?: string };
  chat: { id: number };
  text?: string;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Telegram API helpers
async function sendMessage(chatId: number, text: string, options?: Record<string, unknown>) {
  await fetch(`https://api.telegram.org/bot${MARKETING_BOT_TOKEN}/sendMessage`, {
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
  await fetch(`https://api.telegram.org/bot${MARKETING_BOT_TOKEN}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  });
}

function isAuthorized(userId: number): boolean {
  if (AUTHORIZED_USERS.length === 0) {
    console.log(`⚠️ Setup mode: Auto-authorizing first user ${userId}`);
    return true;
  }
  return AUTHORIZED_USERS.includes(userId);
}

// ==================== AI CONTENT GENERATION ====================

async function generateWithGemini(prompt: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Generation failed.";
  } catch (error) {
    console.error("Gemini error:", error);
    return "❌ AI service unavailable.";
  }
}

// ==================== SOCIAL MEDIA CONTENT ====================

async function generatePost(productNameOrTopic: string, platform = "instagram", language = "en") {
  // Fetch product if it's a product name
  const { data: products } = await supabase
    .from("products")
    .select("name, description, brand, category, price")
    .ilike("name", `%${productNameOrTopic}%`)
    .limit(1);

  const product = products?.[0];
  const subject = product ? `product: ${product.name} by ${product.brand}` : `topic: ${productNameOrTopic}`;

  const platformGuidelines = {
    instagram: "Instagram post with engaging caption, emojis, and 5-8 relevant hashtags",
    facebook: "Facebook post with storytelling approach, friendly tone",
    twitter: "Twitter/X post under 280 characters, punchy and attention-grabbing",
    tiktok: "TikTok video script with hook, body, and call-to-action",
    linkedin: "LinkedIn professional post highlighting business benefits",
  };

  const languageInstruction = language === "ar"
    ? "Write in Arabic (العربية) with natural, engaging tone suitable for Arab beauty enthusiasts."
    : "Write in English with engaging, modern tone.";

  const prompt = `You are a creative social media manager for Asper Beauty Shop, a premium beauty e-commerce brand in Jordan.

Create a ${platformGuidelines[platform as keyof typeof platformGuidelines]} for: ${subject}

${product ? `Product Details:
- Name: ${product.name}
- Brand: ${product.brand}
- Category: ${product.category}
- Price: ${product.price} JOD
- Description: ${product.description || "Premium beauty product"}` : ""}

${languageInstruction}

Style: Luxury, aspirational, relatable, authentic. Use emojis naturally. Include call-to-action.

Format:
📝 Caption: [Your engaging caption]
#️⃣ Hashtags: [5-8 relevant hashtags]
💡 Tip: [One pro marketing tip for this post]`;

  return await generateWithGemini(prompt);
}

async function generateCaption(topic: string, tone = "friendly", language = "en") {
  const toneDescriptions = {
    friendly: "warm, approachable, conversational",
    professional: "polished, authoritative, trustworthy",
    playful: "fun, energetic, youthful",
    luxurious: "elegant, sophisticated, aspirational",
    educational: "informative, helpful, expert",
  };

  const languageInstruction = language === "ar"
    ? "Write in Arabic (العربية)"
    : "Write in English";

  const prompt = `Create a compelling Instagram caption for Asper Beauty Shop about: ${topic}

Tone: ${toneDescriptions[tone as keyof typeof toneDescriptions]}
Language: ${languageInstruction}
Length: 2-4 sentences
Include: 2-3 relevant emojis

Make it engaging and authentic. No hashtags in this caption.`;

  return await generateWithGemini(prompt);
}

async function generateHashtags(topic: string, count = 10) {
  const prompt = `Generate ${count} relevant Instagram hashtags for Asper Beauty Shop post about: ${topic}

Requirements:
- Mix of popular (100k-1M posts) and niche hashtags
- Include brand hashtag: #AsperBeautyShop
- Include location: #Jordan #JordanBeauty
- Include product-related hashtags
- No spaces, proper capitalization

Format: List hashtags separated by spaces, e.g. #Skincare #BeautyJordan #GlowingSkin`;

  return await generateWithGemini(prompt);
}

async function generateStoryIdeas(theme: string, count = 5) {
  const prompt = `Generate ${count} creative Instagram Story ideas for Asper Beauty Shop about: ${theme}

For each idea include:
1. 📸 Visual concept (what to show)
2. 💬 Text overlay suggestion
3. 🎯 Interactive element (poll, question, quiz, or slider)

Make them engaging, trendy, and achievable. Format as numbered list.`;

  return await generateWithGemini(prompt);
}

async function generateCampaign(theme: string, duration = "7 days") {
  const prompt = `Create a complete social media campaign plan for Asper Beauty Shop in Jordan.

Campaign Theme: ${theme}
Duration: ${duration}
Platforms: Instagram, Facebook, TikTok

Include:
1. 🎯 Campaign Objective
2. 👥 Target Audience
3. 📅 Content Calendar (day-by-day posting schedule)
4. 📝 Key Messages
5. #️⃣ Campaign Hashtags
6. 💡 Creative Concepts
7. 📊 Success Metrics

Make it actionable and specific to a beauty e-commerce brand in Jordan.`;

  return await generateWithGemini(prompt);
}

// ==================== MARKETING INTELLIGENCE ====================

async function recommendTrending() {
  // Get products with high views but low sales (potential to push)
  const { data: products } = await supabase
    .from("products")
    .select("name, brand, category, price, view_count")
    .order("view_count", { ascending: false })
    .limit(10);

  if (!products || products.length === 0) {
    return "📊 No trending data available yet.";
  }

  const prompt = `As a marketing analyst for Asper Beauty Shop, analyze these trending products and recommend which ones to promote:

${products.map((p, i) => `${i + 1}. ${p.name} (${p.brand}) - ${p.view_count} views, ${p.price} JOD`).join("\n")}

Provide:
1. Top 3 products to promote (with reasoning)
2. Suggested marketing angle for each
3. Target audience
4. Recommended promotion type (discount, bundle, content focus)

Keep it concise and actionable.`;

  return await generateWithGemini(prompt);
}

async function seasonalSuggestions() {
  const month = new Date().getMonth() + 1;
  const season = month >= 6 && month <= 9 ? "summer" : month >= 12 || month <= 2 ? "winter" : "spring/fall";

  const prompt = `It's ${season} in Jordan. As a beauty marketing expert, suggest:

1. 🌟 Top 5 seasonal products to promote (sunscreen, moisturizers, etc.)
2. 📝 Seasonal content themes and angles
3. 🎁 Bundle ideas for this season
4. 💡 Marketing campaigns that fit the weather/mood

Focus on Asper Beauty Shop's dermocosmetic and luxury beauty products. Be specific and actionable.`;

  return await generateWithGemini(prompt);
}

// ==================== COMMAND HANDLER ====================

async function handleCommand(chatId: number, userId: number, text: string, firstName: string) {
  const args = text.split(" ");
  const command = args[0].toLowerCase();

  if (!isAuthorized(userId)) {
    await sendMessage(
      chatId,
      `🚫 *Unauthorized Access*\n\nYour Telegram ID: \`${userId}\`\n\nContact admin for marketing team access.`
    );
    console.log(`⚠️ Unauthorized marketing bot access from ${userId}`);
    return;
  }

  await sendTyping(chatId);

  try {
    let response: string;

    switch (command) {
      case "/start":
        response = `✨ *Marketing Bot - Content & Campaigns*\n\nWelcome, ${firstName}!\n\n*Content Generation:*\n/post [product/topic] - Generate social post\n/caption [topic] - Create caption\n/hashtags [topic] - Get hashtags\n/story [theme] - Story ideas\n\n*Campaigns:*\n/campaign [theme] - Full campaign plan\n\n*Intelligence:*\n/trending - Products to promote\n/seasonal - Seasonal suggestions\n\n*Help:*\n/help - All commands\n/myid - Your Telegram ID`;
        break;

      case "/myid":
        response = `🆔 Your Telegram ID: \`${userId}\``;
        break;

      case "/post":
        if (args.length < 2) {
          response = "❌ Usage: `/post [product name or topic]`\nExample: `/post CeraVe moisturizer`";
        } else {
          response = await generatePost(args.slice(1).join(" "));
        }
        break;

      case "/caption":
        if (args.length < 2) {
          response = "❌ Usage: `/caption [topic]`\nExample: `/caption summer skincare tips`";
        } else {
          response = await generateCaption(args.slice(1).join(" "));
        }
        break;

      case "/hashtags":
        if (args.length < 2) {
          response = "❌ Usage: `/hashtags [topic]`\nExample: `/hashtags anti-aging serum`";
        } else {
          response = await generateHashtags(args.slice(1).join(" "));
        }
        break;

      case "/story":
        if (args.length < 2) {
          response = "❌ Usage: `/story [theme]`\nExample: `/story morning skincare routine`";
        } else {
          response = await generateStoryIdeas(args.slice(1).join(" "));
        }
        break;

      case "/campaign":
        if (args.length < 2) {
          response = "❌ Usage: `/campaign [theme]`\nExample: `/campaign Ramadan beauty essentials`";
        } else {
          response = await generateCampaign(args.slice(1).join(" "));
        }
        break;

      case "/trending":
        response = await recommendTrending();
        break;

      case "/seasonal":
        response = await seasonalSuggestions();
        break;

      case "/help":
        response = `📚 *Marketing Bot Commands*\n\n*📱 Content:*\n/post [topic] - Social media post\n/caption [topic] - Caption only\n/hashtags [topic] - Hashtag research\n/story [theme] - Story ideas\n\n*🎯 Campaigns:*\n/campaign [theme] - Campaign plan\n\n*🧠 Intelligence:*\n/trending - Products to push\n/seasonal - Seasonal ideas\n\n*System:*\n/myid - Your ID\n/help - This message`;
        break;

      default:
        // AI assistant for creative questions
        const creativePrompt = `You are a creative marketing assistant for Asper Beauty Shop. ${text}

Provide creative, actionable marketing advice.`;
        response = await generateWithGemini(creativePrompt);
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
