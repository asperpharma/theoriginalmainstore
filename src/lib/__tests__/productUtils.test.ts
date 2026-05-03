import { describe, expect, it } from "vitest";
import {
  extractKeyBenefits,
  getLocalizedCategory,
  getLocalizedDescription,
  getProductCategory,
  summarizeDescription,
  translateTitle,
  translateToArabic,
} from "../productUtils";

describe("productUtils", () => {
  it("summarizes descriptions by stripping HTML and truncating", () => {
    const description =
      "<p>Hydrating cream for daily use!</p> Second sentence adds more detail. Extra trailing copy that should be trimmed down.";

    const summary = summarizeDescription(description, 50);

    expect(summary).toContain("Hydrating cream for daily use");
    expect(summary).toContain("Second sentence");
    expect(summary.endsWith("...")).toBe(true);
    expect(summary.length).toBeLessThanOrEqual(50);
    expect(summary).not.toContain("<p>");
  });

  it("translates known phrases to Arabic with longest matches first", () => {
    const translated = translateToArabic("Luxury lip gloss");

    expect(translated).toContain("فخم");
    expect(translated).toContain("ملمع شفاه");
    expect(translated.includes("gloss")).toBe(false);
  });

  it("localizes descriptions based on language preference", () => {
    const description = "<div>Hydrating lotion.</div> Gentle enough for sensitive skin.";

    const localized = getLocalizedDescription(description, "ar", 120);

    expect(localized).not.toContain("<div>");
    expect(localized).toContain("مرطب");
    expect(localized).toContain("لوشن");
  });

  it("translates product titles only when language is Arabic", () => {
    const arabicTitle = translateTitle("Vitamin C Serum", "ar");
    const englishTitle = translateTitle("Vitamin C Serum", "en");

    expect(arabicTitle).toContain("سيروم");
    expect(englishTitle).toBe("Vitamin C Serum");
  });

  it("returns localized category label with fallback translation", () => {
    expect(getLocalizedCategory("Skin Care", "ar")).toBe("العناية بالبشرة");
    expect(getLocalizedCategory("Luxury Set", "ar")).toContain("فخم");
    expect(getLocalizedCategory("Makeup", "en")).toBe("Makeup");
  });

  it("extracts up to four key benefits in the requested language", () => {
    const description =
      "A brightening, hydrating moisturizer with SPF 30 for sensitive skin that also repairs damage.";

    const englishBenefits = extractKeyBenefits(description, "en");
    const arabicBenefits = extractKeyBenefits(description, "ar");

    expect(englishBenefits).toEqual([
      "Deep Hydration",
      "Intense Moisture",
      "Brightening",
      "Sun Protection",
    ]);
    expect(arabicBenefits).toContain("ترطيب عميق");
    expect(arabicBenefits).toContain("حماية من الشمس");
  });

  it("chooses productType first, then vendor, then defaults to Beauty", () => {
    expect(getProductCategory("Serum", "Vendor")).toBe("Serum");
    expect(getProductCategory(undefined, "Vendor")).toBe("Vendor");
    expect(getProductCategory()).toBe("Beauty");
  });
});
