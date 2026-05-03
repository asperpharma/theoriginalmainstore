import { describe, it, expect } from "vitest";
import {
  sanitizeInput,
  searchInputSchema,
  checkoutPayloadSchema,
} from "../validationSchemas";

describe("validationSchemas — sanitizeInput", () => {
  it("strips HTML and dangerous characters while preserving Arabic text", () => {
    const sanitized = sanitizeInput("<script>alert('x')</script> مرحبا;");
    expect(sanitized).toBe("alert(x) مرحبا");
  });

  it("limits output length to 1000 characters", () => {
    const longInput = "a".repeat(1200);
    expect(sanitizeInput(longInput).length).toBe(1000);
  });
});

describe("validationSchemas — searchInputSchema", () => {
  it("sanitizes search queries and removes markup", () => {
    const result = searchInputSchema.safeParse(" <b>Retinol</b> serum; ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("Retinol serum");
    }
  });
});

describe("validationSchemas — checkoutPayloadSchema", () => {
  const basePayload = {
    items: [
      { productId: "00000000-0000-0000-0000-000000000001", quantity: 1 },
    ],
    customerName: "Lana Haddad",
    customerPhone: "0791234567",
    deliveryAddress: "Amman, Abdoun Street 12",
    city: "Amman",
    notes: "",
  };

  it("accepts a valid zero-trust checkout payload", () => {
    const result = checkoutPayloadSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0].quantity).toBe(1);
    }
  });

  it("rejects payloads with invalid phone numbers", () => {
    const result = checkoutPayloadSchema.safeParse({
      ...basePayload,
      customerPhone: "0712345678",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const phoneIssue = result.error.issues.find(
        (issue) => issue.path.join(".") === "customerPhone",
      );
      expect(phoneIssue?.message).toMatch(/invalid phone number/i);
    }
  });

  it("rejects payloads when quantities exceed the per-item limit", () => {
    const result = checkoutPayloadSchema.safeParse({
      ...basePayload,
      items: [
        {
          productId: "00000000-0000-0000-0000-000000000001",
          quantity: 120,
        },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const quantityIssue = result.error.issues.find(
        (issue) => issue.path.includes("quantity"),
      );
      expect(quantityIssue?.message).toMatch(/quantity/i);
    }
  });
});
