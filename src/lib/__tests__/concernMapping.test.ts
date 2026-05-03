import { describe, it, expect } from "vitest";
import {
  normalizeConcernSlug,
  filterProductsByConcern,
  concernToShopifyTag,
  detectConcernFromText,
} from "../concernMapping";

type TestProduct = {
  id: string;
  node: {
    title: string;
    description?: string | null;
    tags?: string[];
  };
};

describe("concernMapping", () => {
  describe("normalizeConcernSlug", () => {
    it("returns null for undefined", () => {
      expect(normalizeConcernSlug(undefined)).toBeNull();
    });

    it("normalizes casing, spacing, and common aliases", () => {
      expect(normalizeConcernSlug("  ACNE ")).toBe("acne");
      expect(normalizeConcernSlug("antiaging")).toBe("anti-aging");
      expect(normalizeConcernSlug("hairloss")).toBe("hair-loss");
    });

    it("returns lowercased unknown slugs unchanged", () => {
      expect(normalizeConcernSlug("Unknown-Concern")).toBe("unknown-concern");
    });
  });

  describe("filterProductsByConcern", () => {
    const products: TestProduct[] = [
      {
        id: "1",
        node: {
          title: "Retinol Renewal Serum",
          description: "Targets wrinkles and fine lines",
          tags: ["Concern_AntiAging"],
        },
      },
      {
        id: "2",
        node: {
          title: "Clear Skin Gel",
          description: "Purifying formula for acne-prone skin",
          tags: ["matte", "oil-free"],
        },
      },
      {
        id: "3",
        node: {
          title: "Gentle Daily Moisturizer",
          description: "For sensitive skin with soothing effect",
          tags: ["calming"],
        },
      },
    ];

    it("filters by configured keywords", () => {
      const result = filterProductsByConcern(products, "anti-aging");
      expect(result.map((p) => p.id)).toEqual(["1"]);
    });

    it("supports slug aliases during filtering", () => {
      const result = filterProductsByConcern(products, "antiaging");
      expect(result.map((p) => p.id)).toEqual(["1"]);
    });

    it("returns original list when concern is unknown", () => {
      const result = filterProductsByConcern(products, "unknown");
      expect(result).toBe(products);
    });
  });

  describe("concernToShopifyTag", () => {
    it("builds a Shopify concern tag query for known concerns", () => {
      expect(concernToShopifyTag("acne")).toBe("tag:Concern_Acne");
      expect(concernToShopifyTag("hairloss")).toBe("tag:Concern_HairLoss");
    });

    it("returns null for unknown concerns", () => {
      expect(concernToShopifyTag("unknown")).toBeNull();
    });
  });

  describe("detectConcernFromText", () => {
    it("detects concern from configured keywords", () => {
      expect(detectConcernFromText("I need retinol for wrinkles")).toBe("anti-aging");
    });

    it("uses keyword-priority order when multiple concerns match", () => {
      expect(detectConcernFromText("My acne and hydration issues are persistent")).toBe("acne");
    });

    it("falls back to regex-based concern detection", () => {
      expect(detectConcernFromText("My skin feels dry and tight")).toBe("hydration");
      expect(detectConcernFromText("My face gets oily with visible pores")).toBe("acne");
    });

    it("returns null for empty or non-matching input", () => {
      expect(detectConcernFromText("")).toBeNull();
      expect(detectConcernFromText("Need a gift set for my friend")).toBeNull();
    });
  });
});
