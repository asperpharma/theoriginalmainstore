# 🎯 Shopify Webhooks Setup - YOUR STORE

## Your Shopify Store
**Store:** asper-beauty-shop-6.myshopify.com  
**Admin:** https://admin.shopify.com/store/asper-beauty-shop-6

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Go to Webhooks Settings
**Direct Link:** 👉 https://admin.shopify.com/store/asper-beauty-shop-6/settings/notifications

### Step 2: Scroll to "Webhooks" Section
Look for the webhooks section at the bottom of the page.

### Step 3: Create 6 Webhooks

Click **"Create webhook"** and use these exact settings:

---

## 📋 Webhook Configuration (Same for All 6)

**Webhook URL:**
```
https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks
```

**Format:** JSON  
**API Version:** 2025-07

---

## The 6 Webhooks to Create

### 1. Product Creation
- **Event:** Product creation
- **URL:** `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks`
- **Format:** JSON
- **API Version:** 2025-07

### 2. Product Update  
- **Event:** Product update
- **URL:** `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks`
- **Format:** JSON
- **API Version:** 2025-07

### 3. Product Deletion
- **Event:** Product deletion
- **URL:** `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks`
- **Format:** JSON
- **API Version:** 2025-07

### 4. Order Creation ⭐ (Telegram Notifications!)
- **Event:** Order creation
- **URL:** `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks`
- **Format:** JSON
- **API Version:** 2025-07

### 5. Order Payment
- **Event:** Order payment  
- **URL:** `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks`
- **Format:** JSON
- **API Version:** 2025-07

### 6. Inventory Update ⭐ (Low Stock Alerts!)
- **Event:** Inventory levels update
- **URL:** `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/shopify-webhooks`
- **Format:** JSON
- **API Version:** 2025-07

---

## ✅ After Creating All 6 Webhooks

### Test Each One:
1. Click on the webhook in your list
2. Click **"Send test notification"**
3. Should see ✅ Success

### Monitor Logs:
```bash
npx supabase functions logs shopify-webhooks --project-ref vhgwvfedgfmcixhdyttt -f
```

---

## 🎉 What You'll Get

### Instant Telegram Notifications:

**New Order:**
```
🎉 New Order Received!

💰 Total: 85.00 JOD
📦 Items:
• CeraVe Hydrating Cleanser (x1)
• La Roche-Posay Sunscreen (x2)

👤 Customer: Sara
📍 Amman
```

**Low Stock:**
```
⚠️ Low Stock Alert

📦 Eucerin Daily Hydration
Stock: 6 units
SKU: EUC-DH-250
```

**Out of Stock:**
```
🚨 Out of Stock

📦 Product Name
Status: SOLD OUT
```

---

## 🔗 Quick Links

**Add Webhooks Here:**  
👉 https://admin.shopify.com/store/asper-beauty-shop-6/settings/notifications

**Your Telegram Bot:**  
@asperbeautyshop_bot or @aws_super_bot

**Function Dashboard:**  
https://supabase.com/dashboard/project/vhgwvfedgfmcixhdyttt/functions

---

## 🧪 Test After Setup

### In Telegram Bot:
```
/stock
→ Shows live inventory from Shopify

/sales
→ Today's orders from your store

/search CeraVe
→ Finds products synced from Shopify
```

### Make Test Order:
Go to your store, make a test purchase, and watch the Telegram notification arrive!

---

**Setup Time:** 5 minutes  
**Result:** Real-time Shopify ↔ Telegram integration  
**Status:** ✅ Ready to activate
