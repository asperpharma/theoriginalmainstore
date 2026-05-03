# Project Memory — Asper Beauty Shop

## Architecture Decisions

### 2026-04-10: Neumorphic Design System
Adopted neumorphic UI (raised/inset/pressed shadows) with original brand DNA colors (Maroon #800020, Gold #C5A028, Ivory #F8F8FF). Soft rounded corners (0.75rem), 200-250ms transitions.

### 2026-04-10: Telegram Command Center
Built full Telegram bot (@abs_drbot) with Claude API integration, order management, analytics dashboard, product search, and site management commands. Falls back to Gemini if Claude unavailable.

### 2026-04-10: Performance Optimization
Code split vendor chunks (React, Radix UI, React Query, Framer Motion, ExcelJS). Main bundle reduced 30%. CDN cache headers for static assets. React Query global staleTime 5min.

### 2026-04-10: RTL/Arabic Professional Support
Tajawal font priority in RTL, letter-spacing reset, uppercase removal, line-height 1.8 for Arabic body text. All via CSS `[dir="rtl"]` selectors — zero JS overhead.

## Key Patterns
- Products filtered with `available = true`, ordered by `bestseller_rank ASC NULLS LAST`
- Use `useLanguage()` for all i18n — never hardcode strings
- Supabase Edge Functions for backend logic (16 functions active)
- Shopify Storefront API for commerce/checkout

## Known Issues
- ExcelJS chunk is 940KB — only used in admin BulkUpload (acceptable, lazy loaded)
- 3 customer-facing pages (Account, Auth, TrackOrder) need `useLanguage()` added
- Newsletter and SaleSignupForm have hardcoded "Subscribe" string
