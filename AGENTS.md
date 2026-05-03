# Asper Beauty Shop — Agent Instructions

## Project Context
- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Supabase + Shopify
- **Domain**: E-commerce beauty/skincare platform (Jordan)
- **Products**: 10,000+ SKUs from 350+ brands
- **Bilingual**: English + Arabic (RTL)
- **Design**: Neumorphic clinical luxury (Maroon #800020, Gold #C5A028, Ivory #F8F8FF)

## Agent Roles

### code-reviewer
Review PRs for: TypeScript strict mode, design token consistency (maroon/gold/ivory), neumorphic shadow usage, RTL/Arabic support (useLanguage context), no exposed API keys, RLS on new tables, lazy loading for below-fold components.

### security-reviewer
Check for: exposed Supabase service keys, Shopify admin tokens in frontend, XSS in product descriptions, cart manipulation, COD order validation, customer data protection.

### ui-reviewer
Verify: neumorphic shadows consistent, cursor-pointer on interactives, 200-250ms transitions, prefers-reduced-motion respected, Tajawal font for Arabic, no letter-spacing on RTL text, contrast 4.5:1 minimum.

### deploy
Deploy to Vercel: `vercel --prod`. Deploy Edge Functions: `npx supabase functions deploy <name> --no-verify-jwt`.

### catalog-sync
Trigger Shopify catalog sync: `npm run sync`. Dry run: `npm run sync:dry`.

## Key Files
- `src/index.css` — Design tokens, neumorphic utilities, RTL rules
- `tailwind.config.ts` — Color palette, shadows, fonts
- `src/contexts/LanguageContext.tsx` — i18n (90+ translation keys)
- `src/components/home/CinematicHero.tsx` — Hero section
- `src/pages/Shop.tsx` — Main shop page
- `supabase/functions/telegram-bot/index.ts` — Telegram command center

## Available Skills

Claude Code skills for common tasks. Invoke with `/skill-name` in Claude Code.

### /deploy
Deploy site to Vercel and/or Supabase Edge Functions.

**Usage:**
- `/deploy` — deploy site to Vercel production
- `/deploy functions` — deploy all Supabase Edge Functions
- `/deploy telegram` — deploy telegram-bot only
- `/deploy slack` — deploy slack-bot only
- `/deploy all` — deploy both Vercel + all Edge Functions

**Notes:**
- Production site serves via Cloudflare Worker `aws-shopify-cloude`
- `telegram-bot` and `shopify-webhooks` require `--no-verify-jwt`
- See `.claude/skills/deploy/SKILL.md` for complete reference

### /deploy-function
Deploy a single named Supabase Edge Function.

**Usage:** `/deploy-function <function-name>`

**Example:** `/deploy-function beauty-assistant`

**Prerequisites:**
- `SUPABASE_ACCESS_TOKEN` must be set in environment
- Project ref: `mpcxpydkzvwlflxcujnz`

### /sync-catalog
Sync Shopify product catalog to Supabase.

**Usage:**
- `/sync-catalog` — full sync
- `/sync-catalog dry` — dry run (preview only)

**Commands:**
```bash
npm run sync        # full sync
npm run sync:dry    # dry run
```

### /new-component
Scaffold a new neumorphic React component.

**Usage:** `/new-component <ComponentName> [description]`

**Example:** `/new-component ProductBadge "Bestseller badge"`

**Auto-generates:**
- Neumorphic design system classes
- RTL/Arabic support via `useLanguage()`
- TypeScript strict mode interfaces
- Design token variables (maroon/gold/ivory)

## Conventions
- Use `asper_category` (not `category`) for product categorization
- Filter products with `available = true`
- Order by `bestseller_rank` ASC NULLS LAST
- Always support Arabic via `useLanguage()` context
- No `any` types — use `unknown` and narrow
- RLS mandatory on every new table
