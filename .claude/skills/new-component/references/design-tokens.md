# Design Tokens Reference

All tokens come from `src/index.css`. Never hardcode values — always use CSS variables or Tailwind utility classes.

---

## Colors

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| Maroon | `var(--color-maroon)` | `#800020` | Primary brand, CTAs, headings |
| Gold | `var(--color-gold)` | `#C5A028` | Accents, dividers, luxury highlights |
| Ivory | `var(--color-ivory)` | `#F8F8FF` | Backgrounds, surface base |

---

## Neumorphic Shadow Classes

| Class | Effect | When to Use |
|---|---|---|
| `neu-raised` | Elevated card / surface | Default panels, product cards |
| `neu-inset` | Pressed / recessed | Active tabs, inputs, selected state |
| `neu-flat` | Flat with ring | Badges, tags, subtle borders |
| `neu-pressed` | Button press state | `:active` on interactive elements |

---

## Typography

| Class | Font | Use For |
|---|---|---|
| `font-playfair` | Playfair Display | Headings, hero text |
| `font-montserrat` | Montserrat | Body text, labels, UI |
| `font-tajawal` | Tajawal | Arabic text regions (when `isAr`) |

**RTL rule:** Never apply `letter-spacing` to Arabic text — it breaks readability.

---

## Utility Classes

| Class | Effect |
|---|---|
| `luxury-button-primary` | Primary CTA — gold gradient, maroon text |
| `gold-accent-line` | Horizontal gold divider |
| `section-header` | Heading with animated gold underline via `::after` |

---

## Spacing & Layout

- Use Tailwind spacing scale (`p-4`, `gap-6`, `mt-8`, etc.)
- Section padding: `py-16 px-6` (mobile) → `py-24 px-12` (desktop)
- Max content width: `max-w-7xl mx-auto`

---

## RTL Patterns

```tsx
// Root wrapper
<div dir={isAr ? "rtl" : "ltr"}>

// Icon spacing adjustments
<span className="mr-2 rtl:mr-0 rtl:ml-2">

// Text alignment (use start/end — never left/right)
<p className="text-start">

// Conditional font for Arabic
<p className={isAr ? "font-tajawal" : "font-montserrat"}>
```

---

## Hover / Focus / Active States

Every interactive component must define all three states:

```tsx
className="
  luxury-button-primary
  hover:opacity-90
  focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2
  active:neu-pressed
  transition-all duration-200
"
```

---

## Breakpoints (Tailwind defaults)

| Prefix | Width |
|---|---|
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |
