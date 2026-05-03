import { describe, it, expect } from "vitest";
import { summarizeDescription } from "@/lib/productUtils";

describe("summarizeDescription", () => {
  it("returns empty string for empty input", () => {
    expect(summarizeDescription("")).toBe("");
  });

  it("strips HTML tags from description", () => {
    const result = summarizeDescription("<b>Great serum</b> for your skin.");
    expect(result).not.toContain("<b>");
    expect(result).toContain("Great serum");
  });

  it("returns a single sentence for short descriptions", () => {
    const result = summarizeDescription("This is a great product.");
    expect(result).toBe("This is a great product");
  });

  it("appends a second sentence when first sentence is short", () => {
    const result = summarizeDescription("Short first. This is the second sentence here.");
    // First sentence is short (<80 chars), so it should include both
    expect(result).toContain("Short first");
    expect(result).toContain("second sentence");
  });

  it("does not append second sentence when first is long enough", () => {
    const longFirst = "This is a very long first sentence that exceeds eighty characters in total length here.";
    const result = summarizeDescription(longFirst + " Second sentence.");
    expect(result).not.toContain("Second sentence");
  });

  it("truncates description exceeding maxLength with ellipsis", () => {
    const longDesc = "a".repeat(200);
    const result = summarizeDescription(longDesc, 100);
    expect(result).toHaveLength(100);
    expect(result.endsWith("...")).toBe(true);
  });

  it("respects custom maxLength parameter", () => {
    const desc = "First sentence. Second sentence. Third sentence.";
    const result = summarizeDescription(desc, 20);
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it("handles multi-sentence descriptions without exceeding default maxLength", () => {
    const desc = "One. Two. Three. Four. Five.";
    const result = summarizeDescription(desc);
    expect(result.length).toBeLessThanOrEqual(150);
  });
});
