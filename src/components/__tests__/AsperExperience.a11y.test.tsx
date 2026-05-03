import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import { AsperExperience } from "@/components/home/AsperExperience";

// Polyfill IntersectionObserver for jsdom
beforeAll(() => {
  (globalThis as unknown as Record<string, unknown>).IntersectionObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    constructor() {}
  };
});

// Mock framer-motion to avoid animation complexity in tests
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => false,
    motion: {
      ...actual.motion,
      div: React.forwardRef(function MockMotionDiv(
        props: Record<string, unknown>,
        ref: React.Ref<HTMLDivElement>,
      ) {
        const { variants: _v, initial: _i, whileInView: _wiv, viewport: _vp, animate: _a, exit: _e, ...rest } = props;
        return <div ref={ref} {...(rest as React.HTMLAttributes<HTMLDivElement>)} />;
      }),
      section: React.forwardRef(function MockMotionSection(
        props: Record<string, unknown>,
        ref: React.Ref<HTMLElement>,
      ) {
        const { variants: _v, initial: _i, whileInView: _wiv, viewport: _vp, animate: _a, exit: _e, ...rest } = props;
        return <section ref={ref} {...(rest as React.HTMLAttributes<HTMLElement>)} />;
      }),
    },
  };
});

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({ language: "en", locale: "en", isRTL: false, dir: "ltr", t: (k: string) => k }),
}));

function renderExperience() {
  return render(
    <MemoryRouter>
      <AsperExperience />
    </MemoryRouter>,
  );
}

describe("AsperExperience — Accessibility", () => {
  it("renders a landmark section element", () => {
    renderExperience();
    const section = document.querySelector("section");
    expect(section).toBeTruthy();
  });

  it("renders prev/next navigation buttons", () => {
    renderExperience();
    const buttons = screen.getAllByRole("button");
    // Should have at least the prev and next carousel buttons
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("all interactive buttons are focusable (no tabIndex=-1)", () => {
    renderExperience();
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn.getAttribute("tabindex")).not.toBe("-1");
    }
  });

  it("renders navigation dots or links for carousel items", () => {
    renderExperience();
    // The carousel renders indicator dots or slide links
    const links = screen.queryAllByRole("link");
    const buttons = screen.getAllByRole("button");
    expect(links.length + buttons.length).toBeGreaterThan(0);
  });

  it("keyboard ArrowRight triggers next slide (no crash)", () => {
    renderExperience();
    expect(() => {
      fireEvent.keyDown(window, { key: "ArrowRight" });
      fireEvent.keyDown(window, { key: "ArrowLeft" });
    }).not.toThrow();
  });
});
