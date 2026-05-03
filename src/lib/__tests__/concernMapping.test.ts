import {
  concernToShopifyTag,
  detectConcernFromText,
  filterProductsByConcern,
  normalizeConcernSlug,
} from "../concernMapping";

type ProductNode = {
  node: {
    title: string;
    description?: string | null;
    tags?: string[];
  };
};

describe("normalizeConcernSlug", () => {
  it("normalizes known aliases", () => {
    expect(normalizeConcernSlug("antiaging")).toBe("anti-aging");
    expect(normalizeConcernSlug("hairloss")).toBe("hair-loss");
  });

  it("returns trimmed known slug and null for empty input", () => {
    expect(normalizeConcernSlug(" acne ")).toBe("acne");
    expect(normalizeConcernSlug(undefined)).toBeNull();
  });
});

describe("filterProductsByConcern", () => {
  const products: ProductNode[] = [
    { node: { title: "Hydrating Serum", description: "Deep hyaluronic hydration", tags: [] } },
    { node: { title: "Oil Control Wash", description: "Purifying pore cleanser", tags: ["Concern_Acne"] } },
    { node: { title: "Neutral Product", description: "General care", tags: [] } },
  ];

  it("returns matching products for configured concern keywords", () => {
    const result = filterProductsByConcern(products, "acne");
    expect(result).toHaveLength(1);
    expect(result[0].node.title).toContain("Oil Control");
  });

  it("returns all products for unknown concern", () => {
    expect(filterProductsByConcern(products, "unknown-concern")).toEqual(products);
  });
});

describe("concernToShopifyTag", () => {
  it("builds tag query for known concerns", () => {
    expect(concernToShopifyTag("antiaging")).toBe("tag:Concern_AntiAging");
    expect(concernToShopifyTag("acne")).toBe("tag:Concern_Acne");
  });

  it("returns null for unknown concern", () => {
    expect(concernToShopifyTag("not-real")).toBeNull();
  });
});

describe("detectConcernFromText", () => {
  it("detects from configured keyword match", () => {
    expect(detectConcernFromText("I need retinol for wrinkle lines")).toBe("anti-aging");
  });

  it("detects from regex fallback patterns", () => {
    expect(detectConcernFromText("My skin feels very tight and dehydrat")).toBe("hydration");
    expect(detectConcernFromText("I have oily shine and visible pores")).toBe("acne");
  });

  it("returns null when no concern is detected", () => {
    expect(detectConcernFromText("I need a random gift item")).toBeNull();
    expect(detectConcernFromText("")).toBeNull();
  });
});
