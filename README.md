# Asper Beauty Shop

Medical-luxury ecommerce for Jordan, built with React 18 + TypeScript + Vite + Tailwind, Supabase, and Shopify Storefront. The storefront is fully bilingual (English/Arabic, RTL aware), ships with AI concierge personas (Dr. Sami + Ms. Zain), and uses a neumorphic clinical-luxury design system (maroon `#800020`, gold `#C5A028`, ivory `#F8F8FF`).

---

## At a Glance
- **Stack:** React 18, TypeScript (strict), Vite, Tailwind CSS, Radix UI/shadcn.
- **Backend:** Supabase (PostgreSQL + RLS, Edge Functions).
- **Commerce:** Shopify Storefront API.
- **AI:** Google Gemini via Supabase Edge Functions.
- **Hosting:** Cloudflare Worker `aws-shopify-cloude` (prod), Vercel used for previews.
- **Bilingual:** English + Arabic with RTL helpers in `src/contexts/LanguageContext.tsx`.

---

## Environments & IDs
- Production URL: `https://asperbeautyshop.com`
- Supabase project: `mpcxpydkzvwlflxcujnz` (`https://mpcxpydkzvwlflxcujnz.supabase.co`)
- Shopify store: `asper-beauty-shop-6.myshopify.com`
- Cloudflare Worker: `aws-shopify-cloude`

---

## Repo Layout
- `src/` — React app (routes, components, contexts, hooks).
- `src/index.css` — Design tokens, neumorphic utilities, RTL tweaks.
- `src/contexts/LanguageContext.tsx` — i18n + translation keys (English/Arabic).
- `supabase/functions/` — Edge Functions (AI, catalog, bots, checkout).
- `scripts/` — Operational scripts (catalog sync, ingestion, health checks).
- `catalog-sync.sql` — Bulk insert for 4k+ product catalog.
- `public/` — Static assets (logos, hero media).

---

## Getting Started
1. **Prereqs:** Node 20+ recommended (pnpm/bun not required). Ensure `npm` is available.
2. **Install deps:** `npm install` (the current `package-lock.json` is malformed; if `npm ci` fails, use `npm install --no-package-lock`).
3. **Env file:** Copy `env.main-site.example` to `.env` and fill the values below.
4. **Run dev server:** `npm run dev` (Vite default port 5173, proxy disabled).

---

## Environment Variables (frontend)
Create `.env` in the repo root:
```
VITE_SUPABASE_PROJECT_ID="mpcxpydkzvwlflxcujnz"
VITE_SUPABASE_URL="https://mpcxpydkzvwlflxcujnz.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key>"
VITE_SHOPIFY_STORE_DOMAIN="asper-beauty-shop-6.myshopify.com"
VITE_SHOPIFY_STOREFRONT_TOKEN="<storefront-token>"
```
Keep all service-role or admin keys out of the frontend; only use the anon/publishable Supabase key.

---

## Core Workflows
- **Dev preview:** `npm run dev`
- **Type safety:** `npm run typecheck`
- **Lint:** `npm run lint`
- **Unit/integration tests:** `npm test`
- **Build:** `npm run build`
- **Health checks:** `npm run brain` (AI), `npm run health` (HTTP checks)
- **Catalog sync:** `npm run sync` (full) or `npm run sync:dry` (preview)

---

## Design System (Neumorphic Clinical Luxury)
- Colors: maroon `#800020`, gold `#C5A028`, ivory `#F8F8FF`.
- Shadows: `.neu-raised`, `.neu-inset`, `.neu-flat`, `.neu-pressed` in `src/index.css`.
- Typography: Playfair Display (headings), Montserrat (body), Tajawal for Arabic.
- Motion: 200–250ms transitions; respect `prefers-reduced-motion`.
- Interaction: apply `cursor-pointer` on interactive elements; minimum contrast 4.5:1.

---

## Internationalization & RTL
- Use `useLanguage()` from `src/contexts/LanguageContext.tsx` for language/dir.
- Wrap layout containers with `dir={isAr ? "rtl" : "ltr"}`.
- Avoid letter-spacing on Arabic; ensure icon spacing uses `rtl:` utilities.
- Add new strings via the translations map in `LanguageContext.tsx` (90+ keys).

---

## Data & Query Conventions
- Use `asper_category` (not `category`) for filtering and analytics.
- Filter products with `available = true`.
- Default ordering: `ORDER BY bestseller_rank ASC NULLS LAST, created_at DESC`.
- RLS is enforced on every table; never bypass with service keys in the client.

---

## Edge Functions (selected)
- `beauty-assistant` — Dual-persona AI concierge (routes: `gorgias`, `manychat`).
- `secure-checkout` — Checkout guardrails.
- `sync-shopify-catalog` — Shopify → Supabase sync.
- `telegram-bot` / `telegram-notify` — Telegram control plane.
- `shopify-webhooks` — Shopify event ingestion (`verify_jwt=false` by design).
- `ai-product-search`, `asper-intelligence`, `concierge-tip`, `gemini-tts`.

Deploy Edge Functions with `npx supabase functions deploy <name> --no-verify-jwt` (where required). See `AGENTS.md` for the `/deploy` and `/deploy-function` skills.

---

## Catalog Operations
- Bulk import: run the SQL in `catalog-sync.sql` inside Supabase SQL Editor.
- Scripted sync: `npm run sync` (full) or `npm run sync:dry` (preview only).
- CSV ingestion: `npm run ingest:catalog` (or `:dry`), expects Supabase storage uploads configured.

---

## Testing & Quality
- TypeScript strict: no `any`; prefer `unknown` with narrowing.
- Run `npm run lint && npm run typecheck && npm test` before opening a PR.
- UI: ensure RTL parity, neumorphic shadows, and Arabic Tajawal font rendering.
- Accessibility: honor focus states, contrast, and `prefers-reduced-motion`.

---

## Security Notes
- Never expose Supabase service role keys or Shopify Admin tokens to the frontend.
- All new tables must have RLS enabled with sensible policies.
- Validate COD flows and cart integrity; sanitize any HTML in product descriptions.
- Secrets required for bots/webhooks live in the platform config (Vercel/Cloudflare/Supabase), not in the repo.

---

## Deployments
- Production deploys via Cloudflare Worker `aws-shopify-cloude`.
- Vercel is available for previews: use `/deploy` (see `AGENTS.md`) to trigger.
- Edge Functions: `npx supabase functions deploy <name> --no-verify-jwt` (for webhook-style) or without the flag when JWT is required.

---

## Troubleshooting
- **npm ci fails:** the committed `package-lock.json` contains malformed entries; use `npm install --no-package-lock` to proceed.
- **Fonts/RTL:** verify Tajawal loads and `dir` is set on top-level containers.
- **Images:** only high-fidelity brand assets; replace any placeholder with production media.

---

For contribution guidelines, see `CONTRIBUTING.md`.
