import { describe, expect, it } from "vitest";
import { resolveCategoryQuery } from "@/components/ProductGrid";

describe("resolveCategoryQuery", () => {
  it("resolves best-sellers slug to best-sellers query", () => {
    expect(resolveCategoryQuery("best-sellers")).toBe("best-sellers");
  });

  it("resolves concern slugs to Concern tag query", () => {
    expect(resolveCategoryQuery("acne")).toBe("tag:Concern_Acne");
    expect(resolveCategoryQuery("antiaging")).toBe("tag:Concern_AntiAging");
  });

  it("returns undefined for regular collection categories", () => {
    expect(resolveCategoryQuery("skin-care")).toBeUndefined();
  });
});
