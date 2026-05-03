name: deploy
description: Deploy Asper Beauty Shop to Vercel production and/or Supabase Edge Functions.


# Deploy

Deploy the site and/or edge functions.

## Usage

- `/deploy` — deploy site to Vercel production
- `/deplo` — shorthand typo alias for `/deploy`
- `/deploy functions` — deploy all Supabase Edge Functions
- `/deploy telegram` — deploy telegram-bot edge function only
- `/deploy all` — deploy both Vercel + Edge Functions

## Steps

### Vercel
```bash
vercel --prod
```

### Supabase Edge Functions
```bash
npx supabase functions deploy telegram-bot --no-verify-jwt
npx supabase functions deploy beauty-assistant --no-verify-jwt
npx supabase functions deploy sync-shopify-catalog --no-verify-jwt
```

### Verify
```bash
curl -s https://asper-beauty-spottttttt-fahmawispot.vercel.app/ -o /dev/null -w "%{http_code}"
curl -s https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/telegram-bot
```
