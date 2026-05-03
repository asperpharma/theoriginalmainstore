/**
 * vite.shopify.config.ts
 *
 * Shopify-theme build configuration.
 *
 * Usage:  npm run build:shopify
 *
 * Output:
 *   assets/asper-beauty.js   — IIFE bundle (all JS, including vendor chunks)
 *   assets/asper-beauty.css  — compiled CSS
 *
 * These stable filenames are referenced directly in layout/theme.liquid so
 * that Shopify's asset CDN can serve them without requiring dynamic file-name
 * resolution in Liquid.
 *
 * Differences from the default vite.config.ts:
 *  - build.lib (IIFE format) instead of a multi-chunk Rollup output
 *  - outDir: 'assets' (Shopify theme assets directory)
 *  - emptyOutDir: false (preserves existing banners/, presentations/, etc.)
 *  - No componentTagger (dev-only) or source maps
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "assets",
    emptyOutDir: false,
    target: "es2020",
    cssMinify: true,
    sourcemap: false,
    lib: {
      entry: path.resolve(__dirname, "src/main.tsx"),
      name: "AsperBeauty",
      formats: ["iife"],
      fileName: () => "asper-beauty.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "asper-beauty.css";
          return "[name][extname]";
        },
      },
    },
  },
});
