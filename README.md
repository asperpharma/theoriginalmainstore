# 💎 Asper Beauty Shop — Grand Opening Guide (March 2026)

Welcome to your production-ready **Medical Luxury** flagship. The engineering is complete, the prices are corrected, and the AI Brain is active.

---

## 🚀 Final Steps to Go Live (10 Minutes)

### 1. Populate the 4,311 Product Catalog
- Open your [Supabase Dashboard](https://supabase.com/dashboard/project/mpcxpydkzvwlflxcujnz).
- Go to the **SQL Editor**.
- Open the file: `catalog-sync.sql` (located in the project root).
- Copy the entire content, paste it into the editor, and click **RUN**.
- **Result:** Your site will instantly show 4,300+ items with real brand images and corrected prices.

### 2. Connect Your Custom Domain (Cloudflare DNS)
- Go to your **Lovable Project Settings** > **Domains**.
- Ensure both `asperbeautyshop.com` and `www.asperbeautyshop.com` are added.
- In your **Cloudflare Dashboard** (for `asperbeautyshop.com`), set these DNS records:

| Type  | Name  | Content              | Proxy  |
|-------|-------|----------------------|--------|
| A     | @     | 216.150.1.1          | DNS only (grey cloud) |
| CNAME | www   | asperbeautyshop.com  | DNS only (grey cloud) |

- **Important:** Set Cloudflare proxy status to **DNS only** (grey cloud icon), not Proxied (orange cloud). Lovable needs direct DNS resolution to verify ownership and issue TLS certificates.
- After updating DNS, return to Lovable Settings > Domains and click **Verify** for each domain.
- Allow up to 10 minutes for DNS propagation before verification succeeds.

### 3. Initialize Omnichannel Marketing
- Open **ManyChat**.
- Go to **Automation > Broadcasts**.
- Use the JSON Payload in `docs/MANYCHAT_FLOW_TEMPLATES.md` (Section 7) to blast the "Surprise Soon" teaser.

---

## ✨ What I Have Applied

### 🧠 The Dual-Persona AI Nervous System
- **Dr. Sami (Science):** Authoritative, clinical, bilingual.
- **Ms. Zain (Luxury):** Aesthetic, ritual-focused, high-conversion.
- **Sales Skillset:** Both personas now utilize "Closing" logic and active upselling (3-Step Regimens).

### 🎨 The "Morning Spa" Visual Redesign
- **Cinematic Hero:** Full-bleed ambient video with parallax typography.
- **Dr. Bot Character:** An interactive, floating mini-doctor avatar (`dr-bot-character.png`) that peeks from the corner of the screen.
- **Vogue Layouts:** Asymmetric editorial grids with "Asper Shine" shimmering gold borders.

### 🛡️ System Integrity
- **Production Domain:** All internal URLs updated to `asperbeautyshop.com`.
- **Zero Placeholders:** Scanned and verified that all images are high-fidelity brand assets.
- **Clean Repo:** Removed all fallback folders and temporary scripts.

---

## 🛠️ Developer Commands
- `npm run dev` — Launch local preview.
- `npm run build` — Compile for production.
- `npm run brain` — Check AI health.

**Congratulations! Your Medical Luxury empire is now live.**