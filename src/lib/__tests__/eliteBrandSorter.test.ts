import { describe, it, expect } from "vitest";
import {
  isEliteBrand,
  pinEliteBrandsToTop,
  partitionByEliteBrand,
} from "@/lib/eliteBrandSorter";
import type { SortableProduct } from "@/lib/eliteBrandSorter";

const makeProduct = (id: string, brand: string | null | undefined): SortableProduct => ({
  id,
  brand,
});

describe("isEliteBrand", () => {
  it("returns true for exact elite brand names", () => {
    expect(isEliteBrand("Dior")).toBe(true);
    expect(isEliteBrand("Lancôme")).toBe(true);
    expect(isEliteBrand("Estée Lauder")).toBe(true);
    expect(isEliteBrand("Yves Saint Laurent")).toBe(true);
    expect(isEliteBrand("YSL")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isEliteBrand("dior")).toBe(true);
    expect(isEliteBrand("LANCOME")).toBe(true);
    expect(isEliteBrand("estee lauder")).toBe(true);
  });

  it("handles accent variant aliases", () => {
    expect(isEliteBrand("Lancome")).toBe(true); // no accent variant
    expect(isEliteBrand("Christian Dior")).toBe(true);
    expect(isEliteBrand("Saint Laurent")).toBe(true);
  });

  it("returns false for non-elite brands", () => {
    expect(isEliteBrand("CeraVe")).toBe(false);
    expect(isEliteBrand("Vichy")).toBe(false);
    expect(isEliteBrand("Neutrogena")).toBe(false);
  });

  it("returns false for null and undefined", () => {
    expect(isEliteBrand(null)).toBe(false);
    expect(isEliteBrand(undefined)).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isEliteBrand("")).toBe(false);
  });
});

describe("pinEliteBrandsToTop", () => {
  it("returns an empty array unchanged", () => {
    expect(pinEliteBrandsToTop([])).toEqual([]);
  });

  it("places elite brands before non-elite brands", () => {
    const products = [
      makeProduct("1", "CeraVe"),
      makeProduct("2", "Dior"),
      makeProduct("3", "Vichy"),
      makeProduct("4", "Lancôme"),
    ];
    const sorted = pinEliteBrandsToTop(products);
    expect(sorted[0].brand).toBe("Dior");
    expect(sorted[1].brand).toBe("Lancôme");
    expect(sorted[2].brand).toBe("CeraVe");
    expect(sorted[3].brand).toBe("Vichy");
  });

  it("preserves relative order within elite group", () => {
    const products = [
      makeProduct("1", "Lancôme"),
      makeProduct("2", "Dior"),
    ];
    const sorted = pinEliteBrandsToTop(products);
    expect(sorted[0].id).toBe("1"); // Lancôme first (original order)
    expect(sorted[1].id).toBe("2");
  });

  it("preserves relative order within non-elite group", () => {
    const products = [
      makeProduct("1", "Vichy"),
      makeProduct("2", "CeraVe"),
      makeProduct("3", "Dior"),
    ];
    const sorted = pinEliteBrandsToTop(products);
    expect(sorted[0].brand).toBe("Dior");
    expect(sorted[1].brand).toBe("Vichy");
    expect(sorted[2].brand).toBe("CeraVe");
  });

  it("returns all products when none are elite", () => {
    const products = [makeProduct("1", "Vichy"), makeProduct("2", "CeraVe")];
    expect(pinEliteBrandsToTop(products)).toEqual(products);
  });

  it("returns all products when all are elite", () => {
    const products = [makeProduct("1", "Dior"), makeProduct("2", "YSL")];
    const sorted = pinEliteBrandsToTop(products);
    expect(sorted).toHaveLength(2);
    expect(sorted[0].brand).toBe("Dior");
    expect(sorted[1].brand).toBe("YSL");
  });

  it("handles products with null or undefined brand", () => {
    const products = [
      makeProduct("1", null),
      makeProduct("2", "Dior"),
      makeProduct("3", undefined),
    ];
    const sorted = pinEliteBrandsToTop(products);
    expect(sorted[0].brand).toBe("Dior");
  });
});

describe("partitionByEliteBrand", () => {
  it("returns empty elite and rest arrays for empty input", () => {
    const { elite, rest } = partitionByEliteBrand([]);
    expect(elite).toEqual([]);
    expect(rest).toEqual([]);
  });

  it("correctly partitions elite and non-elite brands", () => {
    const products = [
      makeProduct("1", "CeraVe"),
      makeProduct("2", "Dior"),
      makeProduct("3", "Vichy"),
      makeProduct("4", "YSL"),
    ];
    const { elite, rest } = partitionByEliteBrand(products);
    expect(elite).toHaveLength(2);
    expect(rest).toHaveLength(2);
    expect(elite.map((p) => p.brand)).toEqual(["Dior", "YSL"]);
    expect(rest.map((p) => p.brand)).toEqual(["CeraVe", "Vichy"]);
  });

  it("puts all in rest when no elite brands", () => {
    const products = [makeProduct("1", "Garnier"), makeProduct("2", "Nivea")];
    const { elite, rest } = partitionByEliteBrand(products);
    expect(elite).toHaveLength(0);
    expect(rest).toHaveLength(2);
  });

  it("puts all in elite when all are elite brands", () => {
    const products = [makeProduct("1", "Dior"), makeProduct("2", "Lancôme")];
    const { elite, rest } = partitionByEliteBrand(products);
    expect(elite).toHaveLength(2);
    expect(rest).toHaveLength(0);
  });
});
