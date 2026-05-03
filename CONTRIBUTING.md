# Contributing to Asper Beauty Shop

Welcome to the medical-luxury flagship. This guide keeps contributions consistent with our bilingual, neumorphic clinical aesthetic and strict security posture.

---

## Quick Start
1. Install Node 20+.
2. Install deps: `npm install` (if `npm ci` fails on the malformed lockfile, use `npm install --no-package-lock`).
3. Copy `env.main-site.example` to `.env` and fill the Supabase/Shopify publishable values.
4. Run `npm run dev` to preview.
5. Before opening a PR, run:
   - `npm run lint`
   - `npm run typecheck`
   - `npm test`
   - `npm run build`

---

## Branch & PR Workflow
- Create feature branches; do not commit to main.
- Keep changes scoped and reversible.
- Reference tickets in commit messages when applicable.
- Rebase over main before opening a PR if history exists.
- Include screenshots or short clips for UI changes (LTR + RTL).

---

## Coding Standards
- TypeScript strict: no `any`; use `unknown` and narrow.
- Prefer functional components and hooks; avoid class components.
- Co-locate component-specific styles in the component file when using Tailwind.
- Keep business logic in hooks/utility modules, not in views.
- Avoid magic numbers; extract tokens or constants.
- Use `useLanguage()` for all copy/dir decisions; never hardcode `dir`.
- Sorting/filtering: use `asper_category`, filter `available = true`, order by `bestseller_rank ASC NULLS LAST, created_at DESC`.

---

## UI & UX Principles
- Design language: maroon `#800020`, gold `#C5A028`, ivory `#F8F8FF`.
- Neumorphic utilities from `src/index.css`: `.neu-raised`, `.neu-inset`, `.neu-flat`, `.neu-pressed`.
- Motion: 200–250ms transitions; respect `prefers-reduced-motion`.
- Typography: Playfair (headings), Montserrat (body), Tajawal for Arabic; avoid letter-spacing on Arabic text.
- Interaction: ensure `cursor-pointer` on interactives; focus-visible styles must remain intact.
- RTL: wrap layouts with `dir={isAr ? "rtl" : "ltr"}` and use `rtl:` Tailwind utilities for spacing.

---

## Internationalization
- Add strings to `translations` inside `src/contexts/LanguageContext.tsx`.
- Keep keys descriptive; provide both English and Arabic values.
- Avoid concatenating translated strings; prefer full-sentence entries.
- Validate both languages in UI snapshots or screenshots.

---

## Data, API, and Queries
- Use Supabase clients with the anon key on the frontend; never embed service role keys.
- Edge Functions should enforce JWT by default; only webhook endpoints disable it intentionally.
- Sanitize/escape any HTML injected into the DOM (product descriptions, CMS content).
- COD/order logic must validate totals server-side; never trust client prices.

---

## Testing Expectations
- Minimum: `npm run lint`, `npm run typecheck`, `npm test`.
- For changes touching build/tooling, run `npm run build`.
- Add unit tests for hooks/utils; add component tests for new UI behaviors (LTR and RTL).
- Respect `prefers-reduced-motion` and accessibility checks (axe) in UI tests where relevant.

---

## Catalog & Ops
- Catalog sync: `npm run sync` (full) or `npm run sync:dry`.
- CSV ingestion: `npm run ingest:catalog` (or `:dry`) after uploading assets.
- Bulk SQL import: run `catalog-sync.sql` in Supabase SQL Editor.

---

## Edge Functions & Deployment
- Deploy functions with `npx supabase functions deploy <name> --no-verify-jwt` when JWT is intentionally skipped (e.g., webhooks); otherwise omit the flag.
- Web production deploys through Cloudflare Worker `aws-shopify-cloude`. Use `/deploy` skill for Vercel previews when needed.
- Keep RLS enabled on every table; include policies when adding new tables.

---

## Security Checklist
- No Supabase service keys or Shopify Admin tokens in client code or commits.
- Validate inputs on both client and Edge Functions; guard against XSS in rich text.
- Avoid storing PII beyond what is necessary; follow existing table schemas.
- Review COD/cart mutations for tampering risks.

---

## PR Checklist
- [ ] Lint, typecheck, tests, and build executed locally.
- [ ] RTL + Arabic reviewed (screenshots if UI changes).
- [ ] Neumorphic shadows and design tokens respected.
- [ ] No secrets committed; environment values documented.
- [ ] Edge cases covered with tests or notes.
- [ ] Added/updated docs if behavior changed.

---

Thank you for helping keep Asper Beauty Shop polished, secure, and bilingual.
