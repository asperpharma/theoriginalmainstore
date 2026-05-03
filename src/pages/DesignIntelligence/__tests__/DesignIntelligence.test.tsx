import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";

// ── Mock Supabase (required by Header/Footer via auth hooks) ──
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    channel: () => ({ on: () => ({ subscribe: () => ({}) }), unsubscribe: vi.fn() }),
    rpc: () => Promise.resolve({ data: [], error: null }),
    functions: { invoke: vi.fn() },
  },
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// ── Stub requestAnimationFrame for JSDOM ──
beforeEach(() => {
  vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((cb) => {
    // Call once with a fixed timestamp so the hook initialises without looping
    setTimeout(() => cb(0), 0);
    return 1;
  });
  vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => undefined);
});

const renderPage = async () => {
  const { QueryClient, QueryClientProvider } = await import("@tanstack/react-query");
  const { LanguageProvider } = await import("@/contexts/LanguageContext");
  const { default: DesignIntelligence } = await import("../DesignIntelligence");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <DesignIntelligence />
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>,
  );
};

// ── pillars.ts data integrity ──
describe("PILLARS data", () => {
  it("exports exactly 7 pillars", async () => {
    const { PILLARS } = await import("../pillars");
    expect(PILLARS).toHaveLength(7);
  });

  it("each pillar has a unique numeral '01'..'07'", async () => {
    const { PILLARS } = await import("../pillars");
    const numerals = PILLARS.map((p) => p.numeral);
    expect(numerals).toEqual(["01", "02", "03", "04", "05", "06", "07"]);
  });

  it("every pillar has 3-5 bullet points", async () => {
    const { PILLARS } = await import("../pillars");
    for (const pillar of PILLARS) {
      expect(pillar.points.length).toBeGreaterThanOrEqual(3);
      expect(pillar.points.length).toBeLessThanOrEqual(5);
    }
  });

  it("index matches position (1-based)", async () => {
    const { PILLARS } = await import("../pillars");
    PILLARS.forEach((p, i) => {
      expect(p.index).toBe(i + 1);
    });
  });
});

// ── Page renders ──
describe("DesignIntelligence page", () => {
  it("renders the page heading", async () => {
    await renderPage();
    expect(screen.getByRole("heading", { name: /Design Intelligence/i })).toBeInTheDocument();
  });

  it("renders the pillar navigation", async () => {
    await renderPage();
    expect(screen.getByRole("navigation", { name: /Design pillars/i })).toBeInTheDocument();
  });

  it("renders the first pillar by default", async () => {
    await renderPage();
    expect(screen.getByRole("article", { name: /Pillar 01/i })).toBeInTheDocument();
  });

  it("renders the timer progress bar", async () => {
    await renderPage();
    expect(screen.getByRole("progressbar", { name: /auto-advance timer/i })).toBeInTheDocument();
  });

  it("renders prev/next/pause controls", async () => {
    await renderPage();
    expect(screen.getByRole("button", { name: /Previous pillar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next pillar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pause auto-advance/i })).toBeInTheDocument();
  });

  it("clicking Next advances to the second pillar", async () => {
    await renderPage();
    const nextBtn = screen.getByRole("button", { name: /Next pillar/i });
    act(() => {
      fireEvent.click(nextBtn);
    });
    expect(screen.getByRole("article", { name: /Pillar 02/i })).toBeInTheDocument();
  });

  it("clicking Pause toggles to Resume label", async () => {
    await renderPage();
    const pauseBtn = screen.getByRole("button", { name: /Pause auto-advance/i });
    act(() => {
      fireEvent.click(pauseBtn);
    });
    expect(screen.getByRole("button", { name: /Resume auto-advance/i })).toBeInTheDocument();
  });

  it("clicking a spine pillar navigates to that pillar", async () => {
    await renderPage();
    // Click the spine button for pillar 05
    const spineBtn = screen.getByRole("button", { name: /Pillar 05/i });
    act(() => {
      fireEvent.click(spineBtn);
    });
    expect(screen.getByRole("article", { name: /Pillar 05/i })).toBeInTheDocument();
  });

  it("ArrowRight keyboard advances the pillar", async () => {
    await renderPage();
    act(() => {
      fireEvent.keyDown(document, { key: "ArrowRight" });
    });
    expect(screen.getByRole("article", { name: /Pillar 02/i })).toBeInTheDocument();
  });

  it("Space keyboard toggles pause", async () => {
    await renderPage();
    act(() => {
      fireEvent.keyDown(document, { key: " " });
    });
    expect(screen.getByRole("button", { name: /Resume auto-advance/i })).toBeInTheDocument();
  });
});
