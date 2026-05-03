import { describe, it, expect, vi, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { AsperExperience } from "../home/AsperExperience";

expect.extend(toHaveNoViolations);

// ── Polyfill IntersectionObserver for jsdom ──
beforeAll(() => {
  (globalThis as unknown as Record<string, unknown>).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    constructor() {}
  };
});

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "en",
    locale: "en",
    setLanguage: vi.fn(),
    t: (key: string) => key,
    isRTL: false,
    dir: "ltr",
  }),
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => false,
    motion: {
      ...actual.motion,
      div: React.forwardRef(function MockMotionDiv(props: Record<string, unknown>, ref: React.Ref<HTMLDivElement>) {
        const { variants: _v, initial: _i, whileInView: _wiv, viewport: _vp, animate: _a, exit: _e, ...rest } = props;
        return <div ref={ref} {...(rest as React.HTMLAttributes<HTMLDivElement>)} />;
      }),
    },
  };
});

describe("AsperExperience: Accessibility", () => {
  it("should have no axe violations", async () => {
    const { container } = render(
      <MemoryRouter>
        <AsperExperience />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("navigation buttons should have accessible labels", () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <AsperExperience />
      </MemoryRouter>
    );
    expect(getByLabelText("Previous video")).toBeTruthy();
    expect(getByLabelText("Next video")).toBeTruthy();
  });

  it("progress dot buttons should have accessible labels", () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <AsperExperience />
      </MemoryRouter>
    );
    expect(getByLabelText("Video 1")).toBeTruthy();
    expect(getByLabelText("Video 2")).toBeTruthy();
    expect(getByLabelText("Video 3")).toBeTruthy();
    expect(getByLabelText("Video 4")).toBeTruthy();
  });
});

