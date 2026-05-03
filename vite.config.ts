import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const suppressPostcssFromWarning = () => ({
  name: "suppress-postcss-from-warning",
  apply: "build",
  configResolved(config) {
    const originalWarnOnce = config.logger.warnOnce;
    config.logger.warnOnce = (...args) => {
      const [message] = args;
      if (
        typeof message === "string" &&
        message.includes("did not pass the `from` option to `postcss.parse`")
      ) {
        return;
      }
      return originalWarnOnce(...args);
    };
  },
});

export default defineConfig(({ mode }) => ({
    server: {
          host: "::",
          port: 8080,
    },
    plugins: [
          suppressPostcssFromWarning(),
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
          // Raised from 600 to suppress large-chunk warnings for this app size
          chunkSizeWarningLimit: 1000,
          rollupOptions: {
                  output: {
                            manualChunks: {
                                        // Core React runtime - cached across all pages
                              "vendor-react": ["react", "react-dom", "react-router-dom"],
                                        // Radix UI components
                                        "vendor-radix": [
                                                      "@radix-ui/react-accordion",
                                                      "@radix-ui/react-alert-dialog",
                                                      "@radix-ui/react-avatar",
                                                      "@radix-ui/react-checkbox",
                                                      "@radix-ui/react-dialog",
                                                      "@radix-ui/react-dropdown-menu",
                                                      "@radix-ui/react-label",
                                                      "@radix-ui/react-navigation-menu",
                                                      "@radix-ui/react-popover",
                                                      "@radix-ui/react-progress",
                                                      "@radix-ui/react-radio-group",
                                                      "@radix-ui/react-scroll-area",
                                                      "@radix-ui/react-select",
                                                      "@radix-ui/react-separator",
                                                      "@radix-ui/react-slot",
                                                      "@radix-ui/react-switch",
                                                      "@radix-ui/react-tabs",
                                                      "@radix-ui/react-toast",
                                                      "@radix-ui/react-toggle",
                                                      "@radix-ui/react-tooltip",
                                                    ],
                                        // Form & validation
                                        "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
                                        // Icons (large package, cache separately)
                                        "vendor-icons": ["lucide-react"],
                                        // Supabase client
            "vendor-supabase": ["@supabase/supabase-js"],
                                        // Query & state
                                        "vendor-query": ["@tanstack/react-query"],
                            },
                  },
          },
    },
    esbuild: {
          // Drop console and debugger calls in production builds
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
}));
