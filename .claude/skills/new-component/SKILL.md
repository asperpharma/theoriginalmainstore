---
name: new-component
description: Scaffold a new neumorphic React component for Asper Beauty Shop. Usage: /new-component <ComponentName> [description]
disable-model-invocation: true
license: MIT
metadata:
  author: asperpharma
  version: "1.0.0"
---

# New Neumorphic Component

Scaffold a new React/TypeScript component following the Asper Beauty neumorphic design system.

## Usage

```
/new-component <ComponentName> [optional description]
```

Example: `/new-component ProductBadge "Bestseller / new arrival badge"`

## What to create

Create `src/components/<kebab-case-name>/<ComponentName>.tsx` with:

```tsx
import { useLanguage } from "@/contexts/LanguageContext";

interface <ComponentName>Props {
  // define props here
}

export function <ComponentName>({ ...props }: <ComponentName>Props) {
  const { isAr } = useLanguage();

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="neu-raised rounded-xl p-4"
    >
      {/* component content */}
    </div>
  );
}
```

## Neumorphic classes to use
- `neu-raised` — card/surface elevation (default for panels)
- `neu-inset` — pressed/active state (inputs, active tabs)
- `neu-flat` — rings, badges, subtle borders
- `neu-pressed` — button press state
- `luxury-button-primary` — primary CTA button
- `gold-accent-line` — gold divider
- `section-header` — heading with gold underline via `::after`

## Colors (CSS variables)
- Maroon: `var(--color-maroon)` / `#800020`
- Gold: `var(--color-gold)` / `#C5A028`
- Ivory: `var(--color-ivory)` / `#F8F8FF`

## Fonts
- `font-playfair` — headings
- `font-montserrat` — body text
- `font-tajawal` — Arabic text (apply when `isAr` is true)

## RTL rules
- Wrap root element with `dir={isAr ? "rtl" : "ltr"}`
- Use `rtl:ml-1 rtl:mr-0` for icon spacing adjustments
- Never apply `letter-spacing` to Arabic text
- Use `useLanguage()` for all translatable strings — no hardcoded Arabic/English text

## Checklist before finishing
- [ ] TypeScript strict — no `any`
- [ ] RTL support via `isAr`
- [ ] Uses design tokens, no hardcoded hex colors
- [ ] Hover/focus/active states defined
- [ ] Bilingual strings via `useLanguage()`
