# 🤖 Telegram Bots Setup Guide

## Bots Overview

### 1. Admin Bot (@asperbeautyshop_bot or @aws_super_bot)
**Purpose:** Store operations, inventory, sales analytics
**Token:** `8509924253:AAG8vzNZXjsinMRdr1Ib_KODMdGfpdkjSpE`
**Features:**
- Real-time inventory checks
- Stock updates
- Sales analytics (daily/weekly)
- Product search & management
- AI-powered insights via Gemini

### 2. Marketing Bot (@asperbeautyshop_marketing)
**Token:** `8579718200:AAGC1y9Tfo_HaQOcJZu4SoX7owLovvhVVnQ`
**Features:**
- Social media content generation
- Campaign planning
- Trending product analysis
- Hashtag research
- Instagram/Facebook/TikTok posts

---

## 🚀 Deployment Steps

### Step 1: Add Environment Variables

Add to Supabase secrets:

```bash
# Admin Bot
supabase secrets set ADMIN_BOT_TOKEN=8509924253:AAG8vzNZXjsinMRdr1Ib_KODMdGfpdkjSpE

# Marketing Bot  
supabase secrets set MARKETING_BOT_TOKEN=8579718200:AAGC1y9Tfo_HaQOcJZu4SoX7owLovvhVVnQ

# Already exist (verify):
# GEMINI_API_KEY
# SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
```

### Step 2: Deploy Functions

```bash
# Deploy admin bot
supabase functions deploy admin-bot --no-verify-jwt

# Deploy marketing bot
supabase functions deploy marketing-bot --no-verify-jwt
```

### Step 3: Set Up Telegram Webhooks

```bash
# Admin Bot Webhook
curl -X POST "https://api.telegram.org/bot8509924253:AAG8vzNZXjsinMRdr1Ib_KODMdGfpdkjSpE/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/admin-bot"}'

# Marketing Bot Webhook
curl -X POST "https://api.telegram.org/bot8579718200:AAGC1y9Tfo_HaQOcJZu4SoX7owLovvhVVnQ/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/marketing-bot"}'
```

### Step 4: Verify Webhooks

```bash
# Check admin bot
curl "https://api.telegram.org/bot8509924253:AAG8vzNZXjsinMRdr1Ib_KODMdGfpdkjSpE/getWebhookInfo"

# Check marketing bot
curl "https://api.telegram.org/bot8579718200:AAGC1y9Tfo_HaQOcJZu4SoX7owLovvhVVnQ/getWebhookInfo"
```

---

## 📱 Testing the Bots

### Admin Bot Commands

```
/start - Show welcome & commands
/myid - Get your Telegram ID
/stock - Check low stock items
/stock [product name] - Check specific product
/update [sku] [quantity] - Update stock
/sales - Today's sales report
/week - Weekly sales report
/top 5 - Top 5 products
/search [query] - Search products
/product [id] - Get product details
```

### Marketing Bot Commands

```
/start - Show welcome & commands
/post [product/topic] - Generate social media post
/caption [topic] - Create caption
/hashtags [topic] - Get relevant hashtags
/story [theme] - Generate story ideas
/campaign [theme] - Full campaign plan
/trending - Products to promote
/seasonal - Seasonal suggestions
```

---

## 🔐 Security Setup

### Authorize Your Telegram ID

1. Send `/myid` to either bot
2. Copy your Telegram ID (e.g., 7690075431)
3. Add to `AUTHORIZED_ADMINS` array in bot code if needed

Current authorized user:
- Mex: `7690075431`

---

## 🔗 Shopify Integration

### Admin Bot + Shopify

The admin bot currently reads from Supabase `products` and `orders` tables.
For real-time Shopify sync:

1. Ensure `shopify-webhooks` function is active
2. Set up Shopify webhooks for:
   - `products/update`
   - `inventory_levels/update`
   - `orders/create`
   - `orders/paid`

### Webhook URLs (already deployed):
```
https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks
```

---

## 🐛 Troubleshooting

### Bot not responding?
```bash
# Check function logs
supabase functions logs admin-bot
supabase functions logs marketing-bot
```

### Webhook not working?
```bash
# Delete and recreate webhook
curl -X POST "https://api.telegram.org/bot[TOKEN]/deleteWebhook"
curl -X POST "https://api.telegram.org/bot[TOKEN]/setWebhook" \
  -d '{"url": "https://YOUR-PROJECT.supabase.co/functions/v1/FUNCTION-NAME"}'
```

### Unauthorized access?
- Send `/myid` to get your Telegram ID
- Add your ID to `AUTHORIZED_ADMINS` array in function code
- Redeploy: `supabase functions deploy [bot-name]`

---

## 📊 Analytics & Monitoring

### Track bot usage:
```sql
-- Chat transcripts (already set up)
SELECT * FROM chat_transcripts 
WHERE channel = 'telegram' 
ORDER BY created_at DESC LIMIT 50;

-- Product recommendations
SELECT product_ids, detected_concern, COUNT(*) 
FROM chat_transcripts 
WHERE channel = 'telegram' 
GROUP BY product_ids, detected_concern;
```

---

## 🎯 Next Steps

1. ✅ Deploy both bots to Supabase
2. ✅ Set up Telegram webhooks
3. ✅ Test all commands
4. 🔄 Monitor logs for errors
5. 🔄 Add more admin users if needed
6. 🔄 Create custom commands based on usage

