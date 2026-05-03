/**
 * Asper Beauty Shop — Apify/Shopify CSV → Supabase products table
 *
 *   CSV (Apify flattened Shopify export)
 *     → this script (parses, maps, derives asper_category/concerns)
 *     → supabase `products` table (upsert by handle)
 *
 * Usage:
 *   npx tsx scripts/ingest-catalog-from-csv.ts [flags] [path/to/file.csv]
 *
 * Flags:
 *   --dry-run                    Parse + map, print summary, no DB writes.
 *   --limit N                    Process only the first N products.
 *   --mark-missing-unavailable   After upsert, flip available=false for any
 *                                product whose handle is not in the CSV.
 *   --batch-size N               Rows per upsert batch (default 200).
 *
 * Env:
 *   SUPABASE_URL                  (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY     required — bypass RLS for bulk writes
 */

import * as fs from "fs";
import * as path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_CSV_PATH,
  mapRow,
  parseCSV,
  type ProductUpsert,
} from "./catalog-csv-utils";

// ─── .env loader (no dependency) ──────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

// ─── CLI flags ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const MARK_MISSING_UNAVAILABLE = args.includes("--mark-missing-unavailable");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;
const batchIdx = args.indexOf("--batch-size");
const BATCH_SIZE = batchIdx !== -1 ? parseInt(args[batchIdx + 1], 10) : 200;

const positional = args.filter((a, i) => {
  if (a.startsWith("--")) return false;
  const prev = args[i - 1];
  return prev !== "--limit" && prev !== "--batch-size";
});
const CSV_PATH = positional[0]
  || process.env.INGEST_CSV_PATH
  || DEFAULT_CSV_PATH;

// Parsing + mapping helpers imported from scripts/catalog-csv-utils.ts

// ─── Supabase client (service role) ───────────────────────────────────────
function makeClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("SUPABASE_URL (or VITE_SUPABASE_URL) is required");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  return createClient(url, key, { auth: { persistSession: false } });
}

// ─── Main ─────────────────────────────────────────────────────────────────
async function main() {
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

  // Category + concern distribution for sanity
  const catCounts: Record<string, number> = {};
  const concernCounts: Record<string, number> = {};
  for (const p of products) {
    catCounts[p.asper_category] = (catCounts[p.asper_category] || 0) + 1;
    concernCounts[p.primary_concern] = (concernCounts[p.primary_concern] || 0) + 1;
  }
  console.log("▸ asper_category distribution:");
  for (const [cat, n] of Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`    ${cat.padEnd(24)} ${n}`);
  }
  console.log("▸ primary_concern distribution:");
  for (const [c, n] of Object.entries(concernCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${c.padEnd(24)} ${n}`);
  }

  if (DRY_RUN) {
    console.log("\n▸ DRY RUN — first 3 mapped products:");
    console.log(JSON.stringify(products.slice(0, 3), null, 2));
    console.log(`\n▸ Would upsert ${products.length} products in batches of ${BATCH_SIZE}`);
    if (MARK_MISSING_UNAVAILABLE) {
      console.log(`▸ Would mark products with handle NOT IN csv as available=false`);
    }
    return;
  }

  const supabase = makeClient();

  let upserted = 0;
  const errors: string[] = [];
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from("products")
      .upsert(batch, { onConflict: "handle", ignoreDuplicates: false })
      .select("id");
    if (error) {
      errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
      console.error(`  ✗ batch ${i / BATCH_SIZE + 1} failed: ${error.message}`);
    } else {
      upserted += data?.length || 0;
      process.stdout.write(`  ▸ upserted ${upserted}/${products.length}\r`);
    }
  }
  console.log(`\n▸ Upserted ${upserted} products (${errors.length} batch errors)`);
  if (errors.length) for (const e of errors.slice(0, 5)) console.error(`    ${e}`);

  if (MARK_MISSING_UNAVAILABLE) {
    console.log(`▸ Marking products with handle NOT IN csv (${seenHandles.size} kept) as available=false…`);

    // Fetch all currently-available handles in pages (avoids PostgREST URL-length
    // limits when seenHandles is ~10K — an IN list would be 300KB+).
    const PAGE = 1000;
    const existing: string[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("products")
        .select("handle")
        .eq("available", true)
        .not("handle", "is", null)
        .range(from, from + PAGE - 1);
      if (error) { console.error(`  ✗ fetch handles failed: ${error.message}`); return; }
      if (!data || data.length === 0) break;
      for (const r of data) if (r.handle) existing.push(r.handle);
      if (data.length < PAGE) break;
    }

    const missing = existing.filter((h) => !seenHandles.has(h));
    console.log(`  ▸ ${existing.length} available in DB, ${missing.length} missing from CSV`);

    const UPDATE_CHUNK = 200;
    let marked = 0;
    for (let i = 0; i < missing.length; i += UPDATE_CHUNK) {
      const chunk = missing.slice(i, i + UPDATE_CHUNK);
      const { error } = await supabase
        .from("products")
        .update({ available: false, availability_status: "discontinued" })
        .in("handle", chunk);
      if (error) { console.error(`  ✗ mark-unavailable chunk failed: ${error.message}`); break; }
      marked += chunk.length;
      process.stdout.write(`  ▸ marked ${marked}/${missing.length}\r`);
    }
    console.log(`\n  ▸ marked ${marked} products as unavailable`);
  }

  console.log("✔ Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
