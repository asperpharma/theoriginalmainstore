import { describe, it, expect } from "vitest";
import {
  isEliteBrand,
  pinEliteBrandsToTop,
  partitionByEliteBrand,
} from "../eliteBrandSorter";

describe("isEliteBrand", () => {
  it("matches elite brands case-insensitively and with whitespace trimming", () => {
    expect(isEliteBrand("Dior")).toBe(true);
    expect(isEliteBrand("  ysl  ")).toBe(true);
    expect(isEliteBrand("lancome")).toBe(true);
  });

  it("returns false for non-elite, null, or undefined brands", () => {
    expect(isEliteBrand("Cetaphil")).toBe(false);
    expect(isEliteBrand(null)).toBe(false);
    expect(isEliteBrand(undefined)).toBe(false);
  });
});

describe("pinEliteBrandsToTop", () => {
  const products = [
    { id: "1", brand: "Cetaphil" },
    { id: "2", brand: "Dior" },
    { id: "3", brand: "SVR" },
    { id: "4", brand: "YSL" },
    { id: "5", brand: "Estée Lauder" },
    { id: "6", brand: "La Roche-Posay" },
  ];

  it("pins elite brands first while preserving relative order within both groups", () => {
    const sorted = pinEliteBrandsToTop(products);
    expect(sorted.map((p) => p.id)).toEqual(["2", "4", "5", "1", "3", "6"]);
  });

  it("does not mutate the original array order", () => {
    const before = products.map((p) => p.id);
    void pinEliteBrandsToTop(products);
    expect(products.map((p) => p.id)).toEqual(before);
  });
});

describe("partitionByEliteBrand", () => {
  it("splits products into elite and non-elite buckets with stable order", () => {
    const products = [
      { id: "1", brand: "YSL" },
      { id: "2", brand: "Cetaphil" },
      { id: "3", brand: "Dior" },
      { id: "4", brand: null },
      { id: "5", brand: "Lancôme" },
    ];

    const { elite, rest } = partitionByEliteBrand(products);
    expect(elite.map((p) => p.id)).toEqual(["1", "3", "5"]);
    expect(rest.map((p) => p.id)).toEqual(["2", "4"]);
    expect(elite.length + rest.length).toBe(products.length);
  });
});
