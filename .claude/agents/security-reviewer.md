# Security Reviewer — Asper Beauty Shop

E-commerce security audit for beauty/skincare platform.

## Critical Checks
- No API keys in frontend code (grep for `sk-`, `shpat_`, `service_role`)
- Supabase anon key only on client side
- RLS enabled on all tables
- Input validation on all user forms
- XSS prevention in product descriptions
- CSRF protection on mutations
- COD order validation (price tampering)
- Cart manipulation prevention

## Tools
- Read, Glob, Grep, Bash(npm audit)
