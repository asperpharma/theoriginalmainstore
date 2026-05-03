import {
  getIngredientBenefit,
  ingredientBenefitsContext,
} from "../ingredientBenefits";

describe("getIngredientBenefit", () => {
  it("returns exact match in English and Arabic", () => {
    expect(getIngredientBenefit("niacinamide", false)).toContain("discolorations");
    expect(getIngredientBenefit("niacinamide", true)).toContain("التصبغات");
  });

  it("supports fuzzy includes matching", () => {
    expect(getIngredientBenefit("2% retinol serum", false)).toContain("cell turnover");
  });

  it("supports reverse includes matching for partial keys", () => {
    expect(getIngredientBenefit("ret", false)).toContain("cell turnover");
  });

  it("returns localized fallback when no match exists", () => {
    expect(getIngredientBenefit("mystery ingredient", false)).toBe(
      "Clinically active ingredient",
    );
    expect(getIngredientBenefit("mystery ingredient", true)).toBe(
      "مكون فعال سريرياً",
    );
  });
});

describe("ingredientBenefitsContext", () => {
  it("formats benefits as bullet lines", () => {
    const context = ingredientBenefitsContext();
    expect(context).toContain("- niacinamide:");
    expect(context).toContain("- retinol:");
    expect(context.split("\n").length).toBeGreaterThan(10);
  });
});
