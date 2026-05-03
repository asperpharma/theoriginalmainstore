#!/bin/bash

# Quick Webhook Setup for YOUR Shopify Store
# Store: asper-beauty-shop-6

echo "🔗 Shopify Webhook Setup - asper-beauty-shop-6"
echo "=============================================="
echo ""
echo "✅ Your webhook function is deployed and ready!"
echo ""
echo "📋 STEP 1: Open This Link"
echo "👉 https://admin.shopify.com/store/asper-beauty-shop-6/settings/notifications"
echo ""
echo "📋 STEP 2: Scroll to 'Webhooks' Section"
echo ""
echo "📋 STEP 3: Click 'Create webhook' and add these 6 webhooks:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Webhook URL (use for ALL 6 webhooks):"
echo "https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat << 'EOF'
┌─────────────────────────────────────────────────────────┐
│  Webhook #1: Product Creation                           │
├─────────────────────────────────────────────────────────┤
│  Event: Product creation                                │
│  Format: JSON                                           │
│  URL: https://vhgwvfedgfmcixhdyttt.supabase.co/...     │
│  API Version: 2025-07                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Webhook #2: Product Update                             │
├─────────────────────────────────────────────────────────┤
│  Event: Product update                                  │
│  Format: JSON                                           │
│  URL: https://vhgwvfedgfmcixhdyttt.supabase.co/...     │
│  API Version: 2025-07                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Webhook #3: Product Deletion                           │
├─────────────────────────────────────────────────────────┤
│  Event: Product deletion                                │
│  Format: JSON                                           │
│  URL: https://vhgwvfedgfmcixhdyttt.supabase.co/...     │
│  API Version: 2025-07                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Webhook #4: Order Creation ⭐ (Telegram Alerts!)      │
├─────────────────────────────────────────────────────────┤
│  Event: Order creation                                  │
│  Format: JSON                                           │
│  URL: https://vhgwvfedgfmcixhdyttt.supabase.co/...     │
│  API Version: 2025-07                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Webhook #5: Order Payment                              │
├─────────────────────────────────────────────────────────┤
│  Event: Order payment                                   │
│  Format: JSON                                           │
│  URL: https://vhgwvfedgfmcixhdyttt.supabase.co/...     │
│  API Version: 2025-07                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Webhook #6: Inventory Update ⭐ (Stock Alerts!)       │
├─────────────────────────────────────────────────────────┤
│  Event: Inventory levels update                         │
│  Format: JSON                                           │
│  URL: https://vhgwvfedgfmcixhdyttt.supabase.co/...     │
│  API Version: 2025-07                                   │
└─────────────────────────────────────────────────────────┘
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 STEP 4: Test Each Webhook"
echo "After creating each webhook:"
echo "  1. Click on the webhook"
echo "  2. Click 'Send test notification'"
echo "  3. Should see ✅ Success"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 What You'll Get:"
echo ""
echo "Telegram Notifications for:"
echo "  🎉 New orders"
echo "  ⚠️  Low stock (< 10 units)"
echo "  🚨 Out of stock"
echo ""
echo "Real-Time Bot Data:"
echo "  /stock  → Live inventory"
echo "  /sales  → Actual revenue"
echo "  /search → Synced products"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Monitor Activity:"
echo "npx supabase functions logs shopify-webhooks -f"
echo ""
echo "✅ Ready! Just add the 6 webhooks in Shopify and you're done!"
echo ""
