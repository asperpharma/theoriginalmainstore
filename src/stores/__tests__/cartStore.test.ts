import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  addLineToShopifyCart,
  createShopifyCart,
  queryShopifyCart,
  removeLineFromShopifyCart,
  updateShopifyCartLine,
} from "@/lib/shopifyStorefront";
import { useCartStore } from "../cartStore";

vi.mock("@/lib/shopifyStorefront", () => ({
  createShopifyCart: vi.fn(),
  addLineToShopifyCart: vi.fn(),
  updateShopifyCartLine: vi.fn(),
  removeLineFromShopifyCart: vi.fn(),
  queryShopifyCart: vi.fn(),
}));

const baseProduct = {
  node: {
    id: "p1",
    title: "Hydrating Serum",
    handle: "hydrating-serum",
    description: "Deep hydration serum",
    vendor: "Asper",
    productType: "Serum",
    images: { edges: [] },
    priceRange: { minVariantPrice: { amount: "10", currencyCode: "JOD" } },
    variants: { edges: [] },
    options: [],
  },
};

const localCartItem = {
  product: baseProduct,
  variantId: "local-variant",
  variantTitle: "Default",
  price: { amount: "10", currencyCode: "JOD" },
  quantity: 1,
  selectedOptions: [],
};

describe("cartStore", () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      isOpen: false,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("adds and updates local-only cart items without calling Shopify APIs", async () => {
    await useCartStore.getState().addItem(localCartItem);

    expect(createShopifyCart).not.toHaveBeenCalled();
    expect(addLineToShopifyCart).not.toHaveBeenCalled();

    await useCartStore.getState().updateQuantity("local-variant", 3);

    const state = useCartStore.getState();
    expect(state.items[0]).toMatchObject({ variantId: "local-variant", quantity: 3 });
    expect(state.getLocalItems()).toHaveLength(1);
    expect(state.getShopifyItems()).toHaveLength(0);
    expect(state.getLocalTotal()).toBeCloseTo(30);
  });

  it("removes local items and clears the cart when empty", async () => {
    await useCartStore.getState().addItem(localCartItem);
    await useCartStore.getState().removeItem("local-variant");

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.cartId).toBeNull();
    expect(state.getTotalItems()).toBe(0);
  });

  it("adds multiple prescription products and opens the drawer", async () => {
    await useCartStore
      .getState()
      .addMultipleFromPrescription([
        { id: "rx1", title: "Item 1", price: 5 },
        { id: "rx2", title: "Item 2", price: 7, brand: "Derm", category: "Care" },
      ]);

    const state = useCartStore.getState();
    expect(state.items.map((i) => i.variantId)).toEqual(["rx1-default", "rx2-default"]);
    expect(state.isOpen).toBe(true);
    expect(state.getTotalItems()).toBe(2);
  });

  it("isolates Shopify items from local items in totals", () => {
    useCartStore.setState({
      items: [
        { ...localCartItem, lineId: null },
        {
          ...localCartItem,
          variantId: "gid://shopify/ProductVariant/123",
          lineId: "line-1",
          price: { amount: "12", currencyCode: "JOD" },
        },
      ],
    });

    const state = useCartStore.getState();
    expect(state.getShopifyItems()).toHaveLength(1);
    expect(state.getLocalItems()).toHaveLength(1);
    expect(state.getShopifyTotal()).toBeCloseTo(12);
    expect(state.getLocalTotal()).toBeCloseTo(10);
  });

  it("resets state when Shopify cart sync reports missing cart", async () => {
    useCartStore.setState({
      cartId: "shopify-cart",
      items: [{ ...localCartItem, variantId: "gid://shopify/ProductVariant/123", lineId: "1" }],
    });
    vi.mocked(queryShopifyCart).mockResolvedValue({ exists: false, totalQuantity: 0 });

    await useCartStore.getState().syncCart();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.cartId).toBeNull();
  });

  it("ignores Shopify API when variant is missing identifiers", async () => {
    useCartStore.setState({
      cartId: "shopify-cart",
      items: [{ ...localCartItem, variantId: "gid://shopify/ProductVariant/123", lineId: null }],
    });

    await useCartStore.getState().updateQuantity("gid://shopify/ProductVariant/123", 2);
    await useCartStore.getState().removeItem("gid://shopify/ProductVariant/123");

    expect(updateShopifyCartLine).not.toHaveBeenCalled();
    expect(removeLineFromShopifyCart).not.toHaveBeenCalled();
  });
});
