import { describe, it, expect } from "vitest";
import {
  getPlaceholderImage,
  getProductImage,
  getSmartProductImage,
  formatJOD,
  formatPriceJOD,
} from "../productImageUtils";

describe("productImageUtils — placeholder selection", () => {
  it("prefers keyword-specific imagery over category fallback", () => {
    const url = getPlaceholderImage("Makeup", "Ultra Lash Mascara");
    expect(url).toBe(
      "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=800&q=80",
    );
  });

  it("falls back to category imagery when no keyword matches", () => {
    const url = getPlaceholderImage("Hair Care", "Silky Shine Duo");
    expect(url).toBe(
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80",
    );
  });

  it("returns the default image when neither keyword nor category matches", () => {
    const url = getPlaceholderImage("Mystery", "Unknown Product");
    expect(url).toBe(
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    );
  });
});

describe("productImageUtils — product image resolution", () => {
  it("returns the provided image when a non-empty URL exists", () => {
    const url = getProductImage(
      "https://example.com/custom.jpg",
      "Skin Care",
      "Glow Serum",
    );
    expect(url).toBe("https://example.com/custom.jpg");
  });

  it("generates a placeholder when the source image is empty or missing", () => {
    const url = getProductImage("", "Skin Care", "Renewal Cream");
    expect(url).toBe(
      "https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?auto=format&fit=crop&w=800&q=80",
    );
  });
});

describe("productImageUtils — pricing formatters", () => {
  it("formats valid amounts as BeautyBox-style JOD", () => {
    expect(formatJOD(16)).toBe("16.000 JD");
  });

  it("returns an em dash for nullish, NaN, or negative values", () => {
    expect(formatJOD(null)).toBe("—");
    expect(formatJOD(Number.NaN)).toBe("—");
    expect(formatJOD(-5)).toBe("—");
  });

  it("supports the legacy iHerb-style formatter when requested", () => {
    expect(formatPriceJOD(2.435, "iherb")).toBe("JOD 2.435");
  });
});

describe("productImageUtils — smart image generation", () => {
  it("embeds the encoded query in the Unsplash URL", () => {
    const url = getSmartProductImage("Glow Serum", "Skin Care");
    expect(url).toContain(
      "Skin%20Care%20Glow%20Serum%20product%20photography",
    );
  });
});
