---
name: deploy
description: Deploy Asper Beauty Shop to Vercel production and/or Supabase Edge Functions.
---

# Deploy

Deploy the site and/or edge functions.

## Usage

- `/deploy` — deploy site to Vercel production
- `/deplo` / `/DEPLO` — shorthand typo alias for `/deploy` (case-insensitive)
- `/deploy functions` — deploy all Supabase Edge Functions
- `/deploy telegram` — deploy telegram-bot edge function only
- `/deploy slack` — deploy slack-bot edge function only
- `/deploy all` — deploy both Vercel + all Edge Functions

---

## Critical Notes

- **Production** serves via Cloudflare Worker `aws-shopify-cloude`, NOT Vercel directly
- **Do not re-link** Vercel project — `.vercel/project.json` is correct
- **Telegram bot** username: `@abs_drbot`
- `telegram-bot` is 1482 lines — read in chunks using `offset`/`limit` if needed

### JWT Rules
- `--no-verify-jwt` required for: `telegram-bot`, `shopify-webhooks` (external callers without Bearer tokens)
- All other functions use default JWT verification (omit the flag)

### Functions NOT on disk — skip these
- `sync-shopify-catalog` — does not exist on disk
- `meta-capi` — does not exist on disk
- `gemini-tts`, `rapid-task`, `shopify_mcp_proxy`, `bright-handler`, `send-email` — not on disk

### Deploy-as-is (wrong Shopify domain but intentional)
- `shopify-admin-api`, `shopify-webhooks`, `bulk-product-upload` — use `lovable-project-milns.myshopify.com`, deploy unchanged

---

## Pre-Deploy Checklist

Before deploying, confirm:

- [ ] `npm run build` passes locally (for Vercel deploys)
- [ ] `npm run typecheck` clean
- [ ] Supabase secrets set for any new env vars (see table below)
- [ ] No service role key or API tokens hardcoded in source
- [ ] If editing `telegram-bot`: read in chunks — it is 1482 lines

---

## Required Secrets by Function

Set secrets via: `npx supabase secrets set KEY=value`

| Function | Required Secrets |
|---|---|
| `telegram-bot` | `TELEGRAM_BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_CHAT_ID`, `SITE_URL`, `ANTHROPIC_API_KEY`, `ENABLE_PROJECT_THREADS`, `GITHUB_REPO`, `GITHUB_TOKEN`, `AGENTIC_MODE` |
| `telegram-notify` | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| `slack-bot` | `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_ADMIN_CHANNEL`, `SHOPIFY_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `beauty-assistant` | `ALLOWED_ORIGIN`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SHOPIFY_WEBHOOK_SECRET`, `LOVABLE_API_KEY` |
| `asper-intelligence` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY` |
| `ai-product-search` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY` |
| `concierge-tip` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `LOVABLE_API_KEY` |
| `shopify-webhooks` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SHOPIFY_WEBHOOK_SECRET`, `SHOPIFY_ACCESS_TOKEN` |
| `shopify-admin-api` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SHOPIFY_ACCESS_TOKEN` |
| `bulk-product-upload` | `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SHOPIFY_ACCESS_TOKEN` |
| `meta-bot` | `META_VERIFY_TOKEN`, `META_PAGE_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` |
| `orders-bot` | `ORDERS_BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_CHAT_ID`, `SITE_URL`, `ASPER_GROUP_ID` |
| `marketing-bot` | `MARKETING_BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_CHAT_ID`, `SITE_URL`, `ASPER_GROUP_ID` |
| `social-bot` | `SOCIAL_BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_CHAT_ID`, `SITE_URL`, `ASPER_GROUP_ID` |
| `support-bot` | `SUPPORT_BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_CHAT_ID`, `SITE_URL`, `ANTHROPIC_API_KEY`, `ASPER_GROUP_ID` |
| `auth-email-hook` | `LOVABLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `process-email-queue` | `LOVABLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_SEND_URL` |
| `ingest-catalog` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| `cleanup-rate-limits` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `secure-checkout` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `send-transactional-email` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY` |
| `sitemap` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |

---

## Deploy Steps

### Vercel (site only)

```bash
vercel --prod
```

### Supabase via CLI

#### Webhook functions (no JWT)

```bash
npx supabase functions deploy telegram-bot --no-verify-jwt
npx supabase functions deploy shopify-webhooks --no-verify-jwt
```

#### Standard functions (with JWT)

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

#### All Edge Functions (one shot)

```bash
for fn in beauty-assistant asper-intelligence ai-product-search concierge-tip telegram-notify slack-bot sitemap meta-bot ingest-catalog auth-email-hook bulk-product-upload cleanup-rate-limits process-email-queue secure-checkout send-transactional-email shopify-admin-api orders-bot marketing-bot social-bot support-bot; do
  npx supabase functions deploy $fn
done
npx supabase functions deploy telegram-bot --no-verify-jwt
npx supabase functions deploy shopify-webhooks --no-verify-jwt
```

### Supabase via MCP

When the Supabase MCP server is active, deploy a single function without leaving Claude Code:

```
deploy edge function <function-name>
entrypoint: index.ts
verify_jwt: true   # false for telegram-bot and shopify-webhooks
```

For functions with `_shared/` imports, companion files need `../` prefix in the `files[]` array.

---

## Verify

```bash
# Production site (via Cloudflare)
curl -s https://asperbeautyshop.com -o /dev/null -w "%{http_code}"

# Vercel deployment
curl -s https://asper-beauty-spottttttt-fahmawispot.vercel.app/ -o /dev/null -w "%{http_code}"

# Edge functions
curl -s https://mpcxpydkzvwlflxcujnz.supabase.co/functions/v1/telegram-bot
curl -s https://mpcxpydkzvwlflxcujnz.supabase.co/functions/v1/beauty-assistant
curl -s https://mpcxpydkzvwlflxcujnz.supabase.co/functions/v1/slack-bot
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `JWT verification failed` | Forgot `--no-verify-jwt` on webhook function | Re-deploy with the flag |
| `Missing secret: TELEGRAM_BOT_TOKEN` | Secret not set in Supabase | `npx supabase secrets set TELEGRAM_BOT_TOKEN=...` |
| `Function not found on disk` | Deploying a non-existent function (see skip list) | Skip it — it's not on disk |
| `Import path not found` for `_shared/` | MCP deploy missing `../` prefix on companion files | Add `../` prefix to shared file paths in `files[]` |
| Vercel build fails | TypeScript error or missing env var | Run `npm run typecheck` first, fix errors |
| Production site not updated | Cloudflare caches Vercel output | Purge Cloudflare cache for `aws-shopify-cloude` worker |
