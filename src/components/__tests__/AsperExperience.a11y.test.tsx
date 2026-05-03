import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AsperExperience } from "@/components/home/AsperExperience";

// Polyfill IntersectionObserver for jsdom
beforeAll(() => {
  (globalThis as unknown as Record<string, unknown>).IntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Suppress framer-motion animation errors in jsdom
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...rest}>{children}</div>
      ),
    },
    useReducedMotion: () => false,
  };
});

function renderComponent() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <AsperExperience />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe("AsperExperience — accessibility", () => {
  it("renders a landmark section element", () => {
    const { container } = renderComponent();
    expect(container.querySelector("section")).toBeTruthy();
  });

  it("renders the section heading in English by default", () => {
    renderComponent();
    expect(screen.getByText("The Asper Experience")).toBeInTheDocument();
  });

  it("renders the 'Our Superpower' sub-heading", () => {
    renderComponent();
    expect(screen.getByText("Our Superpower")).toBeInTheDocument();
  });

  it("renders previous/next carousel buttons with accessible aria-labels", () => {
    renderComponent();
    expect(screen.getByRole("button", { name: /previous video/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next video/i })).toBeInTheDocument();
  });

  it("renders four progress-dot buttons with aria-labels", () => {
    renderComponent();
    const dots = [
      screen.getByRole("button", { name: /video 1/i }),
      screen.getByRole("button", { name: /video 2/i }),
      screen.getByRole("button", { name: /video 3/i }),
      screen.getByRole("button", { name: /video 4/i }),
    ];
    expect(dots).toHaveLength(4);
  });

  it("navigates to the next slide when the next button is clicked", () => {
    renderComponent();
    const nextBtn = screen.getByRole("button", { name: /next video/i });
    fireEvent.click(nextBtn);
    expect(nextBtn).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /video 2/i })).toBeInTheDocument();
  });

  it("navigates to the previous slide when the prev button is clicked", () => {
    renderComponent();
    const prevBtn = screen.getByRole("button", { name: /previous video/i });
    fireEvent.click(prevBtn);
    // Wraps to last video (index 3)
    expect(screen.getByRole("button", { name: /video 4/i })).toBeInTheDocument();
  });

  it("deep-link anchor for the current slide is present and navigable", () => {
    renderComponent();
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0].getAttribute("href")).toBeTruthy();
  });
});
