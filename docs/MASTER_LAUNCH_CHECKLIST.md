# Asper Beauty Shop — Master Launch Checklist

> End-to-end checklist to take the store from "code complete" to "accepting live orders."
> Covers payments, shipping, legal, theme, product import, and live-order verification.
> Cross-reference: [PRE_LAUNCH_CHECKLIST.md](./PRE_LAUNCH_CHECKLIST.md) for developer/infra items.

---

## 1. Payment Gateway Configuration

- [ ] **Shopify Payments** (or Stripe / Checkout.com) activated in _Settings → Payments_
- [ ] Test Mode **turned off** for production
- [ ] **Cash on Delivery (COD)** enabled (if targeting regions that prefer cash)
- [ ] Payment icons (Visa, Mastercard, Mada, etc.) visible in the footer
- [ ] Verify checkout completes without errors (place a test order)

---

## 2. Shipping & Delivery

- [ ] Shipping zones created in _Settings → Shipping and delivery_
  - [ ] **Local** zone (e.g., Amman / Jordan)
  - [ ] **GCC** zone (Saudi Arabia, UAE, etc.)
  - [ ] **International** zone (rest of world)
- [ ] Flat rates or "Free Shipping over X" thresholds configured per zone
- [ ] Packing slip template updated with Soft Ivory background and Maroon logo
- [ ] Estimated delivery times displayed on product pages

---

## 3. Theme & Brand Audit ("Ivory & Gold")

### Desktop

- [ ] Soft Ivory (`#F8F8FF`) background renders on all pages
- [ ] Maroon (`#800020`) used for primary buttons and headings
- [ ] **Gold Stitch** (`#C5A028`) appears on product card hover (`hover:border-shiny-gold`)
- [ ] Playfair Display for headings, Montserrat for body, Tajawal for Arabic
- [ ] Footer shows payment icons and social links

### Mobile

- [ ] Gold Stitch is **hidden on scroll** (no hover state on touch devices) — clean "Digital Tray" look
- [ ] Gold Stitch activates as **solid highlight on tap** in the quiz / 3-Click Solution
- [ ] Navigation hamburger menu opens smoothly
- [ ] Product images are lazy-loaded and properly sized
- [ ] RTL layout renders correctly for Arabic content

---

## 4. Product Import (5,000 SKUs)

- [ ] CSV data cleaned (Vichy, Maybelline, Rimmel, Essence, etc.)
- [ ] Supabase Edge Function `bulk-product-upload` returns **HTTP 200**
  ```bash
  curl -i "https://mpcxpydkzvwlflxcujnz.supabase.co/functions/v1/bulk-product-upload"
  ```
- [ ] If **503**: configure Supabase Edge Function secrets (see §5 in [PRE_LAUNCH_CHECKLIST.md](./PRE_LAUNCH_CHECKLIST.md)):
  - `SHOPIFY_STORE_DOMAIN` = `your-store.myshopify.com` (no `https://`)
  - `SHOPIFY_ACCESS_TOKEN` = `shpat_…`
- [ ] Run bulk import via the admin UI (_/admin/bulk-upload_) or POST to the edge function and verify products appear in Shopify Admin
- [ ] Verify product images, prices, and variants are correct
- [ ] Catalog count matches expectation (~5,000 items)

---

## 5. Legal & Trust Pages

- [ ] **Refund Policy** generated in _Settings → Policies_ — customized with "Guaranteed Authentic" language
- [ ] **Privacy Policy** generated and reviewed
- [ ] **Terms of Service** generated and reviewed
- [ ] **Contact Us** page includes physical address (Amman, Jordan) and support email (`asperpharma@gmail.com`)
- [ ] Phone number (`+962 79 065 6666`) and WhatsApp link visible

---

## 6. Domain & SSL

- [ ] Custom domain is the **Primary Domain** in _Settings → Domains_
- [ ] SSL Status shows **"Secured"** (lock icon)
- [ ] `https://www.asperbeautyshop.com` loads correctly
- [ ] HTTP → HTTPS redirect works
- [ ] Cloudflare DNS A record `@` points to `216.150.1.1` (DNS only, grey cloud)
- [ ] Cloudflare DNS CNAME `www` points to `asperbeautyshop.com` (DNS only, grey cloud)
- [ ] Lovable domain verification completed for both apex and www

---

## 7. Email & Notifications

- [ ] Order confirmation email template customized with Maroon logo and Soft Ivory background
- [ ] Shipping confirmation email template customized
- [ ] Abandoned cart email enabled (if applicable)
- [ ] Test email received and visually inspected

---

## 8. Build & CI Health

```bash
# Run locally before pushing
npm run build
npm run lint
npm run typecheck
```

- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run typecheck` passes
- [ ] GitHub Actions workflows pass on push to `main`
- [ ] Deno formatting passes (run `deno fmt supabase/functions` if CI complains)

---

## 9. Live Test Order Protocol

> The only way to verify the full customer experience.

1. [ ] Open an **Incognito / Private** browser window
2. [ ] Search for a low-cost item (e.g., Essence Mascara — 3.000)
3. [ ] **Add to Cart** → verify cart badge updates
4. [ ] **Proceed to Checkout** → verify the form loads
5. [ ] Complete payment:
   - **Option A (COD):** Select Cash on Delivery — no charge
   - **Option B (Real):** Pay with your card — refund immediately after (Note: transaction fees may not be fully refunded)
6. [ ] Verify **order confirmation email** arrives instantly
7. [ ] Check email branding: Maroon logo + Soft Ivory background (not default Shopify grey)
8. [ ] Verify order appears in Shopify Admin → Orders
9. [ ] If email template needs work, customize in _Settings → Notifications_

---

## 10. Post-Launch Monitoring

- [ ] Health endpoint returns 200: `https://www.asperbeautyshop.com/health`
- [ ] Supabase logs show no errors
- [ ] First real customer order received and fulfilled
- [ ] Analytics tracking verified (page views, add-to-cart events)
- [ ] Dr. Bot AI assistant responds correctly on web and WhatsApp

---

## Quick Reference: Key URLs

| System | URL |
|---|---|
| Production Site | `https://www.asperbeautyshop.com` |
| Shopify Admin | `https://admin.shopify.com/store/lovable-project-milns` |
| Supabase Dashboard | `https://supabase.com/dashboard/project/mpcxpydkzvwlflxcujnz` |
| GitHub Repo | `https://github.com/asperpharma/understand-project` |
| Gorgias Helpdesk | `https://asper-beauty-shop.gorgias.com` |

---

**Checklist started on:** 2026-04-08
**Target launch date:** ___________
**Completed by:** ___________
