import { describe, it, expect } from "vitest";
import {
  normalizeConcernSlug,
  filterProductsByConcern,
  concernToShopifyTag,
  detectConcernFromText,
} from "../concernMapping";

// ─────────────────────────────────────────────
// normalizeConcernSlug
// ─────────────────────────────────────────────
describe("normalizeConcernSlug()", () => {
  it("returns null for undefined input", () => {
    expect(normalizeConcernSlug(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(normalizeConcernSlug("")).toBeNull();
  });

  it("returns the slug as-is for a known concern", () => {
    expect(normalizeConcernSlug("acne")).toBe("acne");
    expect(normalizeConcernSlug("hydration")).toBe("hydration");
  });

  it("normalizes 'antiaging' variant to 'anti-aging'", () => {
    expect(normalizeConcernSlug("antiaging")).toBe("anti-aging");
  });

  it("normalizes 'hairloss' variant to 'hair-loss'", () => {
    expect(normalizeConcernSlug("hairloss")).toBe("hair-loss");
  });

  it("lowercases the input", () => {
    expect(normalizeConcernSlug("ACNE")).toBe("acne");
    expect(normalizeConcernSlug("Anti-Aging")).toBe("anti-aging");
  });

  it("trims whitespace", () => {
    expect(normalizeConcernSlug("  acne  ")).toBe("acne");
  });
});

// ─────────────────────────────────────────────
// concernToShopifyTag
// ─────────────────────────────────────────────
describe("concernToShopifyTag()", () => {
  it("returns a tag string for a known concern slug", () => {
    expect(concernToShopifyTag("acne")).toBe("tag:Concern_Acne");
  });

  it("returns the correct tag for anti-aging", () => {
    expect(concernToShopifyTag("anti-aging")).toBe("tag:Concern_AntiAging");
  });

  it("returns the correct tag for hydration", () => {
    expect(concernToShopifyTag("hydration")).toBe("tag:Concern_Hydration");
  });

  it("returns null for an unknown concern slug", () => {
    expect(concernToShopifyTag("unknown-concern-xyz")).toBeNull();
  });

  it("handles variant slugs (antiaging → anti-aging)", () => {
    expect(concernToShopifyTag("antiaging")).toBe("tag:Concern_AntiAging");
  });
});

// ─────────────────────────────────────────────
// filterProductsByConcern
// ─────────────────────────────────────────────
describe("filterProductsByConcern()", () => {
  const makeProduct = (title: string, description = "", tags: string[] = []) => ({
    node: { title, description, tags },
  });

  it("returns all products for unknown concern slug", () => {
    const products = [makeProduct("Serum"), makeProduct("Cream")];
    const result = filterProductsByConcern(products, "unknown-concern-xyz");
    expect(result).toHaveLength(2);
  });

  it("filters acne products by title keyword", () => {
    const products = [
      makeProduct("Normaderm Anti-Acne Cleanser"),
      makeProduct("Rose Perfume"),
    ];
    const result = filterProductsByConcern(products, "acne");
    expect(result).toHaveLength(1);
    expect(result[0].node.title).toContain("Acne");
  });

  it("filters by description keyword", () => {
    const products = [
      makeProduct("Mystery Gel", "Great for acne-prone skin"),
      makeProduct("Rose Oil", "Luxurious fragrance"),
    ];
    const result = filterProductsByConcern(products, "acne");
    expect(result.some((p) => p.node.title === "Mystery Gel")).toBe(true);
  });

  it("filters by tag", () => {
    const products = [
      makeProduct("Product A", "", ["Concern_Acne"]),
      makeProduct("Product B", "", ["Concern_Hydration"]),
    ];
    const result = filterProductsByConcern(products, "acne");
    expect(result).toHaveLength(1);
    expect(result[0].node.title).toBe("Product A");
  });

  it("returns empty array when no products match", () => {
    const products = [makeProduct("Rose Perfume"), makeProduct("Hair Conditioner")];
    const result = filterProductsByConcern(products, "acne");
    expect(result).toHaveLength(0);
  });

  it("returns all products when products array is empty", () => {
    const result = filterProductsByConcern([], "acne");
    expect(result).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────
// detectConcernFromText
// ─────────────────────────────────────────────
describe("detectConcernFromText()", () => {
  it("returns null for null input", () => {
    expect(detectConcernFromText(null as unknown as string)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(detectConcernFromText("")).toBeNull();
  });

  it("detects acne concern from 'acne' keyword", () => {
    expect(detectConcernFromText("I have acne on my forehead")).toBe("acne");
  });

  it("detects hydration from 'dry skin' via regex fallback", () => {
    const result = detectConcernFromText("My skin feels very dry and tight");
    expect(["hydration", "dryness"]).toContain(result);
  });

  it("detects anti-aging from 'wrinkles' via regex fallback", () => {
    const result = detectConcernFromText("I have deep wrinkles around my eyes");
    expect(result).toBeTruthy();
  });

  it("detects sensitivity concern from 'sensitive' keyword", () => {
    const result = detectConcernFromText("I have very sensitive skin that gets red easily");
    expect(result).toBeTruthy();
  });

  it("detects brightening from 'dark spot'", () => {
    const result = detectConcernFromText("I want to reduce dark spots and pigmentation");
    expect(result).toBeTruthy();
  });

  it("is case-insensitive", () => {
    expect(detectConcernFromText("ACNE PRONE SKIN")).toBe("acne");
  });
});
