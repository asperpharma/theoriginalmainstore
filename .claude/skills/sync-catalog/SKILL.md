---
name: sync-catalog
description: Sync Shopify product catalog to Supabase
---

# Sync Catalog

Trigger a Shopify catalog sync to update the Supabase products table.

## Usage

- `/sync-catalog` — full sync
- `/sync-catalog dry` — dry run (preview only)

## Commands

```bash
# Dry run
npm run sync:dry

# Full sync
npm run sync

# Sync and publish
npm run sync:publish
```

## Verification

After sync, check product count:
```sql
SELECT COUNT(*) FROM products WHERE available = true;
```
