import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateTitle } from "@/lib/productUtils";
import { formatJOD } from "@/lib/productImageUtils";
import { ArrowRight, Heart, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Wishlist() {
  const { language, isRTL } = useLanguage();
  const isAr = language === "ar";
  const [bulkAdding, setBulkAdding] = useState(false);

  usePageMeta({
    title: isAr ? "قائمة الأمنيات | أسبر بيوتي" : "My Wishlist | Asper Beauty",
    description: isAr ? "منتجاتك المفضلة في أسبر بيوتي." : "Your saved favorite products at Asper Beauty.",
    canonical: "/wishlist",
  });
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);
  const setCartOpen = useCartStore((state) => state.setOpen);

  const handleAddToCart = async (product: typeof items[0]) => {
    const firstVariant = product.node.variants.edges[0]?.node;
    if (!firstVariant) {
      toast.error(isAr ? "هذا المنتج غير متاح حالياً" : "This product is no longer available");
      return;
    }

    if (firstVariant.availableForSale === false) {
      toast.error(isAr ? "نفد من المخزون" : "Out of stock");
      return;
    }

    try {
      await addToCart({
        product,
        variantId: firstVariant.id,
        variantTitle: firstVariant.title,
        price: firstVariant.price,
        quantity: 1,
        selectedOptions: firstVariant.selectedOptions,
      });

      toast.success(isAr ? "تمت الإضافة للحقيبة" : "Added to Bag", {
        description: product.node.title,
        position: "top-center",
      });

      removeItem(product.node.id);
      setCartOpen(true);
    } catch (err) {
      console.error("Failed to add wishlist item to cart", err);
      toast.error(isAr ? "تعذر إضافة المنتج" : "Couldn't add this item right now");
    }
  };

  const handleAddAllToCart = async () => {
    if (!items.length) {
      toast.message(isAr ? "لا توجد عناصر للإضافة" : "No items to add");
      return;
    }

    setBulkAdding(true);
    let addedCount = 0;
    let skippedCount = 0;

    try {
      for (const product of items) {
        const firstVariant = product.node.variants.edges[0]?.node;
        const isAvailable = firstVariant && firstVariant.availableForSale !== false;
        if (!firstVariant || !isAvailable) {
          skippedCount += 1;
          continue;
        }

        await addToCart({
          product,
          variantId: firstVariant.id,
          variantTitle: firstVariant.title,
          price: firstVariant.price,
          quantity: 1,
          selectedOptions: firstVariant.selectedOptions,
        });
        removeItem(product.node.id);
        addedCount += 1;
      }
    } catch (err) {
      console.error("Failed to add all wishlist items", err);
      toast.error(isAr ? "تعذر إضافة بعض العناصر" : "Couldn't add items right now", {
        position: "top-center",
      });
    }

    setBulkAdding(false);

    if (addedCount === 0) {
      toast.error(isAr ? "كل العناصر غير متاحة حالياً" : "All items are currently unavailable", {
        position: "top-center",
      });
      return;
    }

    toast.success(
      isAr
        ? `تمت إضافة ${addedCount} ${addedCount === 1 ? "منتج" : "منتجات"}${skippedCount ? ` • ${skippedCount} غير متاحة` : ""}`
        : `Added ${addedCount} item${addedCount !== 1 ? "s" : ""}${skippedCount ? ` • ${skippedCount} unavailable` : ""}`,
      { position: "top-center" },
    );

    setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      <main className="pt-40 pb-20">
        <div className="luxury-container">
          {/* Page Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-6">
              <Heart className="w-8 h-8 text-gold fill-gold" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-cream mb-4">
              {isAr
                ? (
                  <>
                    قائمة <span className="text-gold">الرغبات</span>
                  </>
                )
                : (
                  <>
                    My <span className="text-gold">Wishlist</span>
                  </>
                )}
            </h1>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
            <p className="font-body text-cream/60 max-w-2xl mx-auto">
              {isAr
                ? "منتجاتك المفضلة محفوظة هنا لشرائها لاحقاً."
                : "Your favorite products saved for later."}
            </p>
          </div>

          {items.length === 0
            ? (
              /* Empty State */
              <div className="text-center py-20">
                <div className="w-32 h-32 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center mx-auto mb-8">
                  <Heart className="w-16 h-16 text-gold/30" />
                </div>
                <h2 className="font-display text-2xl text-cream mb-4">
                  {isAr ? "قائمة الرغبات فارغة" : "Your wishlist is empty"}
                </h2>
                <p className="font-body text-cream/60 mb-8 max-w-md mx-auto">
                  {isAr
                    ? "ابدأي بإضافة منتجاتك المفضلة عن طريق النقر على أيقونة القلب في أي منتج."
                    : "Start adding your favorite products by clicking the heart icon on any product."}
                </p>
                <Link to="/collections">
                  <Button className="bg-gold text-background hover:bg-gold-light font-display tracking-wider">
                    {isAr ? "تصفح المجموعات" : "Browse Collections"}
                    <ArrowRight className="w-4 h-4 ms-2" />
                  </Button>
                </Link>
              </div>
            )
            : (
              <>
                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 p-4 bg-secondary/30 border border-gold/10">
                  <p className="font-body text-cream/80">
                    {isAr
                      ? `${items.length} ${
                        items.length === 1 ? "منتج محفوظ" : "منتجات محفوظة"
                      }`
                      : `${items.length} item${
                        items.length !== 1 ? "s" : ""
                      } saved`}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gold/30 text-cream hover:bg-gold/10"
                      onClick={clearWishlist}
                    >
                      <Trash2 className="w-4 h-4 me-2" />
                      {isAr ? "مسح الكل" : "Clear All"}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gold text-background hover:bg-gold-light"
                      onClick={() => void handleAddAllToCart()}
                      disabled={bulkAdding}
                    >
                      {bulkAdding
                        ? (
                          <>
                            <Loader2 className="w-4 h-4 me-2 animate-spin" />
                            {isAr ? "جارٍ الإضافة..." : "Adding..."}
                          </>
                        )
                        : (
                          <>
                            <ShoppingBag className="w-4 h-4 me-2" />
                            {isAr ? "إضافة الكل للحقيبة" : "Add All to Bag"}
                          </>
                        )}
                    </Button>
                  </div>
                </div>

                {/* Wishlist Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map((product) => {
                    const firstImage = product.node.images.edges[0]?.node;
                    const price = product.node.priceRange.minVariantPrice;
                    const firstVariant = product.node.variants.edges[0]?.node;
                    const isAvailable = firstVariant?.availableForSale !== false;
                    const parsedPrice = Number.parseFloat(price.amount);
                    const displayPrice = formatJOD(
                      Number.isFinite(parsedPrice) ? parsedPrice : null,
                    );

                    return (
                      <div
                        key={product.node.id}
                        className="group bg-secondary/20 border border-gold/10 hover:border-gold/30 transition-all duration-200 overflow-hidden"
                      >
                        {/* Image */}
                        <Link
                          to={`/product/${product.node.handle}`}
                          className="block aspect-square relative overflow-hidden bg-cream/5"
                        >
                          {firstImage
                            ? (
                              <img
                                src={firstImage.url}
                                alt={firstImage.altText || product.node.title}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                              />
                            )
                            : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Heart className="w-12 h-12 text-gold/20" />
                              </div>
                            )}

                          {!isAvailable && (
                            <Badge className="absolute top-3 left-3 bg-red-500 text-white border-none shadow-sm">
                              {isAr ? "غير متوفر" : "Sold out"}
                            </Badge>
                          )}

                          {/* Remove Button Overlay */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              removeItem(product.node.id);
                            }}
                            type="button"
                            aria-label={isAr ? "إزالة من المفضلة" : "Remove from wishlist"}
                            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-gold/30 flex items-center justify-center text-cream hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Link>

                        {/* Details */}
                        <div className="p-4">
                          <Link
                            to={`/product/${product.node.handle}`}
                            className="font-display text-sm text-cream hover:text-gold transition-colors line-clamp-2 mb-2 block"
                          >
                            {translateTitle(product.node.title, language)}
                          </Link>

                          <p className="font-display text-gold text-lg mb-4">
                            {displayPrice}
                          </p>

                          <Button
                            size="sm"
                            className="w-full bg-gold text-background hover:bg-gold-light font-display text-xs tracking-wider"
                            onClick={() => void handleAddToCart(product)}
                            disabled={!isAvailable}
                          >
                            <ShoppingBag className="w-3.5 h-3.5 me-2" />
                            {isAvailable
                              ? (isAr ? "أضف للحقيبة" : "Add to Bag")
                              : (isAr ? "غير متوفر" : "Unavailable")}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Continue Shopping */}
                <div className="text-center mt-12">
                  <Link to="/collections">
                    <Button
                      variant="outline"
                      className="border-gold/30 text-cream hover:bg-gold/10 hover:border-gold font-display tracking-wider"
                    >
                      {isAr ? "متابعة التسوق" : "Continue Shopping"}
                      <ArrowRight className="w-4 h-4 ms-2" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
