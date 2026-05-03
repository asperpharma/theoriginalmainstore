import { describe, it, expect } from "vitest";
import {
  isEliteBrand,
  pinEliteBrandsToTop,
  partitionByEliteBrand,
} from "../eliteBrandSorter";

describe("eliteBrandSorter — isEliteBrand", () => {
  it("identifies elite brands regardless of case or accents", () => {
    expect(isEliteBrand("lancôme")).toBe(true);
    expect(isEliteBrand("  ysl  ")).toBe(true);
    expect(isEliteBrand("unknown")).toBe(false);
  });
});

describe("eliteBrandSorter — pinEliteBrandsToTop", () => {
  it("moves elite brands to the front while preserving original order", () => {
    const products = [
      { id: "1", brand: "Local" },
      { id: "2", brand: "Dior" },
      { id: "3", brand: "Lancome" },
      { id: "4", brand: "Indie" },
    ];

    const sorted = pinEliteBrandsToTop(products);
    expect(sorted.map((p) => p.id)).toEqual(["2", "3", "1", "4"]);
  });
});

describe("eliteBrandSorter — partitionByEliteBrand", () => {
  it("splits products into elite and non-elite buckets without reordering", () => {
    const products = [
      { id: "a", brand: "Estee Lauder" },
      { id: "b", brand: "Boutique" },
      { id: "c", brand: "YSL" },
    ];

    const { elite, rest } = partitionByEliteBrand(products);

    expect(elite.map((p) => p.id)).toEqual(["a", "c"]);
    expect(rest.map((p) => p.id)).toEqual(["b"]);
  });
});
