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
VITE_SUPABASE_URL=https://vhgwvfedgfmcixhdyttt.supabase.co
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

All functions: `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/{name}`

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
