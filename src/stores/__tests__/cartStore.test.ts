import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCartStore } from "@/stores/cartStore";
import type { CartItem } from "@/stores/cartStore";
import type { ShopifyProduct } from "@/lib/shopify";

// Mock Shopify Storefront API calls so tests run without network access
vi.mock("@/lib/shopifyStorefront", () => ({
  createShopifyCart: vi.fn(),
  addLineToShopifyCart: vi.fn(),
  updateShopifyCartLine: vi.fn(),
  removeLineFromShopifyCart: vi.fn(),
  queryShopifyCart: vi.fn(),
}));

function makeShopifyCartItem(
  variantId: string,
  amount: string,
  quantity = 1,
  lineId: string | null = "line-1",
): CartItem {
  const product: ShopifyProduct = {
    node: {
      id: "gid://shopify/Product/1",
      title: "Shopify Product",
      handle: "shopify-product",
      description: "",
      vendor: "Brand",
      productType: "Serum",
      images: { edges: [] },
      priceRange: {
        minVariantPrice: { amount, currencyCode: "JOD" },
      },
      variants: { edges: [] },
      options: [],
    },
  } as ShopifyProduct;

  return {
    lineId,
    product,
    variantId,
    variantTitle: "Default",
    price: { amount, currencyCode: "JOD" },
    quantity,
    selectedOptions: [],
  };
}

function makeLocalCartItem(
  variantId: string,
  amount: string,
  quantity = 1,
): CartItem {
  return makeShopifyCartItem(variantId, amount, quantity, null);
}

describe("useCartStore — pure computed selectors", () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      isOpen: false,
    });
  });

  describe("getTotalItems", () => {
    it("returns 0 for an empty cart", () => {
      expect(useCartStore.getState().getTotalItems()).toBe(0);
    });

    it("sums quantities across all items", () => {
      useCartStore.setState({
        items: [
          makeShopifyCartItem("gid://shopify/ProductVariant/1", "10.00", 2),
          makeShopifyCartItem("gid://shopify/ProductVariant/2", "20.00", 3),
        ],
      });
      expect(useCartStore.getState().getTotalItems()).toBe(5);
    });
  });

  describe("getTotalPrice", () => {
    it("returns 0 for an empty cart", () => {
      expect(useCartStore.getState().getTotalPrice()).toBe(0);
    });

    it("calculates price × quantity for each item", () => {
      useCartStore.setState({
        items: [
          makeShopifyCartItem("gid://shopify/ProductVariant/1", "10.00", 2), // 20
          makeShopifyCartItem("gid://shopify/ProductVariant/2", "5.50", 4),  // 22
        ],
      });
      expect(useCartStore.getState().getTotalPrice()).toBeCloseTo(42);
    });
  });

  describe("clearCart", () => {
    it("empties items, cartId, and checkoutUrl", () => {
      useCartStore.setState({
        items: [makeShopifyCartItem("gid://shopify/ProductVariant/1", "10.00")],
        cartId: "cart-123",
        checkoutUrl: "https://checkout.example.com",
      });
      useCartStore.getState().clearCart();
      const { items, cartId, checkoutUrl } = useCartStore.getState();
      expect(items).toHaveLength(0);
      expect(cartId).toBeNull();
      expect(checkoutUrl).toBeNull();
    });
  });

  describe("setOpen", () => {
    it("opens the cart drawer", () => {
      useCartStore.getState().setOpen(true);
      expect(useCartStore.getState().isOpen).toBe(true);
    });

    it("closes the cart drawer", () => {
      useCartStore.setState({ isOpen: true });
      useCartStore.getState().setOpen(false);
      expect(useCartStore.getState().isOpen).toBe(false);
    });
  });

  describe("getCheckoutUrl", () => {
    it("returns null when not set", () => {
      expect(useCartStore.getState().getCheckoutUrl()).toBeNull();
    });

    it("returns the checkout URL when set", () => {
      useCartStore.setState({ checkoutUrl: "https://checkout.example.com" });
      expect(useCartStore.getState().getCheckoutUrl()).toBe(
        "https://checkout.example.com",
      );
    });
  });

  describe("getShopifyItems / getLocalItems", () => {
    it("separates Shopify GID items from local items", () => {
      useCartStore.setState({
        items: [
          makeShopifyCartItem("gid://shopify/ProductVariant/1", "10.00"),
          makeLocalCartItem("local-product-abc-default", "15.00"),
        ],
      });
      expect(useCartStore.getState().getShopifyItems()).toHaveLength(1);
      expect(useCartStore.getState().getLocalItems()).toHaveLength(1);
    });

    it("returns empty arrays when cart is empty", () => {
      expect(useCartStore.getState().getShopifyItems()).toHaveLength(0);
      expect(useCartStore.getState().getLocalItems()).toHaveLength(0);
    });
  });

  describe("getShopifyTotal / getLocalTotal", () => {
    it("calculates separate totals for Shopify and local items", () => {
      useCartStore.setState({
        items: [
          makeShopifyCartItem("gid://shopify/ProductVariant/1", "10.00", 2), // 20
          makeLocalCartItem("local-product-abc-default", "5.00", 3),          // 15
        ],
      });
      expect(useCartStore.getState().getShopifyTotal()).toBeCloseTo(20);
      expect(useCartStore.getState().getLocalTotal()).toBeCloseTo(15);
    });
  });
});

describe("useCartStore — addItem (local products)", () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      isOpen: false,
    });
  });

  it("adds a local (non-Shopify) product to the cart", async () => {
    const item = makeLocalCartItem("local-uuid-default", "12.00");
    await useCartStore.getState().addItem(item);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].variantId).toBe("local-uuid-default");
  });

  it("increments quantity when the same local product is added again", async () => {
    const item = makeLocalCartItem("local-uuid-default", "12.00", 1);
    await useCartStore.getState().addItem(item);
    await useCartStore.getState().addItem(item);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });
});

describe("useCartStore — updateQuantity (local products)", () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [makeLocalCartItem("local-prod-default", "10.00", 2)],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      isOpen: false,
    });
  });

  it("updates the quantity of a local product", async () => {
    await useCartStore.getState().updateQuantity("local-prod-default", 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("removes the item when quantity is set to 0", async () => {
    await useCartStore.getState().updateQuantity("local-prod-default", 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe("useCartStore — removeItem (local products)", () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [
        makeLocalCartItem("local-a-default", "10.00"),
        makeLocalCartItem("local-b-default", "20.00"),
      ],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      isOpen: false,
    });
  });

  it("removes a local product by variantId", async () => {
    await useCartStore.getState().removeItem("local-a-default");
    const ids = useCartStore.getState().items.map((i) => i.variantId);
    expect(ids).not.toContain("local-a-default");
    expect(ids).toContain("local-b-default");
  });

  it("clears the cart when the last item is removed", async () => {
    useCartStore.setState({
      items: [makeLocalCartItem("local-only-default", "10.00")],
    });
    await useCartStore.getState().removeItem("local-only-default");
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
