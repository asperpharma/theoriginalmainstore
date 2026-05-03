/**
 * Shared catalog CSV helpers used by ingest + SQL emitter scripts.
 * Maps Apify-flattened Shopify rows into our `products` table shape.
 */

export interface ProductUpsert {
  name: string;
  title: string;
  handle: string;
  description: string;
  brand: string;
  vendor: string;
  price: number;
  compare_at_price: number | null;
  original_price: number | null;
  currency: string;
  available: boolean;
  in_stock: boolean;
  stock: number;
  inventory_total: number;
  availability_status: string;
  is_on_sale: boolean;
  is_hero: boolean;
  is_bestseller: boolean;
  gold_stitch_tier: boolean;
  image_url: string | null;
  asper_category: string;
  category: string;
  product_type: string | null;
  primary_concern: string;
  regimen_step: "Step_1" | "Step_2" | "Step_3";
  concern_tags: string[];
  clinical_concerns: string[];
  tags: string[];
  sku: string | null;
  shopify_product_id: string | null;
  shopify_variant_id: string | null;
  variant_title: string | null;
}

// ─── CSV parser (quoted-newline safe, in-memory char-by-char) ────────────
// Intentionally hand-rolled: avoids adding a dependency for a single use.
export function parseApifyCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); field = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
      } else {
        field += c;
      }
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map((vals) => {
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = (vals[j] ?? "").trim();
    return obj;
  });
}

// ─── Brand normalization ──────────────────────────────────────────────────
const BRAND_CORRECTIONS: Record<string, string> = {
  "vichy": "Vichy", "vichy labs": "Vichy", "vichy laboratories": "Vichy",
  "la roche posay": "La Roche-Posay", "laroche-posay": "La Roche-Posay",
  "laroche posay": "La Roche-Posay", "la roche-posay": "La Roche-Posay",
  "bioderma": "Bioderma", "eucerin": "Eucerin", "cerave": "CeraVe",
  "sesderma": "Sesderma", "avene": "Avène", "avène": "Avène",
  "svr": "SVR", "uriage": "Uriage", "ducray": "Ducray", "nuxe": "Nuxe",
  "the ordinary": "The Ordinary", "ordinary": "The Ordinary",
  "isdin": "ISDIN", "isis pharma": "Isis Pharma", "heliocare": "Heliocare",
  "lierac": "Lierac", "caudalie": "Caudalie", "filorga": "Filorga",
  "mustela": "Mustela", "pampers": "Pampers", "johnson's": "Johnson's",
  "johnsons": "Johnson's", "nestle": "Nestlé", "nestlé": "Nestlé",
};
export function normalizeBrand(raw: string): string {
  const key = raw.trim().toLowerCase();
  return BRAND_CORRECTIONS[key] || raw.trim();
}

// ─── Asper category inference (fine-grained labels) ───────────────────────
// Rules are ordered from MOST specific to LEAST specific. inferAsperCategory
// tests title first, then productType, then tags so the most precise field wins.
const CATEGORY_RULES: Array<[RegExp, string]> = [
  // ── Specific sub-categories first (avoid false matches in broader patterns) ──
  [/\b(eye cream|eye gel|eye serum|eye balm|under.?eye)\b/i, "Eye Cream"],
  [/\b(neck cream|neck serum|d[eé]collet[eé]|neck oil)\b/i, "Neck & Décolleté"],
  [/\b(hair mask|hair pack|hair treatment)\b/i, "Hair Mask"],
  [/\b(hair oil|hair serum|scalp serum|scalp oil|scalp treatment)\b/i, "Hair Oil & Serum"],
  [/\b(hair (gel|spray|wax|pomade|mousse|styling cream)|pomade|hair color|hair colour|hair dye|dry shampoo)\b/i, "Hair Styling"],
  [/\b(nail polish|nail lacquer|nail treatment|nail serum|nail oil|nail care|nail (gel|base|top))\b/i, "Nail Care"],
  [/\b(bb cream|cc cream|tinted moisturizer|tinted moisturiser|cushion foundation)\b/i, "Tinted Moisturizer"],
  [/\b(setting spray|setting powder|translucent powder|loose powder|compact powder|pressed powder|fixing spray)\b/i, "Setting Powder"],
  [/\b(face oil|facial oil|rosehip oil|marula oil|jojoba oil|facial dry oil)\b/i, "Face Oil"],
  [/\b(lip liner|lip pencil|lipliner)\b/i, "Lip Liner"],
  [/\b(lip scrub|lip mask|lip treatment|lip balm|lip care)\b/i, "Lip Care"],
  [/\b(lipstick|lip gloss|lip color|lip colour|lip rouge)\b/i, "Lip Color"],
  [/\b(eyebrow|brow (pencil|powder|gel|tint|soap|serum))\b/i, "Eyebrow"],
  [/\b(eyeliner|kohl|kajal|eye pencil)\b/i, "Eyeliner"],
  [/\b(eyeshadow|eye palette|eye pigment)\b/i, "Eyeshadow"],
  [/\b(mascara)\b/i, "Mascara"],
  [/\b(blush|bronzer|highlighter|contour)\b/i, "Face Makeup"],
  [/\b(makeup brush|brush set|beauty blender|makeup sponge)\b/i, "Makeup Tools"],
  [/\b(primer|makeup base|pore primer)\b/i, "Primer"],
  [/\b(concealer)\b/i, "Concealer"],
  [/\b(foundation|full coverage|skin tint)\b/i, "Foundation"],
  // ── Exfoliants before generic serums/creams ──
  [/\b(exfoliat|aha toner|bha toner|glycolic toner|lactic acid|pha toner)\b/i, "Exfoliator"],
  [/\b(scrub|peeling gel|body (scrub|exfoliant))\b/i, "Exfoliator"],
  // ── Core skin care ──
  [/\b(serum|ampoule|essence|booster)\b/i, "Serum"],
  [/\b(cleanser|face wash|micellar|cleansing (oil|balm|gel|foam|milk)|makeup remover)\b/i, "Cleanser"],
  [/\b(toner|mist|facial mist|essence toner)\b/i, "Toner"],
  [/\b(mask|face mask|sheet mask|peel.?off)\b/i, "Mask"],
  [/\b(sunscreen|spf|sunblock|uv protect|sun cream|sun lotion)\b/i, "Sunscreen"],
  [/\b(moisturizer|moisturiser|moisturiz|hydrator|moisturis|day cream|night cream)\b/i, "Moisturizer"],
  [/\b(cream|lotion|gel cream|emulsion|fluid)\b/i, "Moisturizer"],
  // ── Hair care ──
  [/\b(shampoo)\b/i, "Shampoo"],
  [/\b(conditioner|hair conditioner|co.?wash)\b/i, "Conditioner"],
  // ── Fragrance ──
  [/\b(perfume|eau de (parfum|toilette|cologne)|eau de|parfum|cologne|fragrance|body mist|body splash|attar|oud)\b/i, "Fragrance"],
  // ── Body care ──
  [/\b(bubble bath|bath (soak|salt|bomb|oil)|bath and shower)\b/i, "Bath & Body"],
  [/\b(body (lotion|cream|butter|oil|wash|gel|mist)|shower (gel|cream)|hand (cream|lotion|wash)|foot (cream|lotion|scrub))\b/i, "Body Care"],
  [/\b(deodorant|antiperspirant|deo roll|body spray)\b/i, "Deodorant"],
  // ── Men's care ──
  [/\b(shaving|shave|aftershave|beard (oil|balm|wash|cream|serum)|razor|men'?s?)\b/i, "Men's Care"],
  // ── Baby & family ──
  [/\b(baby bottle|pacifier|soother|feeding bottle)\b/i, "Baby Bottle"],
  [/\b(diaper|nappy|nappies)\b/i, "Diaper"],
  [/\b(baby (shampoo|lotion|oil|cream|wash|powder|wipes|formula|food|milk|care|gel|soap))\b/i, "Baby Care"],
  [/\b(sanitary|menstrual pad|tampon|panty liner)\b/i, "Sanitary Pads"],
  // ── Health & wellness ──
  [/\b(supplement|vitamin|collagen|omega|probiotic|capsule|tablet|biotin|zinc|magnesium)\b/i, "Supplements"],
  [/\b(toothpaste|mouthwash|dental|oral|teeth whitening|whitening strip)\b/i, "Oral Care"],
];

/**
 * Infer asper_category by testing title → productType → tags in priority order.
 * Title is most precise; tags are broadest. First match in each field wins.
 */
export function inferAsperCategory(title: string, productType: string, tags: string[]): string {
  for (const [re, cat] of CATEGORY_RULES) if (re.test(title)) return cat;
  for (const [re, cat] of CATEGORY_RULES) if (re.test(productType)) return cat;
  const tagHay = tags.join(" ");
  for (const [re, cat] of CATEGORY_RULES) if (re.test(tagHay)) return cat;
  if (productType && productType.length <= 60) return productType;
  return "Skin Care";
}

// ─── Concern derivation (enum: skin_concern) ──────────────────────────────
// Rules are ordered so more specific concerns are tested first.
const CONCERN_RULES: Array<[RegExp, string]> = [
  // ── Sun & UV ──
  [/\b(sun protect|spf|uv|sunscreen|sunblock|broad.?spectrum)\b/i, "Concern_SunProtection"],
  // ── Acne & blemishes ──
  [/\b(acne|pimple|blemish|breakout|blackhead|whitehead|salicylic|benzoyl|comedogenic)\b/i, "Concern_Acne"],
  // ── Pores ──
  [/\b(pore (minimiz|refin|tighten|clean)|large pores?|open pores?|pore.?less)\b/i, "Concern_Pores"],
  // ── Anti-aging & firmness ──
  [/\b(anti.?aging|anti.?ageing|wrinkle|fine line|retinol|retin|peptide|lift|firming|elasticity|sagging|plump|collagen boost)\b/i, "Concern_AntiAging"],
  // ── Pigmentation & uneven tone ──
  [/\b(pigment|dark spot|melasma|hyperpigment|even tone|spot correc|discolor|uneven skin)\b/i, "Concern_Pigmentation"],
  // ── Brightening & radiance (includes whitening common in Arab market) ──
  [/\b(brighten|glow|radiance|illuminat|whitening|lighten|vitamin c|niacinamide|alpha arbutin|kojic)\b/i, "Concern_Brightening"],
  // ── Dark circles ──
  [/\b(dark circle|under.?eye circle|eye puffiness|puffy eyes)\b/i, "Concern_DarkCircles"],
  // ── Sensitivity & barrier ──
  [/\b(sensitive|sensitiv|redness|soothe|calm|irritat|eczema|rosacea|barrier|gentle|fragrance.?free|allerg)\b/i, "Concern_Sensitivity"],
  // ── Oiliness & shine control ──
  [/\b(oily|oil control|shine|mattif|sebum|t.?zone|pore.?minimiz)\b/i, "Concern_Oiliness"],
  // ── Hair loss & scalp ──
  [/\b(hair loss|hairloss|hair fall|thinning hair|hair grow|hair regrow|alopecia|hair thicken|scalp stimulat)\b/i, "Concern_HairLoss"],
  // ── Stretch marks & body firming ──
  [/\b(stretch.?mark|stretchmark|cellulite|slimming|firming body|body firm)\b/i, "Concern_StretchMarks"],
  // ── Hydration (broadest — last to avoid swamping more specific concerns) ──
  [/\b(hydrat|moistur|hyaluronic|dry skin|dryness|water.?less|quench)\b/i, "Concern_Hydration"],
];
export function derivePrimaryConcern(title: string, tags: string[], productType: string): string {
  const hay = `${title} ${productType} ${tags.join(" ")}`;
  for (const [re, c] of CONCERN_RULES) if (re.test(hay)) return c;
  return "Concern_Hydration";
}
export function deriveConcernTags(title: string, tags: string[], productType: string): string[] {
  const hay = `${title} ${productType} ${tags.join(" ")}`;
  const found = new Set<string>();
  for (const [re, c] of CONCERN_RULES) if (re.test(hay)) found.add(c);
  return [...found];
}

// ─── Regimen step inference ───────────────────────────────────────────────
export function inferRegimenStep(category: string, title: string): "Step_1" | "Step_2" | "Step_3" {
  const hay = `${category} ${title}`.toLowerCase();
  if (/cleanser|face wash|micellar|shampoo|toner/.test(hay)) return "Step_1";
  if (/serum|treatment|mask|peel|essence|ampoule/.test(hay)) return "Step_2";
  return "Step_3"; // moisturizer, sunscreen, cream, body care, makeup fallback
}

// ─── Collect numbered fields (images/N/src, tags/N, variants/N/price) ─────
export function collectNumbered(row: Record<string, string>, prefix: string, suffix: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < 50; i++) {
    const v = row[`${prefix}${i}${suffix}`];
    if (v !== undefined && v !== "") out.push(v);
  }
  return out;
}

// ─── Map CSV row → products row ───────────────────────────────────────────
export function mapCsvRowToProduct(row: Record<string, string>): ProductUpsert | null {
  const title = (row.title || "").trim();
  const handle = (row.handle || "").trim();
  if (!title || !handle) return null;

  const tags = collectNumbered(row, "tags/", "");
  const images = collectNumbered(row, "images/", "/src");
  const vendor = (row.vendor || "").trim();
  const brand = normalizeBrand(vendor);
  const productType = (row.productType || "").trim();

  const priceStr = row["variants/0/price"] || "0";
  const compareStr = row["variants/0/compareAtPrice"] || "";
  const price = parseFloat(priceStr) || 0;
  const compareAt = compareStr ? parseFloat(compareStr) : NaN;
  const compare_at_price = !isNaN(compareAt) && compareAt > 0 ? compareAt : null;

  const variantAvailable = (row["variants/0/available"] || "").toLowerCase() === "true";
  const status = (row.status || "").toLowerCase();
  // Apify's Shopify CSV export does not populate `status` — trust variantAvailable
  // when status is blank; still honor explicit non-active values (draft/archived).
  const available = variantAvailable && (status === "" || status === "active");
  const inventoryQty = parseInt(row["variants/0/inventoryQuantity"] || "0", 10) || 0;

  const asper_category = inferAsperCategory(title, productType, tags);
  const primary_concern = derivePrimaryConcern(title, tags, productType);
  const concern_tags = deriveConcernTags(title, tags, productType);
  const regimen_step = inferRegimenStep(asper_category, title);

  // Excel corrupts long numeric IDs into scientific notation (e.g. "3.60E+12").
  // Treat those as unknown rather than storing a lossy value.
  const cleanId = (s: string | undefined): string | null => {
    const v = (s || "").trim();
    if (!v) return null;
    if (/^\d+(\.\d+)?[eE][+-]?\d+$/.test(v)) return null;
    return v;
  };

  // Strip HTML for plain-text description
  const descHtml = row.descriptionHtml || "";
  const description = (() => {
    if (!descHtml.trim()) {
      // Synthesize a useful fallback: "Brand · Category · Concern"
      const concernLabel = primary_concern.replace(/^Concern_/, "").replace(/([A-Z])/g, " $1").trim();
      return `${brand} ${productType || asper_category} — ${concernLabel}`.trim();
    }
    return descHtml
      // Remove entire style/script blocks before tag stripping
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      // Convert block-level breaks to spaces for readability
      .replace(/<\/?(p|br|li|div|h[1-6]|ul|ol)[^>]*>/gi, " ")
      .replace(/<[^>]*>/g, "")
      // Decode common HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&mdash;/g, "—")
      .replace(/&ndash;/g, "–")
      .replace(/&hellip;/g, "…")
      .replace(/&bull;/g, "•")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);
  })();

  return {
    name: title,
    title,
    handle,
    description,
    brand: brand || "Unknown",
    vendor,
    price,
    compare_at_price,
    original_price: compare_at_price,
    currency: "AED",
    available,
    in_stock: variantAvailable,
    stock: Math.max(0, inventoryQty),
    inventory_total: Math.max(0, inventoryQty),
    availability_status: available ? "in_stock" : "out_of_stock",
    is_on_sale: compare_at_price !== null && compare_at_price > price,
    is_hero: false,
    is_bestseller: false,
    gold_stitch_tier: false,
    image_url: images[0] || null,
    asper_category,
    category: asper_category,
    product_type: productType || null,
    primary_concern,
    regimen_step,
    concern_tags,
    clinical_concerns: concern_tags,
    tags: tags.slice(0, 10),
    sku: cleanId(row["variants/0/sku"]),
    shopify_product_id: cleanId(row.productId),
    shopify_variant_id: cleanId(row["variants/0/variantId"]),
    variant_title: row["variants/0/title"] || null,
  };
}
