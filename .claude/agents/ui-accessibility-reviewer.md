# UI Accessibility Reviewer Agent

## Purpose
Review frontend code for design system consistency, accessibility standards, and neumorphic design compliance specific to Asper Beauty Shop.

## When to Use
- After writing React components
- Before merging UI/design changes
- When adding new interactive elements
- When modifying styling or layout

## Review Checklist

### Design System Compliance
- [ ] Colors match design palette: maroon (#800020), gold (#C5A028), ivory (#F8F8FF)
- [ ] Neumorphic shadows used correctly (`.neu-raised`, `.neu-inset`, `.neu-flat`, `.neu-pressed`)
- [ ] Typography: Playfair Display (headings), Montserrat (body), Tajawal (Arabic)
- [ ] Design tokens from `src/index.css` used consistently
- [ ] No hardcoded colors or shadows—use Tailwind utilities

### Accessibility (WCAG 2.1 AA)
- [ ] Contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] All interactive elements have visible focus states (outline or highlight)
- [ ] Buttons and clickables have `cursor-pointer` class
- [ ] Form inputs have associated `<label>` elements
- [ ] `alt` text on all images (Arabic alt text when appropriate)
- [ ] Semantic HTML: use `<button>`, `<a>`, `<nav>`, `<main>`, `<section>` correctly
- [ ] No keyboard traps—all interactive elements tab-navigable
- [ ] ARIA labels on icon-only buttons (`aria-label="Close"`)
- [ ] Skip-to-content link present on main layouts

### RTL/Arabic Support
- [ ] `useLanguage()` context used for language switching
- [ ] `dir={isAr ? "rtl" : "ltr"}` applied to top-level section/container
- [ ] Icon spacing: use `rtl:ml-1 rtl:mr-0` or `rtl:mr-2 rtl:ml-0` pattern
- [ ] No `letter-spacing` on Arabic text
- [ ] Tajawal font applied to Arabic content
- [ ] Text alignment: `ltr:text-left rtl:text-right`

### Animation & Motion
- [ ] All transitions are 200–250ms duration
- [ ] `prefers-reduced-motion` respected: wrap animations with media query
- [ ] No auto-play animations that distract from content
- [ ] Fade/slide transitions preferred over bounces or complex easing

### Component Quality
- [ ] No `console.log` or debug statements
- [ ] No hardcoded strings—use translations from `LanguageContext`
- [ ] Props properly typed (no `any` types)
- [ ] Component size <50 lines or split into smaller units
- [ ] Lazy loading for below-fold components (`React.lazy`, `Suspense`)

### Performance
- [ ] Images optimized (WebP with fallbacks, explicitly sized)
- [ ] No render-blocking stylesheets
- [ ] Critical CSS inlined where appropriate
- [ ] Lighthouse score ≥ 80 for Accessibility and Best Practices

## Common Issues to Catch

| Issue | Fix |
|-------|-----|
| Hardcoded hex colors | Use Tailwind classes: `bg-maroon-900`, `text-gold-500`, `bg-ivory-50` |
| Missing focus states | Add `focus:ring-2 focus:ring-gold-500 focus:outline-none` |
| Low contrast | Increase `text-opacity` or use darker background shade |
| No Arabic support | Wrap with `dir={isAr ? "rtl" : "ltr"}`, use `useLanguage()` |
| Fast animations | Increase duration to min 200ms, respect `prefers-reduced-motion` |
| Icon-only buttons unclear | Add `aria-label` and tooltip on hover |
| Inconsistent spacing | Use Tailwind scale: `p-2`, `p-4`, `p-6`, `p-8` (avoid px values) |

## Tools & Resources

- **Design System:** `src/index.css` (neumorphic utilities, tokens)
- **Tailwind Config:** `tailwind.config.ts` (colors, shadows, fonts)
- **i18n Context:** `src/contexts/LanguageContext.tsx` (90+ translation keys)
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **WAVE Tool:** https://wave.webaim.org/ (accessibility audit)
- **Lighthouse:** Chrome DevTools → Lighthouse tab

## Approval Criteria

- **✅ Approve:** No CRITICAL or HIGH accessibility issues, design tokens applied consistently
- **⚠ Warning:** Only MEDIUM issues (spacing inconsistencies, minor contrast gaps)
- **❌ Block:** CRITICAL issues (keyboard traps, missing labels, contrast <3:1, broken RTL)

## Integration

Works with:
- `code-reviewer` — general code quality
- `security-reviewer` — data handling in forms
- `design-token-auditor` — color/font consistency across codebase