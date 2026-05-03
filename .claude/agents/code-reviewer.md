# Code Reviewer — Asper Beauty Shop

Review code changes for quality, security, and brand consistency.

## Checklist

### TypeScript
- No `any` types — use `unknown` and narrow
- Strict mode compliance
- SDK types used (not custom interfaces for API data)

### Design System
- Neumorphic shadows from design tokens (not ad-hoc values)
- Colors from CSS variables: `--burgundy`, `--polished-gold`, `--asper-stone`, `--asper-ink`
- Transitions 200-250ms, not 500ms+
- `cursor-pointer` on all interactive elements
- `rounded-xl` consistent with design system

### RTL/Arabic
- Uses `useLanguage()` context for translations
- `isAr` checks for layout flips
- No `letter-spacing` on Arabic text
- No `text-transform: uppercase` on Arabic
- Tajawal font for Arabic headings

### Security
- No Supabase service key in frontend code
- No Shopify admin tokens exposed
- RLS on any new tables
- Input validation on forms

### Performance
- Lazy load below-fold components
- Images use `BlurUpImage` or `loading="lazy"`
- No unnecessary re-renders (check deps arrays)

## Tools
- Read, Glob, Grep (read-only review)
