import { beforeEach, describe, expect, it } from "vitest";
import { useWishlistStore } from "../wishlistStore";
import type { ShopifyProduct } from "@/lib/shopify";

const product: ShopifyProduct = {
  node: {
    id: "gid://shopify/Product/10",
    title: "Radiance Serum",
    handle: "radiance-serum",
    description: "Brightens and hydrates",
    vendor: "Asper",
    productType: "Skin Care",
    images: { edges: [] },
    priceRange: { minVariantPrice: { amount: "42", currencyCode: "JOD" } },
    variants: { edges: [] },
    options: [],
  },
};

const secondProduct: ShopifyProduct = {
  ...product,
  node: { ...product.node, id: "gid://shopify/Product/11", title: "Night Cream" },
};

describe("wishlistStore", () => {
  beforeEach(() => {
    useWishlistStore.setState({ items: [], isOpen: false });
    localStorage.clear();
  });

  it("adds unique products and ignores duplicates", () => {
    useWishlistStore.getState().addItem(product);
    useWishlistStore.getState().addItem(product);

    const state = useWishlistStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]?.node.title).toBe("Radiance Serum");
  });

  it("removes products by id", () => {
    useWishlistStore.getState().addItem(product);
    useWishlistStore.getState().removeItem(product.node.id);

    expect(useWishlistStore.getState().items).toHaveLength(0);
  });

  it("toggles products in the wishlist", () => {
    useWishlistStore.getState().toggleItem(product);
    expect(useWishlistStore.getState().items).toHaveLength(1);

    useWishlistStore.getState().toggleItem(product);
    expect(useWishlistStore.getState().items).toHaveLength(0);
  });

  it("checks membership through isInWishlist", () => {
    const store = useWishlistStore.getState();
    store.addItem(product);

    expect(store.isInWishlist(product.node.id)).toBe(true);
    expect(store.isInWishlist(secondProduct.node.id)).toBe(false);
  });

  it("updates drawer visibility", () => {
    useWishlistStore.getState().setOpen(true);
    expect(useWishlistStore.getState().isOpen).toBe(true);
    useWishlistStore.getState().setOpen(false);
    expect(useWishlistStore.getState().isOpen).toBe(false);
  });

  it("clears all wishlist items", () => {
    useWishlistStore.getState().addItem(product);
    useWishlistStore.getState().addItem(secondProduct);

    useWishlistStore.getState().clearWishlist();
    expect(useWishlistStore.getState().items).toHaveLength(0);
  });
});
