/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Asper Beauty Shop — Apify/Shopify CSV → chunked SQL files for MCP execute_sql
 *
 * Sibling of `scripts/ingest-catalog-from-csv.ts`. Produces batched INSERT ...
 * ON CONFLICT (handle) DO UPDATE SQL files that an operator can pipe into the
 * Supabase MCP `execute_sql` tool — used when the Supabase REST edge is blocked
 * by Network Restrictions.
 *
 * Usage:
 *   npx tsx scripts/emit-catalog-sql.ts [flags] [path/to/file.csv]
 *
 * Flags:
 *   --limit N                Process only the first N products.
 *   --batch-size N           Rows per SQL batch file (default 100).
 *   --out DIR                Output directory (default /tmp/mcp-ingest).
 *   --emit-missing           Also emit retire-missing.sql that flips
 *                            available=false for handles not in the CSV.
 *                            (Operator supplies the existing-handles list; this
 *                            flag just emits the UPDATE template.)
 *
 * Produces:
 *   <out>/batch-0001.sql ... batch-NNNN.sql    one multi-row upsert each
 *   <out>/manifest.json                         ordered list + counts + handles
 */

import * as fs from "fs";
import * as path from "path";

// ─── CLI flags ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;
const batchIdx = args.indexOf("--batch-size");
const BATCH_SIZE = batchIdx !== -1 ? parseInt(args[batchIdx + 1], 10) : 100;
const outIdx = args.indexOf("--out");
const OUT_DIR = outIdx !== -1 ? args[outIdx + 1] : "/tmp/mcp-ingest";
const EMIT_MISSING = args.includes("--emit-missing");

const positional = args.filter((a, i) => {
  if (a.startsWith("--")) return false;
  const prev = args[i - 1];
  return prev !== "--limit" && prev !== "--batch-size" && prev !== "--out";
});
const CSV_PATH = positional[0]
  || "Orgnized Products/Asper_Catalog_CLEANED - Copy(in)hhh.csv";

// ─── CSV parser (RFC-4180, quoted-newline safe) ──────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); field = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
      } else field += c;
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
const normalizeBrand = (raw: string): string => {
  const key = raw.trim().toLowerCase();
  return BRAND_CORRECTIONS[key] || raw.trim();
};

// ─── Category inference ───────────────────────────────────────────────────
const CATEGORY_RULES: Array<[RegExp, string]> = [
  [/\b(serum|ampoule|essence)\b/i, "Serum"],
  [/\b(cleanser|face wash|micellar|cleansing)\b/i, "Cleanser"],
  [/\b(sunscreen|spf|sunblock|uv)\b/i, "Sunscreen"],
  [/\b(moisturizer|moisturising|moisturizing|hydrator|cream)\b/i, "Moisturizer"],
  [/\b(mascara)\b/i, "Mascara"],
  [/\b(shampoo)\b/i, "Shampoo"],
  [/\b(conditioner)\b/i, "Conditioner"],
  [/\b(hair mask)\b/i, "Hair Mask"],
  [/\b(hair oil|hair serum)\b/i, "Hair Care"],
  [/\b(foundation)\b/i, "Foundation"],
  [/\b(concealer)\b/i, "Concealer"],
  [/\b(lipstick|lip gloss|lip balm)\b/i, "Lip"],
  [/\b(eyeliner|kohl)\b/i, "Eyeliner"],
  [/\b(eyeshadow|eye palette)\b/i, "Eyeshadow"],
  [/\b(eyebrow|brow)\b/i, "Eyebrow"],
  [/\b(eye cream)\b/i, "Eye Cream"],
  [/\b(blush|bronzer|highlighter)\b/i, "Face Makeup"],
  [/\b(makeup brush|brush set)\b/i, "Makeup Brush"],
  [/\b(primer)\b/i, "Primer"],
  [/\b(perfume|eau de|cologne|parfum|fragrance|body mist)\b/i, "Fragrance"],
  [/\b(toner)\b/i, "Toner"],
  [/\b(mask|peel)\b/i, "Mask"],
  [/\b(body lotion|body cream|body wash|body oil|shower gel|body scrub)\b/i, "Body Care"],
  [/\b(hand cream|foot cream)\b/i, "Body Care"],
  [/\b(deodorant|antiperspirant)\b/i, "Deodorant"],
  [/\b(shaving|aftershave|beard|razor)\b/i, "Men's Care"],
  [/\b(baby bottle|pacifier|soother)\b/i, "Baby Bottle"],
  [/\b(diaper|nappy)\b/i, "Diaper"],
  [/\b(baby (shampoo|lotion|oil|cream|wash|powder|wipes|formula|food|milk|care))\b/i, "Baby Care"],
  [/\b(sanitary|pad|tampon)\b/i, "Sanitary Pads"],
  [/\b(supplement|vitamin|collagen|omega|probiotic|capsule|tablet|biotin)\b/i, "Supplements"],
  [/\b(toothpaste|mouthwash|dental|oral)\b/i, "Oral Care"],
];
function inferAsperCategory(title: string, productType: string, tags: string[]): string {
  const hay = `${title} ${productType} ${tags.join(" ")}`;
  for (const [re, cat] of CATEGORY_RULES) if (re.test(hay)) return cat;
  if (productType && productType.length <= 60) return productType;
  return "Skin Care";
}

// ─── Concern derivation ───────────────────────────────────────────────────
const CONCERN_RULES: Array<[RegExp, string]> = [
  [/\b(acne|pimple|blemish|breakout|salicylic|benzoyl)\b/i, "Concern_Acne"],
  [/\b(anti.?aging|wrinkle|fine line|retinol|firm)\b/i, "Concern_AntiAging"],
  [/\b(brighten|glow|radiance|vitamin c|niacinamide)\b/i, "Concern_Brightening"],
  [/\b(dark circle|under.?eye)\b/i, "Concern_DarkCircles"],
  [/\b(hydrat|moistur|hyaluronic|dry skin|dryness)\b/i, "Concern_Hydration"],
  [/\b(oily|oil control|shine|mattif)\b/i, "Concern_Oiliness"],
  [/\b(pigment|dark spot|melasma|hyperpigment|even tone)\b/i, "Concern_Pigmentation"],
  [/\b(sensitive|redness|soothe|calm|irritat)\b/i, "Concern_Sensitivity"],
  [/\b(sun protect|spf|uv|sunscreen|sunblock)\b/i, "Concern_SunProtection"],
];
function derivePrimaryConcern(title: string, tags: string[], productType: string): string {
  const hay = `${title} ${productType} ${tags.join(" ")}`;
  for (const [re, c] of CONCERN_RULES) if (re.test(hay)) return c;
  return "Concern_Hydration";
}
function deriveConcernTags(title: string, tags: string[], productType: string): string[] {
  const hay = `${title} ${productType} ${tags.join(" ")}`;
  const found = new Set<string>();
  for (const [re, c] of CONCERN_RULES) if (re.test(hay)) found.add(c);
  return [...found];
}

function inferRegimenStep(category: string, title: string): "Step_1" | "Step_2" | "Step_3" {
  const hay = `${category} ${title}`.toLowerCase();
  if (/cleanser|face wash|micellar|shampoo|toner/.test(hay)) return "Step_1";
  if (/serum|treatment|mask|peel|essence|ampoule/.test(hay)) return "Step_2";
  return "Step_3";
}

function collectNumbered(row: Record<string, string>, prefix: string, suffix: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < 50; i++) {
    const v = row[`${prefix}${i}${suffix}`];
    if (v !== undefined && v !== "") out.push(v);
  }
  return out;
}

// ─── Row shape (mirrors ingest-catalog-from-csv.ts ProductUpsert) ─────────
interface ProductUpsert {
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
  regimen_step: string;
  concern_tags: string[];
  clinical_concerns: string[];
  tags: string[];
  sku: string | null;
  shopify_product_id: string | null;
  shopify_variant_id: string | null;
  variant_title: string | null;
}

function mapRow(row: Record<string, string>): ProductUpsert | null {
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
  const available = variantAvailable && (status === "" || status === "active");
  const inventoryQty = parseInt(row["variants/0/inventoryQuantity"] || "0", 10) || 0;

  const asper_category = inferAsperCategory(title, productType, tags);
  const primary_concern = derivePrimaryConcern(title, tags, productType);
  const concern_tags = deriveConcernTags(title, tags, productType);
  const regimen_step = inferRegimenStep(asper_category, title);

  const cleanId = (s: string | undefined): string | null => {
    const v = (s || "").trim();
    if (!v) return null;
    if (/^\d+(\.\d+)?[eE][+-]?\d+$/.test(v)) return null;
    return v;
  };

  const descHtml = row.descriptionHtml || "";
  const description = descHtml
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000) || `${brand} ${title}`.trim();

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

// ─── SQL literal helpers ──────────────────────────────────────────────────
function qstr(s: string): string { return "'" + s.replace(/'/g, "''") + "'"; }
function qstrOrNull(s: string | null | undefined): string {
  if (s === null || s === undefined) return "NULL";
  return qstr(s);
}
function qnumOrNull(n: number | null): string { return n === null ? "NULL" : String(n); }
function qbool(b: boolean): string { return b ? "true" : "false"; }
function qarr(arr: string[]): string {
  if (arr.length === 0) return "ARRAY[]::text[]";
  return "ARRAY[" + arr.map(qstr).join(",") + "]::text[]";
}
function qenum(v: string, type: string): string { return qstr(v) + "::" + type; }

// ─── Ordered column list (INSERT target) ──────────────────────────────────
const COLUMNS = [
  "name", "title", "handle", "description", "brand", "vendor",
  "price", "compare_at_price", "original_price", "currency",
  "available", "in_stock", "stock", "inventory_total", "availability_status",
  "is_on_sale", "is_hero", "is_bestseller", "gold_stitch_tier",
  "image_url", "asper_category", "category", "product_type",
  "primary_concern", "regimen_step",
  "concern_tags", "clinical_concerns", "tags",
  "sku", "shopify_product_id", "shopify_variant_id", "variant_title",
  "updated_at",
];

function rowValues(p: ProductUpsert): string {
  return "(" + [
    qstr(p.name),
    qstrOrNull(p.title),
    qstrOrNull(p.handle),
    qstrOrNull(p.description),
    qstrOrNull(p.brand),
    qstrOrNull(p.vendor),
    String(p.price),
    qnumOrNull(p.compare_at_price),
    qnumOrNull(p.original_price),
    qstr(p.currency),
    qbool(p.available),
    qbool(p.in_stock),
    String(p.stock),
    String(p.inventory_total),
    qstrOrNull(p.availability_status),
    qbool(p.is_on_sale),
    qbool(p.is_hero),
    qbool(p.is_bestseller),
    qbool(p.gold_stitch_tier),
    qstrOrNull(p.image_url),
    qstrOrNull(p.asper_category),
    qstrOrNull(p.category),
    qstrOrNull(p.product_type),
    qenum(p.primary_concern, "skin_concern"),
    qenum(p.regimen_step, "regimen_step"),
    qarr(p.concern_tags),
    qarr(p.clinical_concerns),
    qarr(p.tags),
    qstrOrNull(p.sku),
    qstrOrNull(p.shopify_product_id),
    qstrOrNull(p.shopify_variant_id),
    qstrOrNull(p.variant_title),
    "now()",
  ].join(",") + ")";
}

// Columns to UPDATE on conflict — every column we insert except handle + created_at.
const UPDATE_COLUMNS = COLUMNS.filter((c) => c !== "handle");

function buildBatchSQL(batch: ProductUpsert[]): string {
  const values = batch.map(rowValues).join(",\n  ");
  const updates = UPDATE_COLUMNS.map((c) => `${c} = EXCLUDED.${c}`).join(",\n  ");
  return `INSERT INTO products (\n  ${COLUMNS.join(", ")}\n) VALUES\n  ${values}\nON CONFLICT (handle) DO UPDATE SET\n  ${updates};\n`;
}

// ─── Main ─────────────────────────────────────────────────────────────────
function main() {
  const csvPath = path.resolve(process.cwd(), CSV_PATH);
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`▸ Reading ${path.relative(process.cwd(), csvPath)} (${(fs.statSync(csvPath).size / 1024 / 1024).toFixed(1)} MB)`);
  const text = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(text);
  console.log(`▸ Parsed ${rows.length} CSV rows`);

  const products: ProductUpsert[] = [];
  let skipped = 0;
  const seenHandles = new Set<string>();
  for (const row of rows) {
    const mapped = mapRow(row);
    if (!mapped) { skipped++; continue; }
    if (seenHandles.has(mapped.handle)) { skipped++; continue; }
    seenHandles.add(mapped.handle);
    products.push(mapped);
    if (products.length >= LIMIT) break;
  }
  console.log(`▸ Mapped ${products.length} products (${skipped} skipped)`);

  // Sanity distributions
  const catCounts: Record<string, number> = {};
  const concernCounts: Record<string, number> = {};
  for (const p of products) {
    catCounts[p.asper_category] = (catCounts[p.asper_category] || 0) + 1;
    concernCounts[p.primary_concern] = (concernCounts[p.primary_concern] || 0) + 1;
  }
  console.log("▸ asper_category distribution (top 15):");
  for (const [cat, n] of Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`    ${cat.padEnd(24)} ${n}`);
  }
  console.log("▸ primary_concern distribution:");
  for (const [c, n] of Object.entries(concernCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${c.padEnd(24)} ${n}`);
  }

  // Prepare output dir
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // Wipe any stale batches from prior runs
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (/^batch-\d+\.sql$/.test(f) || f === "manifest.json" || f === "retire-missing.sql") {
      fs.unlinkSync(path.join(OUT_DIR, f));
    }
  }

  const batchFiles: string[] = [];
  const numBatches = Math.ceil(products.length / BATCH_SIZE);
  for (let b = 0; b < numBatches; b++) {
    const batch = products.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
    const sql = buildBatchSQL(batch);
    const filename = `batch-${String(b + 1).padStart(4, "0")}.sql`;
    fs.writeFileSync(path.join(OUT_DIR, filename), sql, "utf-8");
    batchFiles.push(filename);
  }

  const manifest = {
    csv: path.relative(process.cwd(), csvPath),
    generated_at: new Date().toISOString(),
    total_products: products.length,
    batch_size: BATCH_SIZE,
    num_batches: batchFiles.length,
    batches: batchFiles,
    handles_count: seenHandles.size,
  };
  fs.writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf-8",
  );

  // Write the full handles list (one per line) so the mark-missing step can
  // diff it against `SELECT handle FROM products WHERE available=true`.
  fs.writeFileSync(
    path.join(OUT_DIR, "handles.txt"),
    [...seenHandles].join("\n"),
    "utf-8",
  );

  if (EMIT_MISSING) {
    // Template — operator fills the IN(...) list after diffing DB handles
    // against handles.txt. Kept as a template here because emitting 10K
    // handles inline into a single SQL statement may blow MCP's query size cap.
    fs.writeFileSync(
      path.join(OUT_DIR, "retire-missing.sql"),
      `-- Fill the IN(...) list with handles that exist in DB but not in handles.txt.\n` +
      `-- Chunk into groups of ~500 per statement to keep under MCP query-size limits.\n` +
      `UPDATE products\nSET available = false,\n    availability_status = 'discontinued',\n    updated_at = now()\nWHERE handle IN (\n  -- 'handle-1', 'handle-2', ...\n);\n`,
      "utf-8",
    );
  }

  console.log(`▸ Wrote ${batchFiles.length} batch file(s) to ${OUT_DIR}`);
  console.log(`▸ manifest.json + handles.txt emitted`);
}

main();
