import { describe, it, expect } from "vitest";
import {
  formatJOD,
  formatPriceJOD,
  getPlaceholderImage,
  getProductImage,
  CATEGORY_FILTER_TO_DB,
} from "../productImageUtils";

// ─────────────────────────────────────────────
// formatJOD
// ─────────────────────────────────────────────
describe("formatJOD()", () => {
  it("formats a positive number in JOD with 3 decimal places", () => {
    const result = formatJOD(16);
    expect(result).toMatch(/16\.000\s*JD/);
  });

  it("formats a decimal price correctly", () => {
    const result = formatJOD(4.5);
    expect(result).toMatch(/4\.500\s*JD/);
  });

  it("returns '—' for null", () => {
    expect(formatJOD(null)).toBe("—");
  });

  it("returns '—' for undefined", () => {
    expect(formatJOD(undefined)).toBe("—");
  });

  it("returns '—' for NaN", () => {
    expect(formatJOD(NaN)).toBe("—");
  });

  it("returns '—' for a negative amount", () => {
    expect(formatJOD(-5)).toBe("—");
  });

  it("formats zero correctly", () => {
    const result = formatJOD(0);
    expect(result).toMatch(/0\.000\s*JD/);
  });
});

// ─────────────────────────────────────────────
// formatPriceJOD (deprecated wrapper)
// ─────────────────────────────────────────────
describe("formatPriceJOD()", () => {
  it("returns beautybox style by default", () => {
    const result = formatPriceJOD(10);
    expect(result).toMatch(/10\.000\s*JD/);
  });

  it("returns iherb style when specified", () => {
    const result = formatPriceJOD(10, "iherb");
    expect(result).toBe("JOD 10.000");
  });
});

// ─────────────────────────────────────────────
// getPlaceholderImage
// ─────────────────────────────────────────────
describe("getPlaceholderImage()", () => {
  it("returns a URL string for any input", () => {
    const url = getPlaceholderImage("Skin Care", "Hyaluronic Acid Serum");
    expect(typeof url).toBe("string");
    expect(url).toMatch(/^https?:\/\//);
  });

  it("returns a keyword-matched image for 'serum' in title", () => {
    const url = getPlaceholderImage("Skin Care", "Vitamin C Serum");
    expect(url).toContain("unsplash.com");
  });

  it("falls back to category image when no keyword matches", () => {
    const url = getPlaceholderImage("Skin Care", "Unknown Product XYZ");
    // Should still return a valid URL from category fallback
    expect(url).toMatch(/^https?:\/\//);
  });

  it("returns a default image for unknown category and title", () => {
    const url = getPlaceholderImage("Unknown Category", "Unknown Thing");
    expect(url).toMatch(/^https?:\/\//);
  });

  it("matches 'mascara' keyword to makeup image", () => {
    const url = getPlaceholderImage("Makeup", "Volume Mascara Black");
    expect(url).toContain("unsplash.com");
  });

  it("matches 'lipstick' keyword", () => {
    const url = getPlaceholderImage("Makeup", "Matte Lipstick Red");
    expect(url).toContain("unsplash.com");
  });
});

// ─────────────────────────────────────────────
// getProductImage
// ─────────────────────────────────────────────
describe("getProductImage()", () => {
  it("returns the provided imageUrl when it is non-empty", () => {
    const customUrl = "https://cdn.shopify.com/product.jpg";
    expect(getProductImage(customUrl, "Skin Care", "Serum")).toBe(customUrl);
  });

  it("falls back to placeholder when imageUrl is null", () => {
    const url = getProductImage(null, "Skin Care", "Serum");
    expect(url).toMatch(/^https?:\/\//);
  });

  it("falls back to placeholder when imageUrl is undefined", () => {
    const url = getProductImage(undefined, "Skin Care", "Serum");
    expect(url).toMatch(/^https?:\/\//);
  });

  it("falls back to placeholder when imageUrl is an empty string", () => {
    const url = getProductImage("", "Makeup", "Foundation");
    expect(url).toMatch(/^https?:\/\//);
  });

  it("falls back to placeholder when imageUrl is only whitespace", () => {
    const url = getProductImage("   ", "Makeup", "Foundation");
    expect(url).toMatch(/^https?:\/\//);
  });
});

// ─────────────────────────────────────────────
// CATEGORY_FILTER_TO_DB mapping
// ─────────────────────────────────────────────
describe("CATEGORY_FILTER_TO_DB", () => {
  it("contains entries for all primary categories", () => {
    const expectedKeys = ["skin-care", "makeup", "hair-care", "fragrance", "body-care", "tools-devices"];
    for (const key of expectedKeys) {
      expect(CATEGORY_FILTER_TO_DB[key]).toBeDefined();
      expect(Array.isArray(CATEGORY_FILTER_TO_DB[key])).toBe(true);
    }
  });

  it("skin-care maps to 'Skin Care'", () => {
    expect(CATEGORY_FILTER_TO_DB["skin-care"]).toContain("Skin Care");
  });

  it("makeup maps to 'Makeup'", () => {
    expect(CATEGORY_FILTER_TO_DB["makeup"]).toContain("Makeup");
  });

  it("hair-care maps to 'Hair Care'", () => {
    expect(CATEGORY_FILTER_TO_DB["hair-care"]).toContain("Hair Care");
  });
});
