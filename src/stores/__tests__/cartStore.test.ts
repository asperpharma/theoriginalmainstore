import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCartStore, type CartItem, type PrescriptionProduct } from "../cartStore";
import type { ShopifyProduct } from "@/lib/shopify";
import {
  addLineToShopifyCart,
  createShopifyCart,
  queryShopifyCart,
  removeLineFromShopifyCart,
  updateShopifyCartLine,
} from "@/lib/shopifyStorefront";

vi.mock("@/lib/shopifyStorefront", () => ({
  createShopifyCart: vi.fn(),
  addLineToShopifyCart: vi.fn(),
  updateShopifyCartLine: vi.fn(),
  removeLineFromShopifyCart: vi.fn(),
  queryShopifyCart: vi.fn(),
}));

const shopifyProduct: ShopifyProduct = {
  node: {
    id: "gid://shopify/Product/1",
    title: "Serum",
    handle: "serum",
    description: "Brightening serum",
    vendor: "Asper",
    productType: "Skin Care",
    images: { edges: [] },
    priceRange: { minVariantPrice: { amount: "25", currencyCode: "JOD" } },
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/Variant/1",
            title: "Default",
            price: { amount: "25", currencyCode: "JOD" },
            compareAtPrice: null,
            availableForSale: true,
            selectedOptions: [],
          },
        },
      ],
    },
    options: [],
  },
};

const shopifyItem: Omit<CartItem, "lineId"> = {
  product: shopifyProduct,
  variantId: "gid://shopify/Variant/1",
  variantTitle: "Default",
  price: { amount: "25", currencyCode: "JOD" },
  quantity: 1,
  selectedOptions: [],
};

const secondShopifyProduct: ShopifyProduct = {
  ...shopifyProduct,
  node: {
    ...shopifyProduct.node,
    id: "gid://shopify/Product/2",
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/Variant/2",
            title: "Default",
            price: { amount: "30", currencyCode: "JOD" },
            compareAtPrice: null,
            availableForSale: true,
            selectedOptions: [],
          },
        },
      ],
    },
  },
};

const secondShopifyItem: Omit<CartItem, "lineId"> = {
  ...shopifyItem,
  product: secondShopifyProduct,
  variantId: "gid://shopify/Variant/2",
};

const localItem: Omit<CartItem, "lineId"> = {
  ...shopifyItem,
  variantId: "local-1",
  product: { ...shopifyProduct, node: { ...shopifyProduct.node, id: "local-1" } },
};

const mockedCreateCart = vi.mocked(createShopifyCart);
const mockedAddLine = vi.mocked(addLineToShopifyCart);
const mockedUpdateLine = vi.mocked(updateShopifyCartLine);
const mockedRemoveLine = vi.mocked(removeLineFromShopifyCart);
const mockedQueryCart = vi.mocked(queryShopifyCart);

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

  it("adds local items and increments quantity without Shopify calls", async () => {
    await useCartStore.getState().addItem(localItem);
    await useCartStore.getState().addItem({ ...localItem, quantity: 2 });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]?.lineId).toBeNull();
    expect(state.items[0]?.quantity).toBe(3);
    expect(mockedCreateCart).not.toHaveBeenCalled();
    expect(mockedAddLine).not.toHaveBeenCalled();
  });

  it("creates a Shopify cart when adding the first Shopify item", async () => {
    mockedCreateCart.mockResolvedValue({
      cartId: "cart123",
      checkoutUrl: "https://checkout",
      lineId: "line123",
    });

    await useCartStore.getState().addItem(shopifyItem);

    const state = useCartStore.getState();
    expect(state.cartId).toBe("cart123");
    expect(state.checkoutUrl).toBe("https://checkout");
    expect(state.items[0]?.lineId).toBe("line123");
    expect(mockedCreateCart).toHaveBeenCalledWith({ ...shopifyItem, lineId: null });
  });

  it("adds a new Shopify line when a cart already exists", async () => {
    useCartStore.setState({
      cartId: "cart123",
      checkoutUrl: "https://checkout",
      items: [{ ...shopifyItem, lineId: "line123" }],
    });
    mockedAddLine.mockResolvedValue({ success: true, lineId: "line456" });

    await useCartStore.getState().addItem(secondShopifyItem);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(2);
    expect(state.items[1]?.lineId).toBe("line456");
    expect(mockedAddLine).toHaveBeenCalledWith("cart123", { ...secondShopifyItem, lineId: null });
  });

  it("updates Shopify quantities when lineId and cartId exist", async () => {
    useCartStore.setState({
      cartId: "cart123",
      items: [{ ...shopifyItem, lineId: "line123" }],
    });
    mockedUpdateLine.mockResolvedValue({ success: true });

    await useCartStore.getState().updateQuantity(shopifyItem.variantId, 3);

    expect(mockedUpdateLine).toHaveBeenCalledWith("cart123", "line123", 3);
    expect(useCartStore.getState().items[0]?.quantity).toBe(3);
  });

  it("removes local items and clears the cart when empty", async () => {
    useCartStore.setState({
      items: [{ ...localItem, lineId: null }],
      cartId: null,
      checkoutUrl: null,
    });

    await useCartStore.getState().removeItem(localItem.variantId);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.cartId).toBeNull();
    expect(mockedRemoveLine).not.toHaveBeenCalled();
  });

  it("syncs cart and clears state when Shopify cart is missing", async () => {
    useCartStore.setState({
      cartId: "cart123",
      items: [{ ...shopifyItem, lineId: "line123" }],
    });
    mockedQueryCart.mockResolvedValue({ exists: false, totalQuantity: 0 });

    await useCartStore.getState().syncCart();

    const state = useCartStore.getState();
    expect(state.cartId).toBeNull();
    expect(state.items).toHaveLength(0);
  });

  it("adds multiple prescription products and opens the drawer", async () => {
    const products: PrescriptionProduct[] = [
      { id: "rx-1", title: "Rx Serum", price: 40 },
      { id: "rx-2", title: "Rx Cream", price: 35 },
    ];

    await useCartStore.getState().addMultipleFromPrescription(products);

    const state = useCartStore.getState();
    expect(state.items.map((i) => i.variantId)).toEqual(["rx-1-default", "rx-2-default"]);
    expect(state.isOpen).toBe(true);
    expect(mockedCreateCart).not.toHaveBeenCalled();
  });
});
