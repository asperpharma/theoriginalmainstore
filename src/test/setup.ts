import "@testing-library/jest-dom";
import { vi } from "vitest";

// Provide safe defaults for modules that require Supabase env vars during tests.
vi.stubEnv("VITE_SUPABASE_URL", process.env.VITE_SUPABASE_URL ?? "http://localhost:54321");
vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "test-key");

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
