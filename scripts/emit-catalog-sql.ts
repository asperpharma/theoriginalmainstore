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
import {
  mapCsvRowToProduct,
  parseApifyCsv,
  type ProductUpsert,
} from "./catalog-mapping.ts";

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
  const rows = parseApifyCsv(text);
  console.log(`▸ Parsed ${rows.length} CSV rows`);

  const products: ProductUpsert[] = [];
  let skipped = 0;
  const seenHandles = new Set<string>();
  for (const row of rows) {
    const mapped = mapCsvRowToProduct(row);
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
