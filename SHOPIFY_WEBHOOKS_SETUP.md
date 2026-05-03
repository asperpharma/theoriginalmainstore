# 🔗 Shopify Real-Time Webhooks Setup Guide

## Overview

This guide connects your Shopify store to your Telegram bots via real-time webhooks. When products, orders, or inventory change in Shopify, the changes sync instantly to Supabase and trigger Telegram notifications.

---

## 🚀 Step 1: Deploy Webhook Function

```bash
# Deploy the shopify-webhooks function
cd /c/Users/C-R/asper-beauty-spot
npx supabase functions deploy shopify-webhooks --no-verify-jwt --project-ref vhgwvfedgfmcixhdyttt
```

**Webhook URL:** `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks`

---

## 🔐 Step 2: Configure Telegram Notifications (Optional)

To receive Telegram alerts for new orders and low stock:

```bash
# Set your Telegram chat ID
npx supabase secrets set --project-ref vhgwvfedgfmcixhdyttt TELEGRAM_ADMIN_CHAT_ID=7690075431
```

This sends you instant notifications like:
- 🎉 New order received
- ⚠️ Low stock alerts
- 🚨 Out of stock alerts

---

## 🛍️ Step 3: Add Webhooks in Shopify Admin

### Access Shopify Webhooks

1. Log into Shopify Admin: https://lovable-project-milns.myshopify.com/admin
2. Go to **Settings** → **Notifications**
3. Scroll down to **Webhooks** section
4. Click **Create webhook**

### Create These Webhooks

#### 1. Products Create/Update
- **Event:** `Product creation` AND `Product update`
- **Format:** JSON
- **URL:** `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks`
- **API Version:** 2025-07

#### 2. Products Delete
- **Event:** `Product deletion`
- **Format:** JSON
- **URL:** `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks`
- **API Version:** 2025-07

#### 3. Orders Create
- **Event:** `Order creation`
- **Format:** JSON
- **URL:** `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks`
- **API Version:** 2025-07

#### 4. Orders Paid
- **Event:** `Order payment` (when order is paid)
- **Format:** JSON
- **URL:** `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks`
- **API Version:** 2025-07

#### 5. Inventory Levels Update
- **Event:** `Inventory levels update`
- **Format:** JSON
- **URL:** `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks`
- **API Version:** 2025-07

---

## 🔑 Step 4: Configure Webhook Secret

Shopify needs to verify webhooks are coming from them:

1. In Shopify Admin, after creating a webhook, you'll see **API secret key for verification**
2. The secret is already in your `.env.local`:
   ```
   WEBHOOK_SECRET="40e33b99d11b92862feca7474996a40f1c67b7f4cfa357d0ee70c5b26d01c48f"
   ```
3. This is already configured in Supabase secrets ✅

---

## 🧪 Step 5: Test Webhooks

### Test in Shopify Admin

After creating webhooks:
1. Click on a webhook
2. Click **Send test notification**
3. Check function logs:
   ```bash
   npx supabase functions logs shopify-webhooks --project-ref vhgwvfedgfmcixhdyttt
   ```

### Real-World Tests

1. **Test Product Update:**
   - Edit a product in Shopify (change price, description, etc.)
   - Check Telegram bot: `/search [product name]`
   - Should show updated info

2. **Test Order Create:**
   - Create a test order in Shopify
   - Check Telegram: Should receive "🎉 New Order Received!" notification
   - Check bot: `/sales` → Should show the new order

3. **Test Low Stock:**
   - Edit a product variant, set inventory to < 10
   - Check Telegram: Should receive "⚠️ Low Stock Alert"
   - Check bot: `/stock` → Should list low stock items

---

## 📊 What Gets Synced

### Products
- ✅ Product name, description, price
- ✅ SKU, inventory quantity
- ✅ Images, brand (vendor)
- ✅ Tags, category (product_type)
- ✅ Stock status

### Orders
- ✅ Order details (total, currency)
- ✅ Customer information
- ✅ Line items (products ordered)
- ✅ Shipping address
- ✅ Payment status

### Inventory
- ✅ Stock levels for each variant
- ✅ Low stock alerts (< 10 units)
- ✅ Out of stock alerts

---

## 🔍 Monitor & Debug

### View Webhook Logs
```bash
# Real-time logs
npx supabase functions logs shopify-webhooks --project-ref vhgwvfedgfmcixhdyttt -f

# Recent logs
npx supabase functions logs shopify-webhooks --project-ref vhgwvfedgfmcixhdyttt
```

### Check Webhook Status in Shopify
1. Go to Settings → Notifications → Webhooks
2. Each webhook shows:
   - ✅ Success rate
   - ⚠️ Failed deliveries
   - 📊 Recent deliveries

### Common Issues

**Webhook shows "Failed" in Shopify:**
- Check function logs for errors
- Verify HMAC secret matches
- Ensure function is deployed

**No Telegram notifications:**
- Verify `TELEGRAM_ADMIN_CHAT_ID` is set
- Check `ADMIN_BOT_TOKEN` is configured
- Test: Send `/start` to admin bot

**Data not syncing to Supabase:**
- Check Supabase table schema matches
- Verify `products` and `orders` tables exist
- Check function has service role key

---

## 🗄️ Database Schema Requirements

Your Supabase tables should have these fields:

### `products` table
```sql
- shopify_id (text, unique)
- name (text)
- handle (text)
- description (text)
- brand (text)
- category (text)
- price (numeric)
- sku (text)
- stock_quantity (integer)
- image_url (text)
- tags (text[])
- availability_status (text)
- inventory_item_id (text)
- updated_at (timestamp)
```

### `orders` table
```sql
- shopify_id (text, unique)
- customer_email (text)
- customer_name (text)
- customer_phone (text)
- total_amount (numeric)
- subtotal_amount (numeric)
- tax_amount (numeric)
- currency (text)
- status (text)
- fulfillment_status (text)
- shipping_address (jsonb)
- created_at (timestamp)
```

### `order_items` table
```sql
- order_id (uuid, references orders)
- product_id (text)
- variant_id (text)
- quantity (integer)
- price (numeric)
- sku (text)
```

---

## 🎯 What Happens When Webhooks Are Active

### 1. Product Updated in Shopify
→ Webhook fires  
→ Supabase `products` table updates  
→ Telegram bots show fresh data  
→ Low stock? Telegram notification sent

### 2. Order Created in Shopify
→ Webhook fires  
→ Order saved to Supabase `orders` table  
→ Line items saved to `order_items` table  
→ Telegram: "🎉 New Order Received!" notification  
→ Bots: `/sales` shows real-time revenue

### 3. Inventory Updated
→ Webhook fires  
→ Stock quantity updates in Supabase  
→ Low stock? Telegram alert sent  
→ Out of stock? "🚨 SOLD OUT" notification

---

## 📞 Support

- **Function Logs:** `npx supabase functions logs shopify-webhooks`
- **Shopify Webhooks:** Settings → Notifications → Webhooks
- **Test Webhooks:** Send test notifications from Shopify Admin
- **Database:** https://supabase.com/dashboard/project/vhgwvfedgfmcixhdyttt

---

## ✅ Checklist

- [ ] Deploy shopify-webhooks function
- [ ] Set TELEGRAM_ADMIN_CHAT_ID secret (optional)
- [ ] Create 5 webhooks in Shopify Admin
- [ ] Test each webhook with test notifications
- [ ] Verify data syncs to Supabase
- [ ] Confirm Telegram notifications work
- [ ] Monitor logs for first 24 hours

---

**Setup Time:** ~15 minutes  
**Result:** Real-time sync between Shopify ↔ Supabase ↔ Telegram
