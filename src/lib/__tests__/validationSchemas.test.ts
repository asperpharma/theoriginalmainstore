import { describe, it, expect } from "vitest";
import {
  sanitizeInput,
  contactFormSchema,
  checkoutFormSchema,
  newsletterSchema,
  orderTrackingSchema,
  checkoutPayloadSchema,
  searchInputSchema,
} from "@/lib/validationSchemas";

// ── sanitizeInput ────────────────────────────────────────────────────────────

describe("sanitizeInput", () => {
  it("strips HTML tags", () => {
    expect(sanitizeInput("<b>hello</b>")).toBe("hello");
    // <script>…</script> tags are stripped, leaving the inner text;
    // then the dangerous-char pass removes the surrounding quotes.
    expect(sanitizeInput('<script>alert("xss")</script>text')).toBe("alert(xss)text");
  });

  it("removes dangerous characters ' \" ` ;", () => {
    // Note: < and > inside a tag-like sequence are consumed by the HTML-tag regex first.
    // Input: a'b"c;d`e<f>g  →  strip HTML (<f> removed)  →  a'b"c;d`eg
    //        → strip dangerous chars ('  "  ;  `)  →  abcdeg
    expect(sanitizeInput("a'b\"c;d`e<f>g")).toBe("abcdeg");
    // Lone < and > characters (not forming a tag) are removed by the char regex
    expect(sanitizeInput("a<b>c")).toBe("ac"); // <b> tag is stripped, leaving a + c
    expect(sanitizeInput("price > 0 and age < 5")).toBe("price  0 and age  5");
  });

  it("trims leading and trailing whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });

  it("truncates to 1000 characters", () => {
    const long = "a".repeat(1500);
    expect(sanitizeInput(long)).toHaveLength(1000);
  });

  it("preserves Arabic text", () => {
    const arabic = "مرحبا بالعالم";
    expect(sanitizeInput(arabic)).toBe(arabic);
  });
});

// ── contactFormSchema ────────────────────────────────────────────────────────

describe("contactFormSchema", () => {
  const valid = {
    name: "Ahmad Ali",
    email: "ahmad@example.com",
    message: "This is a test message that is long enough.",
  };

  it("accepts valid English name, email, and message", () => {
    expect(() => contactFormSchema.parse(valid)).not.toThrow();
  });

  it("accepts Arabic name", () => {
    expect(() =>
      contactFormSchema.parse({ ...valid, name: "أحمد علي" }),
    ).not.toThrow();
  });

  it("rejects name shorter than 2 chars", () => {
    expect(() =>
      contactFormSchema.parse({ ...valid, name: "A" }),
    ).toThrow();
  });

  it("rejects invalid email", () => {
    expect(() =>
      contactFormSchema.parse({ ...valid, email: "not-an-email" }),
    ).toThrow();
  });

  it("rejects message shorter than 10 chars", () => {
    expect(() =>
      contactFormSchema.parse({ ...valid, message: "short" }),
    ).toThrow();
  });

  it("rejects message longer than 1000 chars", () => {
    expect(() =>
      contactFormSchema.parse({ ...valid, message: "a".repeat(1001) }),
    ).toThrow();
  });
});

// ── searchInputSchema ────────────────────────────────────────────────────────

describe("searchInputSchema", () => {
  it("accepts a normal search query", () => {
    const result = searchInputSchema.parse("serum");
    expect(result).toBe("serum");
  });

  it("rejects query longer than 100 chars", () => {
    expect(() => searchInputSchema.parse("a".repeat(101))).toThrow();
  });

  it("sanitizes input (strips HTML)", () => {
    const result = searchInputSchema.parse("<b>cream</b>");
    expect(result).toBe("cream");
  });
});

// ── checkoutFormSchema ───────────────────────────────────────────────────────

describe("checkoutFormSchema", () => {
  const valid = {
    customerName: "Sara Hassan",
    customerPhone: "0791234567",
    deliveryAddress: "123 Main St, Amman, Jordan",
    city: "Amman",
  };

  it("accepts valid checkout data", () => {
    expect(() => checkoutFormSchema.parse(valid)).not.toThrow();
  });

  it("accepts optional email when provided", () => {
    expect(() =>
      checkoutFormSchema.parse({ ...valid, customerEmail: "sara@example.com" }),
    ).not.toThrow();
  });

  it("accepts empty string email", () => {
    expect(() =>
      checkoutFormSchema.parse({ ...valid, customerEmail: "" }),
    ).not.toThrow();
  });

  it("rejects invalid Jordanian phone number", () => {
    expect(() =>
      checkoutFormSchema.parse({ ...valid, customerPhone: "0501234567" }),
    ).toThrow();
  });

  it("rejects phone numbers that are too short", () => {
    expect(() =>
      checkoutFormSchema.parse({ ...valid, customerPhone: "079123" }),
    ).toThrow();
  });

  it("rejects address shorter than 10 chars", () => {
    expect(() =>
      checkoutFormSchema.parse({ ...valid, deliveryAddress: "Short" }),
    ).toThrow();
  });
});

// ── newsletterSchema ─────────────────────────────────────────────────────────

describe("newsletterSchema", () => {
  it("accepts a valid email", () => {
    expect(() =>
      newsletterSchema.parse({ email: "user@example.com" }),
    ).not.toThrow();
  });

  it("rejects an invalid email", () => {
    expect(() => newsletterSchema.parse({ email: "bad-email" })).toThrow();
  });
});

// ── orderTrackingSchema ──────────────────────────────────────────────────────

describe("orderTrackingSchema", () => {
  it("accepts a valid order number", () => {
    expect(() =>
      orderTrackingSchema.parse({ orderNumber: "ORD-12345" }),
    ).not.toThrow();
  });

  it("rejects an empty order number", () => {
    expect(() =>
      orderTrackingSchema.parse({ orderNumber: "" }),
    ).toThrow();
  });

  it("rejects order numbers with special characters", () => {
    expect(() =>
      orderTrackingSchema.parse({ orderNumber: "ORD#123!" }),
    ).toThrow();
  });
});

// ── checkoutPayloadSchema ────────────────────────────────────────────────────

describe("checkoutPayloadSchema — Zero-Trust Secure Checkout", () => {
  const validItem = {
    productId: "550e8400-e29b-41d4-a716-446655440000",
    quantity: 2,
  };
  const validBase = {
    items: [validItem],
    customerName: "Ahmad Ali",
    customerPhone: "0791234567",
    deliveryAddress: "123 Main St, Amman, Jordan",
    city: "Amman",
  };

  it("accepts a valid payload", () => {
    expect(() => checkoutPayloadSchema.parse(validBase)).not.toThrow();
  });

  it("rejects an empty items array", () => {
    expect(() =>
      checkoutPayloadSchema.parse({ ...validBase, items: [] }),
    ).toThrow();
  });

  it("rejects items array with more than 50 items", () => {
    const tooMany = Array.from({ length: 51 }, (_, i) => ({
      productId: `550e8400-e29b-41d4-a716-44665544${String(i).padStart(4, "0")}`,
      quantity: 1,
    }));
    expect(() =>
      checkoutPayloadSchema.parse({ ...validBase, items: tooMany }),
    ).toThrow();
  });

  it("rejects quantity of 0", () => {
    expect(() =>
      checkoutPayloadSchema.parse({
        ...validBase,
        items: [{ productId: "550e8400-e29b-41d4-a716-446655440000", quantity: 0 }],
      }),
    ).toThrow();
  });

  it("rejects quantity exceeding 99", () => {
    expect(() =>
      checkoutPayloadSchema.parse({
        ...validBase,
        items: [{ productId: "550e8400-e29b-41d4-a716-446655440000", quantity: 100 }],
      }),
    ).toThrow();
  });

  it("rejects a non-UUID productId", () => {
    expect(() =>
      checkoutPayloadSchema.parse({
        ...validBase,
        items: [{ productId: "not-a-uuid", quantity: 1 }],
      }),
    ).toThrow();
  });

  it("does NOT accept a price field (zero-trust: server recalculates)", () => {
    // The schema should strip unknown keys (or fail if strict) — either way
    // it must not honour a client-supplied price.
    const result = checkoutPayloadSchema.safeParse({
      ...validBase,
      price: 999,
    });
    // Either parse succeeds (extra keys stripped) or fails — but result.data must not include price
    if (result.success) {
      expect((result.data as Record<string, unknown>).price).toBeUndefined();
    }
  });
});
