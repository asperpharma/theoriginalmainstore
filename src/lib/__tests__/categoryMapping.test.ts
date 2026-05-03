import { describe, it, expect } from "vitest";
import {
  CATEGORIES,
  normalizeCategorySlug,
  categorizeProduct,
  getCategoryInfo,
  getAllCategorySlugs,
} from "../categoryMapping";

describe("normalizeCategorySlug", () => {
  it("normalizes legacy skincare slug", () => {
    expect(normalizeCategorySlug("skincare")).toBe("skin-care");
  });

  it("returns non-legacy slugs unchanged", () => {
    expect(normalizeCategorySlug("hair-care")).toBe("hair-care");
  });
});

describe("categorizeProduct", () => {
  it("categorizes by title keyword", () => {
    expect(categorizeProduct("Keratin Hair Shampoo")).toBe("hair-care");
  });

  it("categorizes by productType and vendor when title alone is ambiguous", () => {
    expect(categorizeProduct("Premium Formula", "Lipstick", "Unknown")).toBe(
      "make-up",
    );
    expect(categorizeProduct("Premium Formula", undefined, "Eucerin")).toBe(
      "body-care",
    );
  });

  it("uses category priority order when multiple category keywords are present", () => {
    expect(categorizeProduct("Hair Mask Perfume")).toBe("hair-care");
    expect(categorizeProduct("Lipstick Perfume")).toBe("make-up");
  });

  it("is case-insensitive", () => {
    expect(categorizeProduct("VICHY SUNSCREEN SPF 50")).toBe("body-care");
  });

  it("defaults to skin-care when no keyword is found", () => {
    expect(categorizeProduct("Mystery Product", "Unknown", "Unknown")).toBe(
      "skin-care",
    );
  });
});

describe("getCategoryInfo", () => {
  it("returns category info for normalized legacy slug", () => {
    const info = getCategoryInfo("skincare");
    expect(info?.slug).toBe("skin-care");
    expect(info?.title).toBe("Skin Care");
  });

  it("returns null for unknown slug", () => {
    expect(getCategoryInfo("not-a-category")).toBeNull();
  });
});

describe("getAllCategorySlugs", () => {
  it("returns all category keys without duplication", () => {
    const slugs = getAllCategorySlugs();
    expect(slugs.length).toBe(6);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.sort()).toEqual(Object.keys(CATEGORIES).sort());
  });
});
