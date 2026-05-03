import { describe, it, expect } from "vitest";
import {
  summarizeDescription,
  translateToArabic,
  translateTitle,
  getLocalizedDescription,
  getLocalizedCategory,
  extractKeyBenefits,
  getProductCategory,
} from "../productUtils";

// ─────────────────────────────────────────────
// summarizeDescription
// ─────────────────────────────────────────────
describe("summarizeDescription()", () => {
  it("returns empty string for empty input", () => {
    expect(summarizeDescription("")).toBe("");
  });

  it("strips HTML tags", () => {
    const result = summarizeDescription("<p>Great product.</p>");
    expect(result).not.toContain("<p>");
    expect(result).toContain("Great product");
  });

  it("returns the first sentence when short enough", () => {
    const result = summarizeDescription("This is sentence one. This is sentence two.");
    expect(result).toContain("This is sentence one");
  });

  it("appends a second sentence when the first is very short", () => {
    const result = summarizeDescription("Short. This is the second sentence that adds value.");
    expect(result).toContain("second sentence");
  });

  it("truncates at maxLength with ellipsis", () => {
    const long = "a ".repeat(200);
    const result = summarizeDescription(long, 50);
    expect(result.length).toBeLessThanOrEqual(50);
    expect(result.endsWith("...")).toBe(true);
  });

  it("respects a custom maxLength", () => {
    const text = "This is a fairly long description with many words that go on and on.";
    const result = summarizeDescription(text, 20);
    expect(result.length).toBeLessThanOrEqual(20);
  });
});

// ─────────────────────────────────────────────
// translateToArabic
// ─────────────────────────────────────────────
describe("translateToArabic()", () => {
  it("returns empty string for empty input", () => {
    expect(translateToArabic("")).toBe("");
  });

  it("translates 'serum' to the Arabic equivalent", () => {
    const result = translateToArabic("serum");
    expect(result).toContain("سيروم");
  });

  it("translates 'moisturizer' to the Arabic equivalent", () => {
    const result = translateToArabic("moisturizer");
    expect(result).toContain("مرطب");
  });

  it("translates 'mascara' to the Arabic equivalent", () => {
    const result = translateToArabic("mascara");
    expect(result).toContain("ماسكارا");
  });

  it("handles mixed-case input", () => {
    const result = translateToArabic("SERUM");
    expect(result).toContain("سيروم");
  });

  it("does not crash on strings with no known translations", () => {
    expect(() => translateToArabic("xyzunknownterm")).not.toThrow();
  });
});

// ─────────────────────────────────────────────
// translateTitle
// ─────────────────────────────────────────────
describe("translateTitle()", () => {
  it("returns original title for English language", () => {
    expect(translateTitle("Vitamin C Serum", "en")).toBe("Vitamin C Serum");
  });

  it("translates title for Arabic language", () => {
    const result = translateTitle("serum", "ar");
    expect(result).toContain("سيروم");
  });

  it("returns empty string if title is empty", () => {
    expect(translateTitle("", "en")).toBe("");
    expect(translateTitle("", "ar")).toBe("");
  });
});

// ─────────────────────────────────────────────
// getLocalizedDescription
// ─────────────────────────────────────────────
describe("getLocalizedDescription()", () => {
  it("returns summarized English description in English mode", () => {
    const desc = "A great moisturizing serum. It hydrates deeply for 24 hours.";
    const result = getLocalizedDescription(desc, "en");
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toContain("مرطب");
  });

  it("returns Arabic translation in Arabic mode", () => {
    const result = getLocalizedDescription("serum moisturizer", "ar");
    // Should contain at least one Arabic character
    expect(result).toMatch(/[\u0600-\u06FF]/);
  });

  it("returns empty string for empty description", () => {
    expect(getLocalizedDescription("", "en")).toBe("");
    expect(getLocalizedDescription("", "ar")).toBe("");
  });
});

// ─────────────────────────────────────────────
// getLocalizedCategory
// ─────────────────────────────────────────────
describe("getLocalizedCategory()", () => {
  it("returns the original category in English mode", () => {
    expect(getLocalizedCategory("Skin Care", "en")).toBe("Skin Care");
  });

  it("translates known category to Arabic", () => {
    const result = getLocalizedCategory("Skin Care", "ar");
    expect(result).toBe("العناية بالبشرة");
  });

  it("translates 'Make Up' to Arabic", () => {
    expect(getLocalizedCategory("Make Up", "ar")).toBe("المكياج");
  });

  it("falls back to translateToArabic for unknown categories", () => {
    const result = getLocalizedCategory("serum", "ar");
    // Should contain at least some Arabic text or the fallback translation
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns empty string for empty input in English", () => {
    expect(getLocalizedCategory("", "en")).toBe("");
  });
});

// ─────────────────────────────────────────────
// extractKeyBenefits
// ─────────────────────────────────────────────
describe("extractKeyBenefits()", () => {
  it("returns empty array for empty description", () => {
    expect(extractKeyBenefits("")).toEqual([]);
  });

  it("detects hydration benefit from 'hydrating' keyword", () => {
    const benefits = extractKeyBenefits("An intensely hydrating face serum.");
    expect(benefits.some((b) => /hydrat|moistur/i.test(b))).toBe(true);
  });

  it("detects sun protection from 'SPF' keyword", () => {
    const benefits = extractKeyBenefits("SPF 50+ daily sunscreen for all skin types.");
    expect(benefits.some((b) => /sun|protect/i.test(b))).toBe(true);
  });

  it("detects anti-aging benefit", () => {
    const benefits = extractKeyBenefits("Advanced anti-aging formula with retinol.");
    expect(benefits.some((b) => /anti.?aging|aging/i.test(b))).toBe(true);
  });

  it("returns benefits in Arabic when language is 'ar'", () => {
    const benefits = extractKeyBenefits("hydrating moisturizer for dry skin", "ar");
    // Arabic benefits should contain at least one Arabic character
    const hasArabic = benefits.some((b) => /[\u0600-\u06FF]/.test(b));
    expect(hasArabic).toBe(true);
  });

  it("returns at most 4 benefits", () => {
    const desc =
      "Hydrating, moisturizing, anti-aging, SPF, nourishing, firming, repairing, brightening, cleansing product";
    const benefits = extractKeyBenefits(desc);
    expect(benefits.length).toBeLessThanOrEqual(4);
  });

  it("does not return duplicate benefits", () => {
    const desc = "hydrating hydrating hydrating";
    const benefits = extractKeyBenefits(desc);
    const unique = new Set(benefits);
    expect(unique.size).toBe(benefits.length);
  });
});

// ─────────────────────────────────────────────
// getProductCategory
// ─────────────────────────────────────────────
describe("getProductCategory()", () => {
  it("returns productType when provided", () => {
    expect(getProductCategory("Serum", "Vichy")).toBe("Serum");
  });

  it("falls back to vendor when productType is absent", () => {
    expect(getProductCategory(undefined, "Vichy")).toBe("Vichy");
  });

  it("returns 'Beauty' when both are absent", () => {
    expect(getProductCategory(undefined, undefined)).toBe("Beauty");
  });

  it("returns 'Beauty' when productType is empty string", () => {
    expect(getProductCategory("", undefined)).toBe("Beauty");
  });
});
