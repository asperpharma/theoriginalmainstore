/**
 * server.ts — Oxygen entry point for Asper Beauty Shop (Hydrogen / Remix)
 *
 * This file is the Worker entry executed by Shopify Oxygen.
 * It boots the Remix request handler, sets up the Hydrogen Storefront client,
 * and wires the Supabase + Shopify context into every request.
 */

import {
  createRequestHandler,
  getStorefrontHeaders,
  type AppLoadContext,
} from "@shopify/remix-oxygen";
import { createStorefrontClient } from "@shopify/hydrogen";

// Vite injects the server build in production via virtual module
// @ts-expect-error — virtual module injected by Vite at build time
import * as remixBuild from "virtual:remix/server-build";

export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext
  ): Promise<Response> {
    try {
      // ── Hydrogen Storefront client ──────────────────────────────────────────
      const { storefront } = createStorefrontClient({
        cache: await caches.open("hydrogen"),
        waitUntil: executionContext.waitUntil.bind(executionContext),
        i18n: { language: "EN", country: "JO" }, // Jordan (AR/EN bilingual)
        publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
        storeDomain: env.PUBLIC_STORE_DOMAIN,
        storefrontId: env.PUBLIC_STOREFRONT_ID,
        storefrontHeaders: getStorefrontHeaders(request),
      });

      // ── Remix request handler ───────────────────────────────────────────────
      const handleRequest = createRequestHandler({
        build: remixBuild,
        mode: env.NODE_ENV ?? "production",
        getLoadContext(): AppLoadContext {
          return {
            env,
            storefront,
            waitUntil: executionContext.waitUntil.bind(executionContext),
          };
        },
      });

      return await handleRequest(request);
    } catch (error) {
      console.error("Oxygen worker error", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};

// ── Cloudflare Workers global type augmentation ─────────────────────────────
declare global {
  interface Env {
    NODE_ENV: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PUBLIC_STOREFRONT_ID?: string;
    PRIVATE_STOREFRONT_API_TOKEN?: string;
    SESSION_SECRET: string;
  }
}
