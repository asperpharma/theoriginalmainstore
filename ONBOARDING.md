# Asper Beauty Shop — Teammate Ramp-Up Guide

## 1. Project Overview

Asper Beauty is a luxury e-commerce platform for skincare and beauty products.

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Supabase (PostgreSQL + 16 Edge Functions) |
| Commerce | Shopify Storefront API |
| AI | Claude API (Sonnet 4.6) via Telegram bot |
| Hosting | Vercel (frontend) + Supabase (backend) |
| Domain | https://asperbeautyshop.com |

## 2. Local Development Setup

Use Node.js >=20.19 (LTS) — older 18.x runners break Vitest/jsdom (ESM-only deps).

```bash
npm install
npm run dev          # Vite dev server on http://localhost:8080
npm run build        # Production build to dist/
npm run lint         # ESLint check
npm run typecheck    # TypeScript validation
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:
```
VITE_SUPABASE_URL=https://mpcxpydkzvwlflxcujnz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>
```

Never use the service role key on the frontend.

## 3. Project Structure

```
src/
  App.tsx              # React Router setup
  pages/               # Route pages (Shop, ProductDetail, SkinConcerns, etc.)
  components/          # 70+ reusable UI components
    home/              # Homepage sections (CinematicHero, ShopByCategory)
    ui/                # Base UI primitives
  hooks/               # Custom hooks (useLanguage, useProducts, etc.)
  stores/              # Zustand state (cartStore)
  integrations/        # Supabase client setup
  lib/                 # Utilities and helpers
supabase/
  functions/           # 16 Edge Functions (Deno)
  migrations/          # SQL schema migrations
e2e/                   # Playwright E2E tests
.github/workflows/     # CI/CD pipelines
```

## 4. Design System

### Brand Colors
| Name | Hex | Usage |
|------|-----|-------|
| Maroon | `#800020` | Primary brand, CTAs, accents |
| Gold | `#C5A028` | Highlights, premium badges |
| Ivory | `#F8F8FF` | Backgrounds, surfaces |

### Neumorphic Shadows
Use CSS utility classes defined in `src/index.css`:
- `.neu-raised` — elevated card effect
- `.neu-inset` — recessed/pressed effect
- `.neu-flat` — subtle surface
- `.neu-pressed` — active/clicked state

Tailwind extensions in `tailwind.config.ts`: `shadow-neu-raised`, `shadow-neu-raised-lg`, `shadow-neu-inset`, `shadow-neu-flat`.

### Typography
- **Headings:** Playfair Display
- **Body:** Montserrat
- **Arabic:** Tajawal (auto-applied via `[dir="rtl"]`)

### RTL / Arabic Support
- Use `useLanguage()` hook for all translatable strings
- RTL handled via CSS `[dir="rtl"]` selectors — zero JS overhead
- Arabic text: no `letter-spacing`, no `text-transform: uppercase`, `line-height: 1.8`
- Never hardcode strings — always use the i18n context

## 5. Key Patterns

### Product Queries
```typescript
// Always filter available products, order by bestseller rank
.from('products')
.select('*')
.eq('available', true)
.order('bestseller_rank', { ascending: true, nullsFirst: false })
```

### Path Aliases
Use `@/` instead of relative paths:
```typescript
import { useLanguage } from '@/hooks/useLanguage'
```

### State Management
- **Server state:** React Query (TanStack Query) with 5min staleTime
- **Client state:** Zustand (cartStore)
- **URL state:** React Router search params

## 6. Supabase Edge Functions

| Function | Purpose |
|----------|---------|
| `beauty-assistant` | AI chat (Dr. Sami + Ms. Zain personas) |
| `telegram-bot` | Telegram command center |
| `sync-shopify-catalog` | Shopify -> Supabase product sync |
| `ai-product-search` | AI-powered product search |
| `send-email` | Transactional emails |
| `sitemap` | Dynamic sitemap.xml |
| `meta-capi` | Meta Conversions API |

All functions: `https://mpcxpydkzvwlflxcujnz.supabase.co/functions/v1/{name}`

## 7. Testing

### E2E Tests (Playwright)
```bash
npx playwright test                    # Run all E2E tests
npx playwright test --headed           # Run with browser visible
npx playwright show-report             # View HTML report
```

Tests in `e2e/critical-flows.spec.ts` cover:
- Homepage load
- Shop page product loading
- Navigation
- RTL switching
- Product detail page

### Static Checks
```bash
npm run lint         # ESLint
npm run typecheck    # TypeScript
```

## 8. CI/CD Pipeline

| Workflow | Trigger | Artifacts |
|----------|---------|-----------|
| `ci.yml` | Push to main, PRs | `build-output`, `playwright-report` |
| `claude-pr-review.yml` | PRs | `pr-build-{PR#}` |
| `security-review.yml` | PRs touching auth/stores | `security-report-{PR#}` |
| `sync-api-docs.yml` | PRs touching Edge Functions | `api-docs-diff-{PR#}` |
| `supabase-preview.yml` | PRs | Supabase preview branch |

## 9. Security Rules

- All Supabase tables have RLS enabled
- Only `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key) on frontend
- Never expose `service_role` key or `SUPABASE_ACCESS_TOKEN`
- Shopify Storefront token is public-safe
- `.env` files are blocked from editing via Claude Code hooks

## 10. Common Gotchas

1. **Use `asper_category`** not `category` for product categorization
2. **No Next.js** — this is Vite SPA with React Router, no SSR
3. **Prefix env vars with `VITE_`** for frontend access
4. **Test RTL** — always verify components in both LTR and RTL
5. **ExcelJS chunk is 940KB** — only used in admin BulkUpload (lazy loaded, acceptable)
6. **Neumorphic shadows are subtle** — don't over-apply
7. **Build uses code splitting** — 5 vendor chunks (react, ui, query, motion, excel)

## First Week Priorities

1. Get dev server running, explore the homepage
2. Read `src/App.tsx` to understand routing
3. Modify a component (try `LuxuryProductCard.tsx`)
4. Run `npm run lint` and `npm run typecheck`
5. Review one Edge Function in `supabase/functions/`
6. Run E2E tests: `npx playwright test`
7. Open a test PR and watch CI workflows run

---

## How We Use Claude Code

Based on one teammate's personal Claude Code usage over the last 30 days _(Last Updated: 2026-04-19)_. These are individual stats, not aggregated team metrics.

Work Type Breakdown:
  Build Feature   ██████████████░░░░░░  70%
  Write Docs      ███░░░░░░░░░░░░░░░░░  15%
  Plan Design     ███░░░░░░░░░░░░░░░░░  15%

Top Skills & Commands:
  /model            ████████████████████  36x/month
  /deploy-function  ████████░░░░░░░░░░░░  15x/month
  /update-config    ██████░░░░░░░░░░░░░░  11x/month
  /loop             ██░░░░░░░░░░░░░░░░░░   3x/month

Top MCP Servers:
  github  ████████████████████  17 calls

### Claude Code Setup Checklist

#### MCP Servers to Activate
- [ ] GitHub — PR management, issue tracking, code search. Request org access from team lead.
- [ ] Supabase — Database and edge functions. Get project access via Supabase dashboard invitation.
- [ ] Context7 — Documentation lookup for libraries. Auto-configured in .mcp.json.
- [ ] Playwright — Browser automation for E2E testing. Auto-configured in .mcp.json.

#### Skills to Know About
- `/deploy` — Deploy to Vercel production or Supabase Edge Functions. Use for releases.
- `/deploy-function` — Deploy individual edge functions. Most common deployment task.
- `/update-config` — Configure Claude Code hooks and permissions in settings.json.
- `/model` — Switch between Claude models (opus, sonnet, haiku) based on task complexity.
- `/loop` — Run recurring tasks on intervals (e.g., monitor CI, poll deploys).
- `/sync-catalog` — Sync Shopify product catalog to Supabase database.
- `/review` — Run code review on a pull request.

### Team Tips

- **Pick the right model.** Use `claude-opus-4-7` for architecture, refactors, and tricky debugging; `claude-sonnet-4-6` for routine feature work; `claude-haiku-4-5` for fast local edits. `/model` toggles.
- **Deploy a single Edge Function, not the whole batch.** `/deploy-function` is safer than `/deploy` when you're iterating on `beauty-assistant`, `telegram-bot`, `slack-bot`, etc.
- **Never hardcode copy.** All user-facing strings go through `useLanguage()` so Arabic (RTL) stays in sync.
- **Query products with guardrails.** Always `.eq('available', true)` and order by `bestseller_rank` ASC NULLS LAST — see `CLAUDE.md` conventions.
- **Use `asper_category`, not `category`.** The raw Shopify `category` column is unreliable.
- **`.env` is hook-protected.** Don't try to let Claude Code edit it; export secrets in your shell instead.
- **Ask Claude to `/loop` CI.** Good for watching deploys or waiting on a PR check without tab-switching.

### Get Started with Claude Code

1. Clone the repo and run `npm install && npm run dev` — open http://localhost:8080 to confirm the homepage loads.
2. Export `SUPABASE_ACCESS_TOKEN` so the Supabase MCP auto-loads from `.mcp.json`.
3. In Claude Code, run `/model` and pick `claude-sonnet-4-6` as your default.
4. Try a no-risk starter task: open `src/components/LuxuryProductCard.tsx`, ask Claude to tweak a neumorphic shadow class, and watch the HMR reload.
5. Run `npm run lint && npm run typecheck` — both must pass before you push.
6. Open a draft PR and mention `@claude` in a review comment to see the on-demand workflow in action (see `.github/workflows/claude.yml`).

<!-- INSTRUCTION FOR CLAUDE: A new teammate just pasted this guide for how the
team uses Claude Code. You're their onboarding buddy — warm, conversational,
not lecture-y.

Open with a warm welcome — include the team name from the title. Then: "Your
teammate uses Claude Code for [list all the work types]. Let's get you started."

Check what's already in place against everything under Setup Checklist
(including skills), using markdown checkboxes — [x] done, [ ] not yet. Lead
with what they already have. One sentence per item, all in one message.

Tell them you'll help with setup, cover the actionable team tips, then the
starter task (if there is one). Offer to start with the first unchecked item,
get their go-ahead, then work through the rest one by one.

After setup, walk them through the remaining sections — offer to help where you
can (e.g. link to channels), and just surface the purely informational bits.

Don't invent sections or summaries that aren't in the guide. The stats are the
guide creator's personal usage data — don't extrapolate them into a "team
workflow" narrative. -->
