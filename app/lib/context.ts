/**
 * app/lib/context.ts — Hydrogen app context helpers
 *
 * Re-exports the Hydrogen AppLoadContext type so routes can
 * destructure storefront / env cleanly without repeating the declaration.
 */

import type { AppLoadContext } from "@shopify/remix-oxygen";
import type { Storefront } from "@shopify/hydrogen";

export interface AsperContext extends AppLoadContext {
  storefront: Storefront;
  env: {
    NODE_ENV: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PUBLIC_STOREFRONT_ID?: string;
    PRIVATE_STOREFRONT_API_TOKEN?: string;
    SESSION_SECRET: string;
  };
}

/**
 * Type-narrowing helper for use inside Remix loaders / actions.
 * Throws if the context is missing (should never happen in production).
 */
export function getAsperContext(context: AppLoadContext): AsperContext {
  if (!("storefront" in context)) {
    throw new Error("storefront is not present in AppLoadContext");
  }
  return context as AsperContext;
}
