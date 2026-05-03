import { describe, it, expect } from "vitest";
import {
  sanitizeInput,
  contactFormSchema,
  checkoutFormSchema,
  checkoutPayloadSchema,
  searchInputSchema,
  newsletterSchema,
  orderTrackingSchema,
} from "../validationSchemas";

// ─────────────────────────────────────────────
// sanitizeInput
// ─────────────────────────────────────────────
describe("sanitizeInput()", () => {
  it("trims leading and trailing whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });

  it("strips HTML tags", () => {
    expect(sanitizeInput("<b>bold</b>")).toBe("bold");
    // sanitizeInput also removes " characters, so the alert call loses its quotes
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe("alert(xss)");
  });

  it("removes dangerous characters < > ' \" ` ;", () => {
    const result = sanitizeInput("<>'\"`;");
    expect(result).toBe("");
  });

  it("preserves Arabic text", () => {
    const arabic = "مرحبا بالعالم";
    expect(sanitizeInput(arabic)).toBe(arabic);
  });

  it("preserves normal English text", () => {
    expect(sanitizeInput("Hello world")).toBe("Hello world");
  });

  it("truncates strings longer than 1000 characters", () => {
    const long = "a".repeat(1500);
    expect(sanitizeInput(long).length).toBe(1000);
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeInput("")).toBe("");
  });
});

// ─────────────────────────────────────────────
// contactFormSchema
// ─────────────────────────────────────────────
describe("contactFormSchema", () => {
  const valid = { name: "Alice Smith", email: "alice@example.com", message: "This is a test message." };

  it("accepts a valid payload", () => {
    expect(() => contactFormSchema.parse(valid)).not.toThrow();
  });

  it("rejects name shorter than 2 characters", () => {
    expect(() => contactFormSchema.parse({ ...valid, name: "A" })).toThrow();
  });

  it("rejects name with invalid characters (digits)", () => {
    expect(() => contactFormSchema.parse({ ...valid, name: "Alice123" })).toThrow();
  });

  it("accepts Arabic names", () => {
    expect(() => contactFormSchema.parse({ ...valid, name: "علي محمد" })).not.toThrow();
  });

  it("rejects an invalid email address", () => {
    expect(() => contactFormSchema.parse({ ...valid, email: "not-an-email" })).toThrow();
  });

  it("rejects a message shorter than 10 characters", () => {
    expect(() => contactFormSchema.parse({ ...valid, message: "short" })).toThrow();
  });

  it("rejects a message longer than 1000 characters", () => {
    expect(() => contactFormSchema.parse({ ...valid, message: "x".repeat(1001) })).toThrow();
  });
});

// ─────────────────────────────────────────────
// checkoutFormSchema
// ─────────────────────────────────────────────
describe("checkoutFormSchema", () => {
  const valid = {
    customerName: "Fatima Al-Hassan",
    customerPhone: "0791234567",
    deliveryAddress: "123 King Abdullah St, Amman",
    city: "Amman",
  };

  it("accepts a valid Jordanian phone number (077/078/079)", () => {
    ["0771234567", "0781234567", "0791234567"].forEach((phone) => {
      expect(() => checkoutFormSchema.parse({ ...valid, customerPhone: phone })).not.toThrow();
    });
  });

  it("rejects phone numbers that do not start with 07[789]", () => {
    expect(() => checkoutFormSchema.parse({ ...valid, customerPhone: "0601234567" })).toThrow();
  });

  it("rejects address shorter than 10 characters", () => {
    expect(() => checkoutFormSchema.parse({ ...valid, deliveryAddress: "Short" })).toThrow();
  });

  it("allows optional email to be empty string", () => {
    expect(() => checkoutFormSchema.parse({ ...valid, customerEmail: "" })).not.toThrow();
  });

  it("validates optional email when provided", () => {
    expect(() =>
      checkoutFormSchema.parse({ ...valid, customerEmail: "test@example.com" })
    ).not.toThrow();
    expect(() =>
      checkoutFormSchema.parse({ ...valid, customerEmail: "not-valid" })
    ).toThrow();
  });
});

// ─────────────────────────────────────────────
// checkoutPayloadSchema (Zero-Trust)
// ─────────────────────────────────────────────
describe("checkoutPayloadSchema", () => {
  const validItem = { productId: "550e8400-e29b-41d4-a716-446655440000", quantity: 2 };
  const validBase = {
    items: [validItem],
    customerName: "Fatima Al-Hassan",
    customerPhone: "0791234567",
    deliveryAddress: "123 King Abdullah St, Amman",
    city: "Amman",
  };

  it("accepts a valid payload", () => {
    expect(() => checkoutPayloadSchema.parse(validBase)).not.toThrow();
  });

  it("rejects empty items array", () => {
    expect(() => checkoutPayloadSchema.parse({ ...validBase, items: [] })).toThrow();
  });

  it("rejects items array with more than 50 items", () => {
    const tooMany = Array.from({ length: 51 }, (_, i) => ({
      productId: `550e8400-e29b-41d4-a716-44665544${String(i).padStart(4, "0")}`,
      quantity: 1,
    }));
    expect(() => checkoutPayloadSchema.parse({ ...validBase, items: tooMany })).toThrow();
  });

  it("rejects item quantity of 0", () => {
    expect(() =>
      checkoutPayloadSchema.parse({ ...validBase, items: [{ ...validItem, quantity: 0 }] })
    ).toThrow();
  });

  it("rejects item quantity over 99", () => {
    expect(() =>
      checkoutPayloadSchema.parse({ ...validBase, items: [{ ...validItem, quantity: 100 }] })
    ).toThrow();
  });

  it("rejects non-UUID productId", () => {
    expect(() =>
      checkoutPayloadSchema.parse({ ...validBase, items: [{ productId: "not-a-uuid", quantity: 1 }] })
    ).toThrow();
  });
});

// ─────────────────────────────────────────────
// searchInputSchema
// ─────────────────────────────────────────────
describe("searchInputSchema", () => {
  it("trims whitespace and sanitizes", () => {
    const result = searchInputSchema.parse("  serum  ");
    expect(result).toBe("serum");
  });

  it("rejects strings longer than 100 characters", () => {
    expect(() => searchInputSchema.parse("a".repeat(101))).toThrow();
  });

  it("accepts empty string", () => {
    expect(() => searchInputSchema.parse("")).not.toThrow();
  });
});

// ─────────────────────────────────────────────
// newsletterSchema
// ─────────────────────────────────────────────
describe("newsletterSchema", () => {
  it("accepts a valid email", () => {
    expect(() => newsletterSchema.parse({ email: "user@example.com" })).not.toThrow();
  });

  it("rejects an invalid email", () => {
    expect(() => newsletterSchema.parse({ email: "not-an-email" })).toThrow();
  });

  it("rejects email longer than 255 characters", () => {
    // 247 'a's + '@test.com' = 256 chars total — exceeds the 255-character limit
    const long = "a".repeat(247) + "@test.com";
    expect(() => newsletterSchema.parse({ email: long })).toThrow();
  });
});

// ─────────────────────────────────────────────
// orderTrackingSchema
// ─────────────────────────────────────────────
describe("orderTrackingSchema", () => {
  it("accepts a valid alphanumeric order number", () => {
    expect(() => orderTrackingSchema.parse({ orderNumber: "ORD-12345" })).not.toThrow();
  });

  it("rejects an empty order number", () => {
    expect(() => orderTrackingSchema.parse({ orderNumber: "" })).toThrow();
  });

  it("rejects order numbers with special characters", () => {
    expect(() => orderTrackingSchema.parse({ orderNumber: "ORD_#123!" })).toThrow();
  });

  it("accepts optional token field", () => {
    expect(() =>
      orderTrackingSchema.parse({ orderNumber: "ORD-001", token: "abc123" })
    ).not.toThrow();
  });
});
