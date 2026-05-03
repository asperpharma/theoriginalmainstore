---
name: deploy-function
description: Deploy a named Supabase Edge Function to production. Usage: /deploy-function <function-name>
disable-model-invocation: true
license: MIT
metadata:
  author: asperpharma
  version: "1.0.0"
---

# Deploy Supabase Edge Function

Deploy the named edge function to the Asper Beauty Supabase project.

## Usage

```
/deploy-function <function-name>
```

Example: `/deploy-function beauty-assistant`

## Steps

1. Verify the function directory exists:
   ```bash
   ls supabase/functions/$FUNCTION_NAME/
   ```

2. Deploy via Supabase CLI:
   ```bash
   npx supabase functions deploy $FUNCTION_NAME \
     --project-ref vhgwvfedgfmcixhdyttt
   ```

3. Verify deployment:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" \
     "https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/$FUNCTION_NAME" \
     -H "Authorization: Bearer $SUPABASE_ANON_KEY"
   ```

## Notes
- Requires `SUPABASE_ACCESS_TOKEN` env var to be set
- Project ref: `vhgwvfedgfmcixhdyttt`
- All active functions are listed in CLAUDE.md under "Edge Functions"
- Never commit `SUPABASE_ACCESS_TOKEN` — use `export` in shell only
