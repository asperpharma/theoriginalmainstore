import {
  extractKeyBenefits,
  getLocalizedCategory,
  getLocalizedDescription,
  getProductCategory,
  summarizeDescription,
  translateTitle,
  translateToArabic,
} from "../productUtils";

describe("summarizeDescription", () => {
  it("removes html and combines two short sentences", () => {
    const input = "<p>Hydrating serum.</p><p>Brightens skin tone.</p>";
    expect(summarizeDescription(input, 150)).toBe(
      "Hydrating serum. Brightens skin tone",
    );
  });

  it("truncates to max length with ellipsis", () => {
    const input =
      "This is a very long clinical description that should be truncated at some point for compact card previews.";
    const summary = summarizeDescription(input, 30);
    expect(summary.endsWith("...")).toBe(true);
    expect(summary.length).toBeLessThanOrEqual(30);
  });
});

describe("translation and localization", () => {
  it("translates known terms to Arabic and keeps english title for en locale", () => {
    expect(translateToArabic("Vitamin C serum for all skin types")).toContain(
      "فيتامين",
    );
    expect(translateTitle("Vitamin C Serum", "en")).toBe("Vitamin C Serum");
    expect(translateTitle("Vitamin C Serum", "ar")).not.toBe("Vitamin C Serum");
  });

  it("localizes description and category by language", () => {
    expect(
      getLocalizedDescription("Hydrating moisturizer for sensitive skin", "ar"),
    ).toContain("مرطب");
    expect(getLocalizedCategory("Skin Care", "ar")).toBe("العناية بالبشرة");
    expect(getLocalizedCategory("Custom Category", "ar")).not.toBe(
      "Custom Category",
    );
  });
});

describe("extractKeyBenefits", () => {
  it("returns deduplicated benefits capped at four", () => {
    const text =
      "Hydrating and moisturizing formula with vitamin c, spf protection, and anti-aging wrinkle support for smooth skin.";
    const benefits = extractKeyBenefits(text, "en");
    expect(benefits).toContain("Deep Hydration");
    expect(benefits).toContain("Intense Moisture");
    expect(benefits.length).toBeLessThanOrEqual(4);
  });

  it("returns arabic benefits when language is ar", () => {
    const benefits = extractKeyBenefits(
      "Natural gentle cleanser for sensitive skin",
      "ar",
    );
    expect(benefits.some((b) => /مكونات طبيعية|تركيبة لطيفة|تنظيف عميق/.test(b))).toBe(
      true,
    );
  });
});

describe("getProductCategory", () => {
  it("prioritizes productType, then vendor, then default", () => {
    expect(getProductCategory("Serum", "BrandX")).toBe("Serum");
    expect(getProductCategory(undefined, "BrandX")).toBe("BrandX");
    expect(getProductCategory(undefined, undefined)).toBe("Beauty");
  });
});
