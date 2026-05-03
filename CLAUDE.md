# Asper Beauty Shop — Claude Code Project Intelligence

## Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Commerce:** Shopify Storefront API
- **AI:** Google Gemini via Supabase Edge Functions
- **Hosting:** Cloudflare Worker (`aws-shopify-cloude`)
- **Domain:** https://asperbeautyshop.com

## Service IDs & Connections
| Service | Value |
|---|---|
| Supabase Project | `vhgwvfedgfmcixhdyttt` |
| Supabase URL | `https://vhgwvfedgfmcixhdyttt.supabase.co` |
| Shopify Store | `asper-beauty-shop-6.myshopify.com` |
| Cloudflare Account | `1b07d13d6b4443176934e16389de03fa` |
| Cloudflare Worker | `aws-shopify-cloude` |
| GitHub Repo | `asperpharma/asper-beauty-spottttttt-6847d53b` |
| Production URL | `https://asperbeautyshop.com` |

## Dev Commands
```bash
npm run dev       # local dev on port 8080
npm run build     # build to dist/
npm run lint      # lint check
npm run typecheck # TypeScript validation
```

## Supabase MCP Setup

This project ships with `.mcp.json` that auto-loads the Supabase MCP server when you open it in Claude Code. To activate it, export your Supabase personal access token:

```bash
export SUPABASE_ACCESS_TOKEN="your-supabase-pat"
```

---

## Edge Functions (all ACTIVE)
| Function | Purpose |
|---|---|
| `beauty-assistant` | AI chat — Dr. Sami + Ms. Zain personas. Routes: `?route=gorgias`, `?route=manychat` |
| `sync-shopify-catalog` | Sync products from Shopify → Supabase |
| `asper-intelligence` | Advanced AI product intelligence |
| `concierge-tip` | Clinical ingredient tips (Dr. Sami) |
| `ai-product-search` | AI-powered product search |
| `telegram-bot` | Telegram command center from phone |
| `telegram-notify` | Push notifications to Telegram |
| `gemini-tts` | Voice interface proxy |
| `rapid-task` | Fast task execution |
| `sitemap` | Dynamic sitemap.xml |
| `send-email` | Transactional emails |
| `meta-bot` | Meta/Facebook bot integration |
| `meta-capi` | Meta Conversions API |
| `ingest-catalog` | Catalog ingestion |
| `shopify_mcp_proxy` | Shopify MCP proxy |
| `bright-handler` | Brightening concern handler |
| `auth-email-hook` | Supabase auth email customization |
| `bulk-product-upload` | Batch product import |
| `cleanup-rate-limits` | Rate limit record cleanup |
| `process-email-queue` | Email queue processor |
| `secure-checkout` | Secure checkout flow |
| `send-transactional-email` | Transactional email sender |
| `shopify-admin-api` | Shopify Admin API proxy |
| `shopify-webhooks` | Shopify webhook handler |

## Channel Webhooks
| Channel | Webhook URL |
|---|---|
| **Gorgias** | `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/beauty-assistant?route=gorgias` |
| **ManyChat** (IG/FB/WA) | `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/beauty-assistant?route=manychat` |
| **Telegram Bot** | `https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/telegram-bot` |

## Telegram Commands (from phone)
- `/orders` — today's orders
- `/stats` — sales + traffic summary
- `/products` — top selling products
- `/sync` — trigger Shopify catalog sync
- `/broadcast <msg>` — send message to users

---

## Database (44 tables, all with RLS)
- 10,399+ products in `products` table
- Key columns: `asper_category`, `brand`, `is_bestseller`, `available`, `shopify_product_id`

### Catalog
| Table | Description |
|---|---|
| `products` | 10,000+ SKUs with pricing, images, AI persona, regimen step, concern tags |
| `brands` | 350+ brands with slug, hero image, logo, elite flag |
| `digital_tray_products` | Featured "digital tray" curation |

### Orders & Commerce
| Table | Description |
|---|---|
| `cod_orders` | Cash-on-delivery orders with driver assignment |
| `customer_leads` | Pre-checkout lead capture |

### AI & Concierge
| Table | Description |
|---|---|
| `concierge_brains` | AI brain configuration per persona |
| `conversations` | Chat session containers |
| `messages` | Individual chat messages |

---

## Coding Conventions
- Use `asper_category` (not `category`) for product categorization
- Filter products with `available = true`
- Order by `bestseller_rank` ASC NULLS LAST, then `created_at` DESC
- Colors: maroon (`#800020`), shiny-gold, soft-ivory
- Fonts: Playfair Display (headings), Montserrat (body), Tajawal (Arabic)
- Always support Arabic/English via `useLanguage()` context
- **TypeScript strict** — no `any`, no unchecked casts
- **RLS mandatory** — every new table must have Row Level Security enabled

## Security
- Never expose service role key client-side
- All tables have RLS enabled
- Use `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key) on frontend
- Shopify Storefront token is public-safe
- Never commit `SUPABASE_ACCESS_TOKEN` or service role keys

## Vercel
- Vercel MCP auth = `asperpharma` team (different from project owner)
- Project lives under `fahmawispot` CLI team — `.vercel/project.json` is correct, do not re-link
- Active branch `feat/neumorphic-elite-ui-redesign` bypasses 4 protection rules on push — expected
- Vercel team `team_VCMmo9c6UjYNIS0u7ngiQVvk` (`asper-beauty-shops-projects`) contains test/demo projects only
- **Production site deploys via Cloudflare Worker `aws-shopify-cloude`**, NOT Vercel

## Edge Function Deployment Notes
- `meta-capi` does NOT exist on disk — skip when deploying (listed in edge functions table but never created)
- Deploy via `mcp__claude_ai_Supa_claude__deploy_edge_function` — entrypoint always `index.ts`
- Companion files (e.g. `_shared/`) need `../` prefix in the `files[]` array
- `shopify-admin-api`, `shopify-webhooks`, `bulk-product-upload` have wrong Shopify domain (`lovable-project-milns.myshopify.com`) — intentional, deploy as-is
- `shopify-webhooks`: `verify_jwt=false` (webhook endpoint); all others: `verify_jwt=true`
- `telegram-bot` is 1482 lines — read in chunks using `offset`/`limit` to avoid token limit

## Product Categorization
- Products with `asper_category = 'Requires_Manual_Review'` need manual SQL UPDATE
- Pattern: `UPDATE products SET asper_category = CASE WHEN title ILIKE '%keyword%' THEN 'Category' ... END WHERE asper_category = 'Requires_Manual_Review'`
- `null` category products: set to `'Skin Care'` as safe fallback

## Neumorphic Design System (src/index.css)
- Shadows: `.neu-raised` (card elevation), `.neu-inset` (pressed), `.neu-flat` (rings/badges), `.neu-pressed`
- Gold utilities: `.gold-accent-line` (divider), `.luxury-button-primary` (CTA), `.section-header` (gold underline via `::after`)
- RTL: wrap sections with `dir={isAr ? "rtl" : "ltr"}`, use `rtl:ml-1 rtl:mr-0` for icon spacing
