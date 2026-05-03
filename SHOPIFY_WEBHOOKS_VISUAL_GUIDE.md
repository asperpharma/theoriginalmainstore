# 🎯 Shopify Webhooks - Visual Setup Guide

## Quick Start (5 Minutes)

### Step 1: Open Shopify Admin
🔗 **Go to:** https://lovable-project-milns.myshopify.com/admin/settings/notifications

### Step 2: Scroll to Webhooks Section
Look for the **"Webhooks"** section at the bottom of the page.

### Step 3: Create Each Webhook

Click **"Create webhook"** and fill in:

---

## 📦 Webhook #1: Product Creation

```
Event: Product creation
Format: JSON
URL: https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks
API Version: 2025-07
```

**What it does:** Syncs new products to your Telegram bots

---

## ✏️ Webhook #2: Product Update

```
Event: Product update
Format: JSON
URL: https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks
API Version: 2025-07
```

**What it does:** Updates product info in real-time (price, stock, description)

---

## 🗑️ Webhook #3: Product Deletion

```
Event: Product deletion
Format: JSON
URL: https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks
API Version: 2025-07
```

**What it does:** Marks products as discontinued

---

## 🛒 Webhook #4: Order Creation

```
Event: Order creation
Format: JSON
URL: https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks
API Version: 2025-07
```

**What it does:** 
- Sends you Telegram notification: "🎉 New Order Received!"
- Updates sales analytics in admin bot

---

## 💳 Webhook #5: Order Payment

```
Event: Order payment
Format: JSON
URL: https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks
API Version: 2025-07
```

**What it does:** Updates order status when payment is confirmed

---

## 📊 Webhook #6: Inventory Update

```
Event: Inventory levels update
Format: JSON
URL: https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks
API Version: 2025-07
```

**What it does:**
- Updates stock levels in real-time
- Sends "⚠️ Low Stock Alert" when < 10 units
- Sends "🚨 OUT OF STOCK" when inventory = 0

---

## ✅ After Creating All Webhooks

### Test Each One:

1. Click on a webhook in the list
2. Click **"Send test notification"**
3. Look for ✅ **Success** status

### Monitor Activity:

```bash
# Watch logs in real-time
npx supabase functions logs shopify-webhooks --project-ref vhgwvfedgfmcixhdyttt -f
```

---

## 🎉 Expected Results

Once webhooks are active, you'll receive **instant Telegram notifications** for:

### New Orders
```
🎉 New Order Received!

💰 Total: 45.00 JOD
📦 Items:
• CeraVe Moisturizer (x1)
• La Roche-Posay Sunscreen (x2)

👤 Customer: Ahmed
📍 Amman
```

### Low Stock
```
⚠️ Low Stock Alert

📦 CeraVe Hydrating Cleanser
Stock: 8 units
SKU: CRV-HYD-001
```

### Out of Stock
```
🚨 Out of Stock

Inventory Item: 789456123
Status: SOLD OUT
```

---

## 🔍 Verify Webhooks Work

### In Telegram Admin Bot:

```
/stock
→ Should show current inventory from Shopify

/sales
→ Should show today's orders from Shopify

/search CeraVe
→ Should find products synced from Shopify
```

### In Shopify Admin:

- Go to Settings → Notifications → Webhooks
- Each webhook shows delivery success rate
- Green checkmarks = working correctly
- Red errors = check function logs

---

## 🐛 Troubleshooting

### Webhook Shows "Failed" Status

**Check function logs:**
```bash
npx supabase functions logs shopify-webhooks
```

**Common issues:**
- Function not deployed → Redeploy
- HMAC verification failed → Check webhook secret
- Database error → Check table schema

### No Telegram Notifications

**Verify settings:**
```bash
# Check if admin chat ID is set
# Should be: 7690075431
```

**Test manually:**
- Send `/start` to @asperbeautyshop_bot
- If bot responds, Telegram integration works
- If no notifications, check TELEGRAM_ADMIN_CHAT_ID secret

### Data Not Syncing

**Check database tables exist:**
- `products` table
- `orders` table
- `order_items` table

**Verify columns match the schema in SHOPIFY_WEBHOOKS_SETUP.md**

---

## 📊 Success Metrics

After 24 hours with webhooks active, you should see:

✅ Real-time product updates  
✅ Orders appearing in `/sales` command  
✅ Telegram notifications for new orders  
✅ Stock levels updating automatically  
✅ Low stock alerts sent when appropriate

---

## 🎯 Quick Reference

**Webhook URL:** `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks`

**Your Store:** `lovable-project-milns.myshopify.com`

**API Version:** `2025-07`

**Format:** `JSON`

**Events:** 6 webhooks total (products, orders, inventory)

---

**Setup Time:** 5 minutes  
**Benefit:** Real-time sync + Telegram alerts  
**Status:** ✅ Function deployed and ready
