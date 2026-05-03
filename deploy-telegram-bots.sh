#!/bin/bash

# Telegram Bots Deployment Script
# Deploys admin-bot and marketing-bot to Supabase

set -e

echo "🚀 Deploying Telegram Bots to Supabase..."
echo ""

# Check if we're in the right directory
if [ ! -d "supabase/functions" ]; then
  echo "❌ Error: Run this script from the project root directory"
  exit 1
fi

# Step 1: Set environment variables
echo "📋 Step 1/5: Setting environment variables..."
echo ""
echo "Setting ADMIN_BOT_TOKEN..."
supabase secrets set ADMIN_BOT_TOKEN=8509924253:AAG8vzNZXjsinMRdr1Ib_KODMdGfpdkjSpE

echo "Setting MARKETING_BOT_TOKEN..."
supabase secrets set MARKETING_BOT_TOKEN=8579718200:AAGC1y9Tfo_HaQOcJZu4SoX7owLovvhVVnQ

echo "✅ Environment variables set"
echo ""

# Step 2: Deploy admin bot
echo "📦 Step 2/5: Deploying admin-bot..."
supabase functions deploy admin-bot --no-verify-jwt
echo "✅ Admin bot deployed"
echo ""

# Step 3: Deploy marketing bot
echo "📦 Step 3/5: Deploying marketing-bot..."
supabase functions deploy marketing-bot --no-verify-jwt
echo "✅ Marketing bot deployed"
echo ""

# Step 4: Set up webhooks
echo "🔗 Step 4/5: Setting up Telegram webhooks..."
echo ""

# Admin Bot Webhook
echo "Setting admin bot webhook..."
curl -X POST "https://api.telegram.org/bot8509924253:AAG8vzNZXjsinMRdr1Ib_KODMdGfpdkjSpE/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/admin-bot"}' \
  -s | jq '.'

echo ""

# Marketing Bot Webhook
echo "Setting marketing bot webhook..."
curl -X POST "https://api.telegram.org/bot8579718200:AAGC1y9Tfo_HaQOcJZu4SoX7owLovvhVVnQ/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/marketing-bot"}' \
  -s | jq '.'

echo ""
echo "✅ Webhooks configured"
echo ""

# Step 5: Verify webhooks
echo "✅ Step 5/5: Verifying webhooks..."
echo ""

echo "Admin Bot webhook info:"
curl "https://api.telegram.org/bot8509924253:AAG8vzNZXjsinMRdr1Ib_KODMdGfpdkjSpE/getWebhookInfo" -s | jq '.'
echo ""

echo "Marketing Bot webhook info:"
curl "https://api.telegram.org/bot8579718200:AAGC1y9Tfo_HaQOcJZu4SoX7owLovvhVVnQ/getWebhookInfo" -s | jq '.'
echo ""

echo "🎉 Deployment complete!"
echo ""
echo "📱 Next steps:"
echo "1. Open Telegram and find your bots:"
echo "   - Admin Bot: @asperbeautyshop_bot or @aws_super_bot"
echo "   - Marketing Bot: (create username in BotFather)"
echo ""
echo "2. Send /start to each bot to test"
echo "3. Send /myid to get your Telegram ID"
echo "4. Test commands listed in TELEGRAM_BOTS_SETUP.md"
echo ""
echo "📊 Monitor logs:"
echo "   supabase functions logs admin-bot"
echo "   supabase functions logs marketing-bot"
