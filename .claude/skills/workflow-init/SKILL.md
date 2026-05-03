---
name: workflow-init
description: Initialize Vercel Workflow in the Asper Beauty Shop repo. Installs the SDK, scaffolds a typed workflow file, and wires up the route handler required to run durable workflows on Vercel.
disable-model-invocation: true
license: MIT
metadata:
  author: asperpharma
  version: "1.0.0"
---

# Vercel Workflow — Initialize

Scaffold a Vercel Workflow runtime in this repo so long-running, resumable tasks (catalog syncs, bulk email, Shopify reconciliations) can run as durable workflows instead of one-shot Edge Functions.

## Usage

```
/workflow-init                        # scaffold with default workflow name: sample-workflow
/workflow-init <workflow-name>        # scaffold with a custom workflow name
```

Example: `/workflow-init resync-shopify`

## When to use this skill

Use Vercel Workflow when you need:

- Multi-step tasks that must survive process restarts (Shopify full catalog resync, Gemini batch enrichment)
- Steps that wait on external webhooks (Gorgias ticket resolution, ManyChat follow-ups)
- Scheduled fan-out (broadcast to Telegram/Slack audiences with retry per recipient)

Do NOT use for:

- Simple request/response Edge Functions — keep those in `supabase/functions/`
- Sub-second work — the workflow runtime adds overhead
- Anything that needs Supabase service-role access (use Supabase Edge Functions, which already have secrets scoped correctly)

## Install

```bash
npm install @vercel/workflow
```

Confirm `@vercel/node` stays on a compatible major (repo currently pins `^3.0.0`). Do NOT install `@vercel/workflow-plugin` — that package is Next.js-only for build-time optimization and this repo is Vite.

## Files to scaffold

### 1. Workflow definition — `api/workflows/<workflow-name>.ts`

```ts
import { defineWorkflow, step } from "@vercel/workflow";

interface Input {
  triggeredBy: string;
}

export default defineWorkflow<Input>("<workflow-name>", async (ctx, input) => {
  const snapshot = await step("fetch-snapshot", async () => {
    // idempotent fetch — runs once, result is memoized across retries
    return { at: new Date().toISOString(), triggeredBy: input.triggeredBy };
  });

  await step("notify", async () => {
    // side effects go in their own step so retries are safe
    console.log("workflow ran", snapshot);
  });

  return snapshot;
});
```

### 2. Route handler — `api/workflows/[workflow].ts`

```ts
import { handleWorkflowRequest } from "@vercel/workflow/server";

export const config = { runtime: "nodejs" };

export default handleWorkflowRequest({
  workflowsDir: "api/workflows",
});
```

### 3. `vercel.json` — register the handler

Add (or merge) to the project's `vercel.json`:

```json
{
  "functions": {
    "api/workflows/**": {
      "runtime": "nodejs20.x",
      "maxDuration": 300
    }
  }
}
```

### 4. Trigger client — `src/lib/workflow-client.ts`

```ts
import { createClient } from "@vercel/workflow/client";

// Production is served by Cloudflare Worker `aws-shopify-cloude` — a relative
// path would hit Cloudflare, not Vercel. VITE_WORKFLOW_BASE_URL must be an
// absolute URL to the Vercel deployment (e.g. https://<project>.vercel.app).
const baseUrl = import.meta.env.VITE_WORKFLOW_BASE_URL;
if (!baseUrl) {
  throw new Error("VITE_WORKFLOW_BASE_URL is required — set it in the Cloudflare build env");
}

export const workflowClient = createClient({ baseUrl });
```

## Required env vars

Because the frontend is built and served via the Cloudflare Worker but the workflow runtime lives on Vercel, the two env vars go in different places:

| Var | Where to set | Purpose |
|---|---|---|
| `WORKFLOW_SIGNING_SECRET` | Vercel (Production + Preview) | HMAC secret the server-side handler uses to verify resume callbacks |
| `VITE_WORKFLOW_BASE_URL` | Cloudflare / frontend build pipeline | Absolute URL of the Vercel deployment (baked into the client bundle at build time) |

```bash
# Server-side secret — Vercel only
vercel env add WORKFLOW_SIGNING_SECRET
```

Set `VITE_WORKFLOW_BASE_URL` in the Cloudflare Worker's build environment (or wherever the Vite build runs in CI). A `VITE_*` var added via `vercel env add` only helps if the frontend is actually built on Vercel — in this repo it isn't.

Never expose `WORKFLOW_SIGNING_SECRET` to the browser — it belongs on the server only.

## Asper-specific conventions

- Workflows live in `api/workflows/` — this is the Vercel convention and matches the existing `@vercel/node` pattern already in this repo
- Filename = workflow ID (kebab-case). `resync-shopify.ts` → workflow `"resync-shopify"`
- All external calls (Shopify, Supabase, Gemini) must go inside a `step(...)` block so retries are idempotent
- For Supabase writes from a workflow, use the anon key via an Edge Function; do NOT embed the service-role key in a workflow — Vercel Workflow runs outside the Supabase trust boundary
- For Telegram/Slack notifications, call the existing `telegram-notify` / `slack-bot` edge functions from inside a step — do not re-implement the transport

## Verify

After scaffolding, confirm everything wires up:

```bash
npm run typecheck        # must stay clean
npm run lint             # must stay clean
vercel dev               # spins up the workflow runtime locally
curl -X POST http://localhost:3000/api/workflows/<workflow-name> \
  -H 'content-type: application/json' \
  -d '{"triggeredBy":"local-test"}'
```

A successful response returns a workflow run ID. Tail logs with `vercel logs --follow`.

## Checklist before finishing

- [ ] `@vercel/workflow` added to `package.json` (do NOT add `@vercel/workflow-plugin` — Next.js-only)
- [ ] `api/workflows/<name>.ts` defines exactly one workflow with typed input
- [ ] Every side effect is inside a `step(...)` block
- [ ] `vercel.json` registers `api/workflows/**` with an appropriate `maxDuration`
- [ ] `WORKFLOW_SIGNING_SECRET` set in Vercel env (Production + Preview)
- [ ] `VITE_WORKFLOW_BASE_URL` set in the Cloudflare build env as an absolute URL pointing at the Vercel deployment
- [ ] `npm run typecheck` and `npm run lint` pass
- [ ] No service-role key, Shopify admin token, or Gemini key embedded in workflow source

## Common errors

| Error | Cause | Fix |
|---|---|---|
| `Workflow not found: <name>` | Filename doesn't match the ID passed to `defineWorkflow` | Rename the file to match, kebab-case |
| `Signature verification failed` | `WORKFLOW_SIGNING_SECRET` missing or differs between envs | Set the same secret in Production and Preview |
| `Step is not idempotent` warning | Mutation happening outside a `step(...)` block | Move the side effect inside a step |
| Workflow hangs past `maxDuration` | Step awaits a webhook that never arrives | Add a `ctx.sleep(...)` timeout branch and fail the step explicitly |
