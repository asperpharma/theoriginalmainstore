# Branch Deployment Guide

**Branch:** `copilot/fix-eslint-errors-and-security-advisory`  
**PR:** fix: resolve all ESLint errors + has\_role security advisory  
**Date:** March 2026

---

## 📊 Deployment Checklist

### Pre-Merge Code Quality

- [x] ESLint: 36 errors → 0 (all `@typescript-eslint/no-explicit-any` violations resolved)
- [x] TypeScript: 0 type errors (`npm run typecheck` passes)
- [x] Lint: 0 errors, 17 pre-existing shadcn/ui warnings (`npm run lint` passes)
- [x] Tests: `ProductDetailAnimations.test.tsx` updated and passing
- [x] Code review: completed

### Security Changes — Action Required Before Merging

This branch includes a **Supabase DB migration** that must be applied to production:

```
supabase/migrations/20260319172304_revoke_has_role_from_public.sql
```

**What it does:**

```sql
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
```

**Why:** `has_role()` is `SECURITY DEFINER`. Being executable by `PUBLIC` allowed
unauthenticated callers to probe admin UUIDs. Restricting to `authenticated` closes
the privilege-escalation vector.

**Apply via Supabase CLI:**

```bash
supabase db push
# or for production:
supabase db push --linked
```

**Verify migration applied:**

```sql
SELECT grantee, privilege_type
FROM   information_schema.routine_privileges
WHERE  routine_name = 'has_role';
-- Expected: only "authenticated" appears, no "PUBLIC"
```

---

## 📁 Files Changed

| File | Change |
|------|--------|
| `src/lib/antigravityFeature.ts` | `@ts-ignore` → `@ts-expect-error` |
| `src/lib/antigravityFeatureFlag.ts` | `@ts-ignore` → `@ts-expect-error` |
| `src/pages/AsperIntelligence.tsx` | `catch (error: any)` → typed narrowing |
| `src/pages/CatalogIngestion.tsx` | `catch (error: any)` → typed narrowing |
| `src/components/BeautyAssistant.tsx` | `ChatMessage` interface replaces `any` |
| `src/components/home/DualPersonaBestsellers.tsx` | `DisplayProduct` interface replaces `any` |
| `src/pages/__tests__/ProductDetailAnimations.test.tsx` | Typed interfaces + refactored mocks |
| `src/lib/prescriptionBridge.ts` | `Record<string, unknown>` replaces `any` |
| `src/lib/shopify.ts` | `row as DbRow`, `const q`, regex cleanup |
| `src/pages/Account.tsx` | `React.ComponentType<{className?: string}>` replaces `any` |
| `src/pages/RegimenPortal.tsx` | `Record<string, unknown>` cast |
| `supabase/functions/beauty-assistant/index.ts` | `eslint-disable-next-line` for Deno npm param |
| `supabase/functions/auth-email-hook/index.ts` | `eslint-disable-next-line` for Deno npm param |
| `supabase/functions/ingest-catalog/index.ts` | Removed dead `updatedCount` variable |
| `supabase/migrations/20260319172304_revoke_has_role_from_public.sql` | **Security fix** — revoke `has_role` from PUBLIC |

---

## 🚀 Deployment Steps

### 1. Merge the PR

```bash
# Ensure branch is up to date
git fetch origin
git checkout copilot/fix-eslint-errors-and-security-advisory
git pull origin copilot/fix-eslint-errors-and-security-advisory
```

Merge via GitHub PR interface (squash or merge commit).

### 2. Apply the Supabase Migration

After merging to `main`, apply the migration to production:

```bash
# Link to your Supabase project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Push migration
supabase db push
```

### 3. Verify Deployment

```bash
# Run lint to confirm clean state
npm run lint

# Run type check
npm run typecheck

# Run tests
npm test
```

### 4. Post-Deployment Verification

- [ ] Check live site loads correctly: https://www.asperbeautyshop.com
- [ ] Verify Supabase migration applied (see SQL query above)
- [ ] Confirm no new JS console errors
- [ ] Smoke test: log in as authenticated user, verify role-gated pages work

---

## ⏪ Rollback

If issues arise, the code changes are pure TypeScript/ESLint fixes with no runtime
behavior changes. The only runtime-impacting change is the Supabase migration.

**To rollback the migration:**

```sql
-- Restore PUBLIC access (only if authenticated users report role check failures)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO PUBLIC;
```

**To revert the code:**

```bash
git revert 53fc34a
git push origin main
```

---

**Last Updated:** March 2026  
**Author:** @copilot  
**Related PR:** fix: resolve all ESLint errors + has\_role security advisory
