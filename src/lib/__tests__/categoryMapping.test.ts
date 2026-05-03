import { describe, it, expect } from "vitest";
import {
  normalizeCategorySlug,
  categorizeProduct,
  getCategoryInfo,
  getAllCategorySlugs,
} from "../categoryMapping";

describe("categoryMapping", () => {
  describe("normalizeCategorySlug", () => {
    it("maps legacy skincare slug to skin-care", () => {
      expect(normalizeCategorySlug("skincare")).toBe("skin-care");
    });

    it("keeps non-legacy slugs unchanged", () => {
      expect(normalizeCategorySlug("hair-care")).toBe("hair-care");
    });
  });

  describe("categorizeProduct", () => {
    it("returns categories using priority order when multiple keywords match", () => {
      expect(categorizeProduct("Hair Serum", "Serum", "Generic")).toBe("hair-care");
    });

    it("can categorize by productType or vendor text", () => {
      expect(categorizeProduct("Unknown Item", "Mascara", "Generic")).toBe("make-up");
      expect(categorizeProduct("Unknown Item", undefined, "Vichy")).toBe("skin-care");
    });

    it("falls back to skin-care when no keywords match", () => {
      expect(categorizeProduct("Mystery Product", undefined, undefined)).toBe("skin-care");
    });
  });

  describe("getCategoryInfo", () => {
    it("returns category info for normalized slug", () => {
      const info = getCategoryInfo("skincare");
      expect(info).not.toBeNull();
      expect(info?.slug).toBe("skin-care");
      expect(info?.title).toBe("Skin Care");
    });

    it("returns null for unknown category", () => {
      expect(getCategoryInfo("unknown")).toBeNull();
    });
  });

  describe("getAllCategorySlugs", () => {
    it("returns all six primary category slugs", () => {
      const slugs = getAllCategorySlugs();
      expect(slugs).toHaveLength(6);
      expect(slugs).toEqual(
        expect.arrayContaining([
          "skin-care",
          "hair-care",
          "make-up",
          "body-care",
          "fragrances",
          "tools-devices",
        ]),
      );
    });
  });
});
