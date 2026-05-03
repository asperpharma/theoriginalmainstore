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
