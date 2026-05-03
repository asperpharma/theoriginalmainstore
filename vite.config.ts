import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React runtime — always loaded
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/react-router-dom/") || id.includes("node_modules/react-router/")) {
            return "vendor-react";
          }
          // Radix UI primitives — UI library
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }
          // Animation library
          if (id.includes("node_modules/framer-motion/")) {
            return "vendor-motion";
          }
          // Data fetching
          if (id.includes("node_modules/@tanstack/")) {
            return "vendor-query";
          }
          // Supabase client
          if (id.includes("node_modules/@supabase/")) {
            return "vendor-supabase";
          }
          // Charts — only used in admin pages
          if (id.includes("node_modules/recharts/") || id.includes("node_modules/d3-") || id.includes("node_modules/victory-")) {
            return "vendor-charts";
          }
          // Date utilities
          if (id.includes("node_modules/date-fns/")) {
            return "vendor-dates";
          }
          // Heavy Excel export — admin only
          if (id.includes("node_modules/exceljs/")) {
            return "vendor-excel";
          }
          // Markdown rendering (BeautyAssistant + AI pages only)
          if (id.includes("node_modules/react-markdown/") || id.includes("node_modules/remark") || id.includes("node_modules/unified") || id.includes("node_modules/vfile") || id.includes("node_modules/mdast") || id.includes("node_modules/micromark") || id.includes("node_modules/hast") || id.includes("node_modules/unist")) {
            return "vendor-markdown";
          }
          // Form validation
          if (id.includes("node_modules/react-hook-form/") || id.includes("node_modules/@hookform/") || id.includes("node_modules/zod/")) {
            return "vendor-forms";
          }
          // Other node_modules
          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }
        },
      },
    },
    target: "es2020",
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },
  esbuild: {
    // Drop console and debugger calls in production builds
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));
