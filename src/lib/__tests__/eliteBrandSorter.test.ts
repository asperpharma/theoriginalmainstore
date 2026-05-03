import { describe, it, expect } from "vitest";
import {
  isEliteBrand,
  pinEliteBrandsToTop,
  partitionByEliteBrand,
  ELITE_BRANDS,
} from "../eliteBrandSorter";

// ─────────────────────────────────────────────
// isEliteBrand
// ─────────────────────────────────────────────
describe("isEliteBrand()", () => {
  it("returns true for all brands in ELITE_BRANDS (exact match)", () => {
    for (const brand of ELITE_BRANDS) {
      expect(isEliteBrand(brand)).toBe(true);
    }
  });

  it("is case-insensitive", () => {
    expect(isEliteBrand("dior")).toBe(true);
    expect(isEliteBrand("DIOR")).toBe(true);
    expect(isEliteBrand("Dior")).toBe(true);
  });

  it("handles accent variants: 'Lancome' and 'Lancôme'", () => {
    expect(isEliteBrand("Lancôme")).toBe(true);
    expect(isEliteBrand("Lancome")).toBe(true);
  });

  it("handles accent variants: 'Estee Lauder' and 'Estée Lauder'", () => {
    expect(isEliteBrand("Estée Lauder")).toBe(true);
    expect(isEliteBrand("Estee Lauder")).toBe(true);
  });

  it("returns false for non-elite brands", () => {
    expect(isEliteBrand("Vichy")).toBe(false);
    expect(isEliteBrand("Cetaphil")).toBe(false);
    expect(isEliteBrand("L'Oreal")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isEliteBrand(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isEliteBrand(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isEliteBrand("")).toBe(false);
  });

  it("returns false for whitespace-only string", () => {
    expect(isEliteBrand("   ")).toBe(false);
  });
});

// ─────────────────────────────────────────────
// pinEliteBrandsToTop
// ─────────────────────────────────────────────
describe("pinEliteBrandsToTop()", () => {
  const make = (id: string, brand: string) => ({ id, brand });

  it("returns an empty array when given an empty array", () => {
    expect(pinEliteBrandsToTop([])).toEqual([]);
  });

  it("puts Dior product before Vichy product", () => {
    const products = [make("1", "Vichy"), make("2", "Dior")];
    const sorted = pinEliteBrandsToTop(products);
    expect(sorted[0].brand).toBe("Dior");
    expect(sorted[1].brand).toBe("Vichy");
  });

  it("preserves relative order within the elite group (stable sort)", () => {
    const products = [make("1", "Lancôme"), make("2", "Dior"), make("3", "YSL")];
    const sorted = pinEliteBrandsToTop(products);
    const eliteIds = sorted.slice(0, 3).map((p) => p.id);
    expect(eliteIds).toEqual(["1", "2", "3"]);
  });

  it("preserves relative order within the non-elite group", () => {
    const products = [make("1", "Vichy"), make("2", "Cetaphil"), make("3", "Eucerin")];
    const sorted = pinEliteBrandsToTop(products);
    const nonEliteIds = sorted.map((p) => p.id);
    expect(nonEliteIds).toEqual(["1", "2", "3"]);
  });

  it("handles products with null brand", () => {
    const products = [{ id: "1", brand: null }, make("2", "Dior")];
    const sorted = pinEliteBrandsToTop(products);
    expect(sorted[0].brand).toBe("Dior");
  });

  it("handles a list of all elite brands", () => {
    const products = [make("a", "Dior"), make("b", "YSL"), make("c", "Lancôme")];
    const sorted = pinEliteBrandsToTop(products);
    expect(sorted.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("handles a list with no elite brands", () => {
    const products = [make("1", "Vichy"), make("2", "Eucerin")];
    const sorted = pinEliteBrandsToTop(products);
    expect(sorted.map((p) => p.id)).toEqual(["1", "2"]);
  });
});

// ─────────────────────────────────────────────
// partitionByEliteBrand
// ─────────────────────────────────────────────
describe("partitionByEliteBrand()", () => {
  const make = (id: string, brand: string) => ({ id, brand });

  it("returns two empty arrays for empty input", () => {
    expect(partitionByEliteBrand([])).toEqual({ elite: [], rest: [] });
  });

  it("correctly separates elite and non-elite products", () => {
    const products = [make("1", "Vichy"), make("2", "Dior"), make("3", "Cetaphil"), make("4", "YSL")];
    const { elite, rest } = partitionByEliteBrand(products);
    expect(elite.map((p) => p.id)).toEqual(["2", "4"]);
    expect(rest.map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("preserves original order within each bucket", () => {
    const products = [make("a", "Lancôme"), make("b", "Vichy"), make("c", "Dior")];
    const { elite } = partitionByEliteBrand(products);
    expect(elite.map((p) => p.id)).toEqual(["a", "c"]);
  });

  it("all products in elite bucket pass isEliteBrand()", () => {
    const products = [make("1", "Vichy"), make("2", "Dior"), make("3", "Lancôme")];
    const { elite } = partitionByEliteBrand(products);
    for (const p of elite) {
      expect(isEliteBrand(p.brand)).toBe(true);
    }
  });

  it("no products in rest bucket pass isEliteBrand()", () => {
    const products = [make("1", "Vichy"), make("2", "Dior"), make("3", "Eucerin")];
    const { rest } = partitionByEliteBrand(products);
    for (const p of rest) {
      expect(isEliteBrand(p.brand)).toBe(false);
    }
  });
});
