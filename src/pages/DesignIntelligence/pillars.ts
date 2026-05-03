export type Pillar = {
  id: string;
  index: number; // 1-7, used for ghost numeral
  numeral: string; // "01" .. "07"
  title: string;
  subtitle: string;
  points: string[]; // 3-5 bullets, render staggered at 120ms intervals
};

export const PILLARS: Pillar[] = [
  {
    id: "color-architecture",
    index: 1,
    numeral: "01",
    title: "Color Architecture",
    subtitle: "Soft Ivory canvas, Deep Maroon authority, Shiny Gold accent",
    points: [
      "Soft Ivory #F8F8FF replaces pure white — warmer, calmer, clinically inviting",
      "Deep Maroon #800020 reserved for primary actions and brand moments",
      "Shiny Gold #C5A028 used as a 'Gold Stitch' — hover states and hairline accents only",
      "Dark Charcoal #333333 for body text — never pure black",
      "Pure #FFFFFF and #000000 are forbidden across the entire system",
    ],
  },
  {
    id: "typography",
    index: 2,
    numeral: "02",
    title: "Typography",
    subtitle: "Playfair Display for voice, Montserrat for clarity, Tajawal for Arabic",
    points: [
      "Playfair Display anchors every heading — editorial weight, never decorative",
      "Montserrat carries body and UI — geometric, neutral, screen-optimised",
      "Tajawal seamlessly handles Arabic and RTL contexts at matching optical weight",
      "System font fallbacks are explicitly disallowed — fonts are preloaded",
      "Tracking and leading tuned per breakpoint, not left to browser defaults",
    ],
  },
  {
    id: "ux-flow",
    index: 3,
    numeral: "03",
    title: "UX Flow",
    subtitle: "The 3-Click Solution — Triage, Regimen, Digital Tray",
    points: [
      "Click 1 — Triage surfaces the user's primary skin concern in one tap",
      "Click 2 — Regimen returns a curated routine, not a search result",
      "Click 3 — Digital Tray collects the recommendation for COD checkout",
      "Every flow is RTL-mirrored using Tailwind logical properties (ms-, me-, ps-, pe-)",
      "Friction is measured in milliseconds, not screens",
    ],
  },
  {
    id: "motion-language",
    index: 4,
    numeral: "04",
    title: "Motion Language",
    subtitle: "Calm, deliberate, never performative",
    points: [
      "Easing curve is a custom cubic-bezier — closer to a held breath than a spring",
      "Hover states reveal a 1px Gold Stitch underline, never a fill swap",
      "Page transitions cross-fade against the Ivory canvas — no slide-ins",
      "Reduced-motion preference fully honored — animation degrades to opacity only",
      "Duration ceiling is 320ms; anything longer feels theatrical",
    ],
  },
  {
    id: "component-library",
    index: 5,
    numeral: "05",
    title: "Component Library",
    subtitle: "Atomic, RTL-native, AI-proof",
    points: [
      "Every primitive ships in LTR and RTL by construction, not as an afterthought",
      "Tokens live in a single source — no inline hex, no magic numbers",
      "Components fail closed — missing data renders an empty state, never a placeholder",
      "Storybook coverage is mandatory before merge",
      "All variants pass npm run lint with zero errors before commit",
    ],
  },
  {
    id: "ai-persona-design",
    index: 6,
    numeral: "06",
    title: "AI Persona Design",
    subtitle: "Dr. Sami clinical, Ms. Zain aesthetic — one router",
    points: [
      "Dr. Sami handles dermatological intent — measured, evidence-led, citation-ready",
      "Ms. Zain handles aesthetic intent — warm, curatorial, sensory in language",
      "A single router classifies intent and selects persona before the LLM call",
      "Every response carries the guardrail: wellness guidance, not medical diagnosis",
      "Ingredient conflicts trigger a hard interrupt, not a soft warning",
    ],
  },
  {
    id: "cicd-architecture",
    index: 7,
    numeral: "07",
    title: "CI/CD Architecture",
    subtitle: "Cloudflare Pages → Shopify Storefront → Supabase Edge",
    points: [
      "Frontend deploys via Cloudflare Pages from this repository on every merge to main",
      "Commerce is headless against the Shopify Storefront API v2025-07",
      "Backend runs on Supabase Edge Functions — beauty-assistant, create-cod-order, get-products-by-concern",
      "Cloudflare Web Analytics provides RUM baseline ahead of conversion work",
      "Secrets never enter the repo — every key flows through Supabase or Cloudflare bindings",
    ],
  },
];
