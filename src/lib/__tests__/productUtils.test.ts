import { describe, expect, it } from "vitest";

import {
  extractKeyBenefits,
  getLocalizedCategory,
  getLocalizedDescription,
  getProductCategory,
  summarizeDescription,
  translateTitle,
} from "../productUtils";

describe("productUtils", () => {
  it("summarizes and cleans descriptions", () => {
    const summary = summarizeDescription(
      "<p>Hydrating serum. Deep moisture support! SPF protection included.</p>",
    );

    expect(summary).toBe("Hydrating serum. Deep moisture support");
  });

  it("truncates overly long summaries with an ellipsis", () => {
    const longText = "Nourishing".repeat(50);
    const summary = summarizeDescription(longText, 50);

    expect(summary.length).toBeLessThanOrEqual(50);
    expect(summary.endsWith("...")).toBe(true);
  });

  it("localizes descriptions into Arabic when requested", () => {
    const localized = getLocalizedDescription("Hydrating gel with vitamin c", "ar");

    expect(localized).toContain("مرطب");
    expect(localized).toContain("جل");
    expect(localized).toContain("فيتامين");
  });

  it("translates product titles only when language is Arabic", () => {
    expect(translateTitle("Premium Glow Serum", "en")).toBe("Premium Glow Serum");
    expect(translateTitle("Premium Glow Serum", "ar")).toContain("سيروم");
  });

  it("returns mapped Arabic categories when available", () => {
    expect(getLocalizedCategory("Hair Care", "ar")).toBe("العناية بالشعر");
    expect(getLocalizedCategory("Custom Type", "ar")).toContain("custom");
  });

  it("extracts up to four key benefits in the requested language", () => {
    const benefits = extractKeyBenefits(
      "Hydrating brightening sun protection with gentle formula for sensitive skin.",
      "ar",
    );

    expect(benefits).toEqual([
      "ترطيب عميق",
      "تفتيح",
      "حماية من الشمس",
      "تركيبة لطيفة",
    ]);
  });

  it("prefers product type over vendor when selecting category", () => {
    expect(getProductCategory("Serum", "Vendor")).toBe("Serum");
    expect(getProductCategory(undefined, "Vendor")).toBe("Vendor");
    expect(getProductCategory(undefined, undefined)).toBe("Beauty");
  });
});
