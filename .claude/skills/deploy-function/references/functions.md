# Edge Functions Reference

Complete reference for all active Supabase Edge Functions in the Asper Beauty Shop.

**Project ref:** `vhgwvfedgfmcixhdyttt`
**Base URL:** `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/`

---

## AI & Chat

### `beauty-assistant`
AI chat concierge — Dr. Sami (dermatologist) and Ms. Zain (beauty advisor) personas.

```bash
/deploy-function beauty-assistant
```

Routes:
- `?route=gorgias` — Gorgias helpdesk webhook
- `?route=manychat` — ManyChat (Instagram / Facebook / WhatsApp)

### `asper-intelligence`
Advanced AI product intelligence and recommendations.

```bash
/deploy-function asper-intelligence
```

### `concierge-tip`
Clinical ingredient tips from Dr. Sami persona.

```bash
/deploy-function concierge-tip
```

### `ai-product-search`
AI-powered semantic product search across 10,000+ SKUs.

```bash
/deploy-function ai-product-search
```

### `gemini-tts`
Google Gemini voice interface proxy (text-to-speech).

```bash
/deploy-function gemini-tts
```

---

## Telegram

### `telegram-bot`
Command center bot — receives and handles Telegram commands from phone.

```bash
/deploy-function telegram-bot
```

Commands handled: `/orders`, `/stats`, `/products`, `/sync`, `/broadcast <msg>`

### `telegram-notify`
Push notifications to Telegram channel.

```bash
/deploy-function telegram-notify
```

---

## Commerce & Catalog

### `sync-shopify-catalog`
Syncs products from Shopify Storefront API → Supabase `products` table.

```bash
/deploy-function sync-shopify-catalog
```

### `ingest-catalog`
Batch catalog ingestion.

```bash
/deploy-function ingest-catalog
```

### `bulk-product-upload`
Batch product import for large datasets.

```bash
/deploy-function bulk-product-upload
```

### `shopify-admin-api`
Shopify Admin API proxy (server-side only — never expose admin key to client).

```bash
/deploy-function shopify-admin-api
```

### `shopify-webhooks`
Handles Shopify webhook events (order created, product updated, etc.).

```bash
/deploy-function shopify-webhooks
```

### `shopify_mcp_proxy`
Shopify MCP protocol proxy.

```bash
/deploy-function shopify_mcp_proxy
```

### `secure-checkout`
Secure checkout flow handler.

```bash
/deploy-function secure-checkout
```

---

## Email

### `send-email`
Transactional email sender (general).

```bash
/deploy-function send-email
```

### `send-transactional-email`
Dedicated transactional email sender with queue support.

```bash
/deploy-function send-transactional-email
```

### `process-email-queue`
Processes the email send queue.

```bash
/deploy-function process-email-queue
```

### `auth-email-hook`
Supabase Auth hook — customizes auth-related emails (confirm, reset, etc.).

```bash
/deploy-function auth-email-hook
```

---

## Meta / Social

### `meta-bot`
Meta/Facebook Messenger bot integration.

```bash
/deploy-function meta-bot
```

### `meta-capi`
Meta Conversions API — server-side event tracking for ads.

```bash
/deploy-function meta-capi
```

---

## Infrastructure

### `sitemap`
Generates dynamic `sitemap.xml` for SEO.

```bash
/deploy-function sitemap
```

### `rapid-task`
Fast task execution for lightweight operations.

```bash
/deploy-function rapid-task
```

### `cleanup-rate-limits`
Cleans up expired rate limit records from the database.

```bash
/deploy-function cleanup-rate-limits
```

### `bright-handler`
Brightening concern handler — routes brightening-related queries.

```bash
/deploy-function bright-handler
```

---

## Verification

After deploying any function, verify it's live:

```bash
curl -s -o /dev/null -w "%{http_code}" \
  "https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/<function-name>" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

Expected: `200` or `405` (method not allowed = function is alive but expects POST).
