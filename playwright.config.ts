import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:8080",
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  ...(process.env.E2E_BASE_URL
    ? {}
    : {
        webServer: {
          command: "npm run dev",
          port: 8080,
          reuseExistingServer: true,
          timeout: 60_000,
        },
      }),
});
