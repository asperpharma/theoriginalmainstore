import { describe, it, expect, beforeEach } from "vitest";
import { useWishlistStore } from "@/stores/wishlistStore";
import type { ShopifyProduct } from "@/lib/shopify";

function makeProduct(id: string, title = "Test Product"): ShopifyProduct {
  return {
    node: {
      id,
      title,
      handle: id,
      description: "",
      vendor: "TestBrand",
      productType: "Serum",
      images: { edges: [] },
      priceRange: {
        minVariantPrice: { amount: "25.00", currencyCode: "JOD" },
      },
      variants: {
        edges: [
          {
            node: {
              id: `${id}-variant`,
              title: "Default",
              price: { amount: "25.00", currencyCode: "JOD" },
              compareAtPrice: null,
              availableForSale: true,
              selectedOptions: [],
            },
          },
        ],
      },
      options: [],
    },
  } as ShopifyProduct;
}

describe("useWishlistStore", () => {
  beforeEach(() => {
    useWishlistStore.setState({ items: [], isOpen: false });
  });

  describe("addItem", () => {
    it("adds a product to an empty wishlist", () => {
      const product = makeProduct("p1");
      useWishlistStore.getState().addItem(product);
      expect(useWishlistStore.getState().items).toHaveLength(1);
      expect(useWishlistStore.getState().items[0].node.id).toBe("p1");
    });

    it("does not add a duplicate product", () => {
      const product = makeProduct("p1");
      useWishlistStore.getState().addItem(product);
      useWishlistStore.getState().addItem(product);
      expect(useWishlistStore.getState().items).toHaveLength(1);
    });

    it("adds multiple distinct products", () => {
      useWishlistStore.getState().addItem(makeProduct("p1"));
      useWishlistStore.getState().addItem(makeProduct("p2"));
      expect(useWishlistStore.getState().items).toHaveLength(2);
    });
  });

  describe("removeItem", () => {
    it("removes a product by ID", () => {
      useWishlistStore.getState().addItem(makeProduct("p1"));
      useWishlistStore.getState().addItem(makeProduct("p2"));
      useWishlistStore.getState().removeItem("p1");
      const ids = useWishlistStore.getState().items.map((i) => i.node.id);
      expect(ids).not.toContain("p1");
      expect(ids).toContain("p2");
    });

    it("is a no-op when the product is not in the wishlist", () => {
      useWishlistStore.getState().addItem(makeProduct("p1"));
      useWishlistStore.getState().removeItem("nonexistent");
      expect(useWishlistStore.getState().items).toHaveLength(1);
    });
  });

  describe("toggleItem", () => {
    it("adds a product that is not in the wishlist", () => {
      const product = makeProduct("p1");
      useWishlistStore.getState().toggleItem(product);
      expect(useWishlistStore.getState().items).toHaveLength(1);
    });

    it("removes a product that is already in the wishlist", () => {
      const product = makeProduct("p1");
      useWishlistStore.getState().addItem(product);
      useWishlistStore.getState().toggleItem(product);
      expect(useWishlistStore.getState().items).toHaveLength(0);
    });
  });

  describe("isInWishlist", () => {
    it("returns false when wishlist is empty", () => {
      expect(useWishlistStore.getState().isInWishlist("p1")).toBe(false);
    });

    it("returns true when product is in wishlist", () => {
      useWishlistStore.getState().addItem(makeProduct("p1"));
      expect(useWishlistStore.getState().isInWishlist("p1")).toBe(true);
    });

    it("returns false for a product not in wishlist", () => {
      useWishlistStore.getState().addItem(makeProduct("p1"));
      expect(useWishlistStore.getState().isInWishlist("p2")).toBe(false);
    });
  });

  describe("clearWishlist", () => {
    it("empties the wishlist", () => {
      useWishlistStore.getState().addItem(makeProduct("p1"));
      useWishlistStore.getState().addItem(makeProduct("p2"));
      useWishlistStore.getState().clearWishlist();
      expect(useWishlistStore.getState().items).toHaveLength(0);
    });
  });

  describe("setOpen", () => {
    it("opens the wishlist drawer", () => {
      useWishlistStore.getState().setOpen(true);
      expect(useWishlistStore.getState().isOpen).toBe(true);
    });

    it("closes the wishlist drawer", () => {
      useWishlistStore.setState({ isOpen: true });
      useWishlistStore.getState().setOpen(false);
      expect(useWishlistStore.getState().isOpen).toBe(false);
    });
  });
});
