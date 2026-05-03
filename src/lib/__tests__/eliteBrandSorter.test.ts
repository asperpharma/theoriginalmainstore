import { describe, it, expect } from "vitest";
import {
  isEliteBrand,
  pinEliteBrandsToTop,
  partitionByEliteBrand,
} from "../eliteBrandSorter";

describe("eliteBrandSorter", () => {
  describe("isEliteBrand", () => {
    it("matches elite brands case-insensitively and with trimming", () => {
      expect(isEliteBrand(" dior ")).toBe(true);
      expect(isEliteBrand("ESTEE LAUDER")).toBe(true);
      expect(isEliteBrand("Lancôme")).toBe(true);
    });

    it("returns false for unknown or empty brand values", () => {
      expect(isEliteBrand("CeraVe")).toBe(false);
      expect(isEliteBrand("")).toBe(false);
      expect(isEliteBrand(null)).toBe(false);
      expect(isEliteBrand(undefined)).toBe(false);
    });
  });

  describe("pinEliteBrandsToTop", () => {
    it("pins elite brands first while preserving internal order", () => {
      const products = [
        { id: "1", brand: "CeraVe" },
        { id: "2", brand: "Dior" },
        { id: "3", brand: "La Roche-Posay" },
        { id: "4", brand: "YSL" },
        { id: "5", brand: "Lancôme" },
      ];

      const sorted = pinEliteBrandsToTop(products);
      expect(sorted.map((p) => p.id)).toEqual(["2", "4", "5", "1", "3"]);
    });

    it("handles empty arrays", () => {
      expect(pinEliteBrandsToTop([])).toEqual([]);
    });
  });

  describe("partitionByEliteBrand", () => {
    it("returns elite and rest buckets while preserving order", () => {
      const products = [
        { id: "1", brand: "CeraVe" },
        { id: "2", brand: "Dior" },
        { id: "3", brand: "YSL" },
        { id: "4", brand: "SVR" },
      ];

      const result = partitionByEliteBrand(products);
      expect(result.elite.map((p) => p.id)).toEqual(["2", "3"]);
      expect(result.rest.map((p) => p.id)).toEqual(["1", "4"]);
    });
  });
});
