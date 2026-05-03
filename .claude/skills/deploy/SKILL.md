---
name: deploy
description: Deploy Asper Beauty Shop to Vercel production and/or Supabase Edge Functions.
---

# Deploy

Deploy the site and/or edge functions.

## Usage

- `/deploy` — deploy site to Vercel production
- `/deploy functions` — deploy all Supabase Edge Functions
- `/deploy telegram` — deploy telegram-bot edge function only
- `/deploy slack` — deploy slack-bot edge function only
- `/deploy all` — deploy both Vercel + all Edge Functions

## Critical Notes

- **Production** serves via Cloudflare Worker `aws-shopify-cloude`, NOT Vercel directly
- **Do not re-link** Vercel project — `.vercel/project.json` is correct
- **Telegram bot** username: `@abs_drbot`
- `telegram-bot` is 1482 lines — read in chunks using `offset`/`limit` if needed

### JWT Rules
- `--no-verify-jwt` required for: `telegram-bot`, `shopify-webhooks` (external webhook callers)
- All other functions use default JWT verification (omit the flag)

### Functions NOT on disk — skip these
- `sync-shopify-catalog` — does not exist on disk
- `meta-capi` — does not exist on disk
- `gemini-tts`, `rapid-task`, `shopify_mcp_proxy`, `bright-handler`, `send-email` — not on disk

### Deploy-as-is (wrong Shopify domain but intentional)
- `shopify-admin-api`, `shopify-webhooks`, `bulk-product-upload` — use `lovable-project-milns.myshopify.com`, deploy unchanged

---

## Steps

### Vercel

```bash
vercel --prod
```

### Supabase Edge Functions — Webhook (no JWT)

```bash
npx supabase functions deploy telegram-bot --no-verify-jwt
npx supabase functions deploy shopify-webhooks --no-verify-jwt
```

### Supabase Edge Functions — Standard (with JWT)

```bash
npx supabase functions deploy beauty-assistant
npx supabase functions deploy asper-intelligence
npx supabase functions deploy ai-product-search
npx supabase functions deploy concierge-tip
npx supabase functions deploy telegram-notify
npx supabase functions deploy slack-bot
npx supabase functions deploy sitemap
npx supabase functions deploy meta-bot
npx supabase functions deploy ingest-catalog
npx supabase functions deploy auth-email-hook
npx supabase functions deploy bulk-product-upload
npx supabase functions deploy cleanup-rate-limits
npx supabase functions deploy process-email-queue
npx supabase functions deploy secure-checkout
npx supabase functions deploy send-transactional-email
npx supabase functions deploy shopify-admin-api
npx supabase functions deploy orders-bot
npx supabase functions deploy marketing-bot
npx supabase functions deploy social-bot
npx supabase functions deploy support-bot
```

### All Edge Functions (one shot)

```bash
for fn in beauty-assistant asper-intelligence ai-product-search concierge-tip telegram-notify slack-bot sitemap meta-bot ingest-catalog auth-email-hook bulk-product-upload cleanup-rate-limits process-email-queue secure-checkout send-transactional-email shopify-admin-api orders-bot marketing-bot social-bot support-bot; do
  npx supabase functions deploy $fn
done
npx supabase functions deploy telegram-bot --no-verify-jwt
npx supabase functions deploy shopify-webhooks --no-verify-jwt
```

---

## Verify

```bash
# Production site (via Cloudflare)
curl -s https://asperbeautyshop.com -o /dev/null -w "%{http_code}"

# Vercel deployment
curl -s https://asper-beauty-spottttttt-fahmawispot.vercel.app/ -o /dev/null -w "%{http_code}"

# Edge functions
curl -s https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/telegram-bot
curl -s https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/beauty-assistant
curl -s https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/slack-bot
```
