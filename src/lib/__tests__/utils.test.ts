import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn()", () => {
  it("returns an empty string when no arguments are passed", () => {
    expect(cn()).toBe("");
  });

  it("returns the class name for a single string argument", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("merges multiple class names", () => {
    expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
  });

  it("deduplicates conflicting Tailwind classes (last wins)", () => {
    // tailwind-merge resolves conflicts: p-4 overrides p-2
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles conditional objects (clsx behaviour)", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("handles arrays of class names", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("filters out falsy values", () => {
    expect(cn("a", undefined, null, false, "b")).toBe("a b");
  });

  it("merges Tailwind text-color conflicts correctly", () => {
    expect(cn("text-red-500", "text-blue-600")).toBe("text-blue-600");
  });

  it("keeps non-conflicting utilities side by side", () => {
    const result = cn("flex", "items-center", "justify-between");
    expect(result).toBe("flex items-center justify-between");
  });
});
