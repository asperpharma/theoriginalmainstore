/**
 * vite.hydrogen.config.ts — Hydrogen / Oxygen storefront build configuration
 *
 * Usage:
 *   npm run hydrogen:dev    — local dev with HMR
 *   npm run hydrogen:build  — production build for Oxygen deployment
 *
 * This is a SEPARATE config from vite.config.ts (main SPA) and
 * vite.shopify.config.ts (Liquid-theme IIFE bundle).
 *
 * References:
 *  https://shopify.dev/docs/storefronts/headless/hydrogen/configuration
 */

import { defineConfig } from "vite";
import { hydrogen } from "@shopify/hydrogen/vite";
import { oxygen } from "@shopify/mini-oxygen/vite";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [
    hydrogen(),
    oxygen(),
    remix({
      presets: [hydrogen.preset()],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
  build: {
    // Oxygen Worker target
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      include: ["isbot", "@shopify/hydrogen"],
    },
  },
});
