import { useEffect, useRef, useState } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Link, useParams } from "react-router-dom";
import pdpHowToUse from "@/assets/pdp-how-to-use.jpg";
import pdpIngredients from "@/assets/pdp-ingredients.jpg";
import pdpRegulatory from "@/assets/pdp-regulatory.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  AlertTriangle,
  Beaker,
  Droplets,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Stethoscope,
} from "lucide-react";
import { ShareButtons } from "@/components/ShareButtons";
import { StickyAddToCart } from "@/components/StickyAddToCart";
import { ProductReviews } from "@/components/ProductReviews";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SafetyBadges } from "@/components/product/SafetyBadges";
import type { Tables } from "@/integrations/supabase/types";

type DbProduct = Tables<"products">;

/** Split-render JOD price: large integer, small currency + decimals */
const SplitPrice = ({ amount, className = "" }: { amount: number; className?: string }) => {
  const formatted = amount.toFixed(3);
  const [integer, decimals] = formatted.split(".");
  return (
    <span className={className}>
      <span className="text-2xl font-medium text-burgundy">{integer}</span>
      <span className="text-xs text-burgundy/70 align-top ms-0.5">.{decimals} JD</span>
    </span>
  );
};

const formatJODSimple = (n: number) => `${n.toFixed(3)} JD`;

const NotifyMeButton = ({ product, isArabic }: { product: { id: string; title: string } | null; isArabic: boolean }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !product) return;
    try {
      await supabase.from("customer_leads").insert({
        email,
        source: "notify_back_in_stock",
        notes: `Notify when back in stock: ${product.title} (${product.id})`,
      });
      setSent(true);
    } catch {
      setSent(true);
    }
  };
  if (sent) return (
    <div className="flex-1 flex items-center justify-center py-4 bg-muted/50 text-sm text-muted-foreground font-body">
      {isArabic ? "✓ سنخبرك عند التوفر" : "✓ We'll notify you when it's back"}
    </div>
  );
  return (
    <form onSubmit={handleNotify} className="flex-1 flex gap-2">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={isArabic ? "بريدك الإلكتروني" : "Your email"}
        className="flex-1 px-3 py-2 border border-border text-sm font-body focus:outline-none focus:border-burgundy"
        required
      />
      <button type="submit" className="px-4 py-2 bg-burgundy text-polished-white text-sm font-body font-medium hover:bg-burgundy-light transition-colors whitespace-nowrap">
        {isArabic ? "أخبرني" : "Notify Me"}
      </button>
    </form>
  );
};

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { locale, isRTL } = useLanguage();
  const isArabic = locale === "ar";
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const ctaRef = useRef<HTMLDivElement>(null);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();

  const BASE_URL = "https://www.asperbeautyshop.com";
  usePageMeta({
    title: product
      ? `${product.title} — ${product.brand || "Asper Beauty Shop"}`
      : "Product — Asper Beauty Shop",
    description: product?.pharmacist_note || product?.description || undefined,
    image: product?.image_url || undefined,
    canonical: `/product/${handle}`,
    type: "product",
    jsonLd: product ? {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: product.pharmacist_note || product.description || "",
      image: product.image_url || `${BASE_URL}/og-image.jpg`,
      brand: { "@type": "Brand", name: product.brand },
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: "JOD",
        availability: product.availability_status === 'In_Stock'
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: `${BASE_URL}/product/${product.handle}`,
        seller: { "@type": "Organization", name: "Asper Beauty Shop" },
      },
    } : undefined,
  });

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("handle", handle)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setProduct(data);
          const { data: related } = await supabase
            .from("products")
            .select("*")
            .eq("primary_concern", data.primary_concern)
            .neq("id", data.id)
            .limit(4);
          setRelatedProducts(related || []);
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [handle]);

  const buildShopifyNode = (p: DbProduct) => ({
    id: p.id,
    title: p.title,
    description: p.pharmacist_note || "",
    handle: p.handle,
    vendor: p.brand || "",
    productType: p.primary_concern || "",
    priceRange: { minVariantPrice: { amount: String(p.price ?? 0), currencyCode: "JOD" } },
    images: { edges: [{ node: { url: p.image_url || "", altText: p.title } }] },
    variants: { edges: [] as Array<{ node: { id: string; title: string; price: { amount: string; currencyCode: string }; compareAtPrice?: { amount: string; currencyCode: string } | null; availableForSale: boolean; selectedOptions: Array<{ name: string; value: string }> } }> },
    options: [] as Array<{ name: string; values: string[] }>,
  });

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      product: { node: buildShopifyNode(product) },
      variantId: product.id,
      variantTitle: "Default",
      price: { amount: String(product.price ?? 0), currencyCode: "JOD" },
      quantity,
      selectedOptions: [],
    });
    toast.success(isArabic ? "تمت الإضافة إلى الحقيبة" : "Added to your ritual", { description: product.title, position: "top-center" });
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleItem({ node: buildShopifyNode(product) });
    if (!isInWishlist(product.id)) {
      toast.success(isArabic ? "تمت الإضافة إلى المفضلة" : "Added to wishlist", { description: product.title, position: "top-center" });
    }
  };

  const isWishlisted = product ? isInWishlist(product.id) : false;
  const currentPrice = product?.price ?? 0;
  const isOutOfStock = product?.availability_status !== 'In_Stock' && product?.availability_status != null;
  const originalPrice = product?.compare_at_price ?? null;
  const discountPct = originalPrice && originalPrice > currentPrice && currentPrice > 0
    ? Math.round((1 - currentPrice / originalPrice) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <div className="grid lg:grid-cols-2 min-h-screen pt-20">
          <div className="bg-muted/30 aspect-[4/5] animate-pulse" />
          <div className="p-8 lg:p-16 space-y-6">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            <div className="h-20 w-full bg-muted rounded animate-pulse" />
            <div className="h-14 w-full bg-muted rounded animate-pulse" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] pt-36">
          <h1 className="font-display text-2xl text-foreground mb-4">
            {isArabic ? "المنتج غير موجود" : "Product Not Found"}
          </h1>
          <Link to="/" className="text-primary hover:underline text-sm">
            {isArabic ? "العودة للمتجر" : "Return to Shop"}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const brandName = product.brand || (isArabic ? "مجموعة حصرية" : "Exclusive Collection");
  const galleryImages = product.image_url ? [product.image_url] : ["/editorial-showcase-2.webp"];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <div className="grid lg:grid-cols-2 min-h-screen pt-20">
        {/* LEFT: Hero Image Gallery — Above the Fold Priority */}
        <div className="bg-muted/30 lg:overflow-y-auto">
          <div className="space-y-1">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="relative aspect-[4/5] overflow-hidden">
                <img src={img} alt={`${product.title} - View ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Clean PDP — Price + Cart Above Fold, Clinical Data in Accordions */}
        <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto bg-background">
          <div className="p-8 lg:p-16 flex flex-col justify-center min-h-full">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-6">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">{isArabic ? "الرئيسية" : "Home"}</Link>
              <span className="text-muted-foreground">/</span>
              <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">{isArabic ? "المتجر" : "Shop"}</Link>
              {product.asper_category && (
                <>
                  <span className="text-muted-foreground">/</span>
                  <Link
                    to={`/shop?category=${encodeURIComponent(product.asper_category)}`}
                    className="text-muted-foreground hover:text-primary transition-colors truncate max-w-[120px]"
                  >
                    {product.asper_category}
                  </Link>
                </>
              )}
            </nav>

            {/* Above the Fold: Brand, Title, Price */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">{brandName}</span>
                {isOutOfStock && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-muted-foreground/20 text-muted-foreground rounded">
                    {isArabic ? "نفد المخزون" : "Out of Stock"}
                  </span>
                )}
                {!isOutOfStock && discountPct > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-polished-gold text-dark-charcoal rounded">
                    -{discountPct}% OFF
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl lg:text-4xl text-foreground leading-tight mb-6">{product.title}</h1>
              <div className="flex items-baseline gap-3">
                <SplitPrice amount={currentPrice} />
                {discountPct > 0 && originalPrice && (
                  <span className="text-base text-muted-foreground line-through font-body">
                    {originalPrice.toFixed(3)} JD
                  </span>
                )}
              </div>
            </div>

            {/* Pharmacist Note (brief) */}
            {product.pharmacist_note && (
              <div className="mb-8 p-6 bg-[#F8F8FF] border-l-4 border-[#800020] rounded-r-xl shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-[#800020]">
                  <Stethoscope className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">{isArabic ? "ملاحظة الصيدلاني" : "Pharmacist Clinical Note"}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed font-light italic">"{product.pharmacist_note}"</p>
              </div>
            )}

            {/* Clinical Badge */}
            {product.clinical_badge && (
              <div className="mb-6 px-4 py-3 bg-accent/10 border border-accent/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="w-4 h-4 text-accent" />
                  {product.clinical_badge}
                </div>
              </div>
            )}

            {/* Gold Divider */}
            <div className="w-16 h-px bg-polished-gold mb-10" />

            {/* Add to Cart — Primary CTA */}
            <div ref={ctaRef} className="space-y-6 mb-10">
              <div className="flex items-center justify-center gap-8 py-4 border border-polished-gold/30">
                <button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:text-burgundy transition-colors"><Minus className="w-4 h-4" /></button>
                <span className="text-lg font-body font-medium w-8 text-center text-asper-ink">{quantity}</span>
                <button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)} className="p-3 hover:text-burgundy transition-colors"><Plus className="w-4 h-4" /></button>
              </div>

              <div className="flex gap-4">
                {isOutOfStock ? (
                  <NotifyMeButton product={product} isArabic={isArabic} />
                ) : (
                <Button onClick={handleAddToCart} variant="luxury" size="luxury-lg" className="flex-1">
                  <ShoppingBag className="w-5 h-5 me-3" />
                  {`${isArabic ? "أضف إلى الحقيبة" : "Add to Ritual"} — ${formatJODSimple(currentPrice * quantity)}`}
                </Button>
                )}
                <button onClick={handleWishlistToggle} className={`w-14 h-14 flex items-center justify-center border transition-all ${isWishlisted ? "bg-primary border-primary text-primary-foreground" : "border-border text-foreground hover:border-primary"}`}>
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {isArabic ? "موزع معتمد • منتج أصلي 100%" : "Authorized Retailer • 100% Authentic"}
              </div>

              <SafetyBadges product={product} className="justify-center" />
              <ShareButtons url={window.location.href} title={`${isArabic ? "اكتشف" : "Check out"} ${product.title}`} />
            </div>

            {/* ─── Clean PDP Accordions: Clinical data below the fold ─── */}
            <Accordion type="multiple" className="w-full border-t border-polished-gold/30">
              {/* How to Use */}
              <AccordionItem value="how-to-use" className="border-border">
                <AccordionTrigger className="text-sm font-medium uppercase tracking-widest hover:no-underline py-5">
                  <span className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-primary" />
                    {isArabic ? "طريقة الاستخدام" : "How to Use"}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 py-2">
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                      <img src={pdpHowToUse} alt="Skincare application ritual" className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-asper-ink/30 to-transparent" />
                    </div>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                      <p>{isArabic ? "نظفي البشرة جيداً وجففيها بلطف." : "Cleanse skin thoroughly and pat dry."}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                      <p>{isArabic ? "ضعي كمية مناسبة على الوجه والرقبة." : "Apply an appropriate amount to face and neck."}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                      <p>{isArabic ? "دلكي بلطف بحركات دائرية حتى يمتص بالكامل." : "Massage gently in circular motions until fully absorbed."}</p>
                    </div>
                    {product.regimen_step && (
                      <div className="mt-3 px-3 py-2 bg-accent/10 rounded text-xs">
                        <span className="font-semibold text-foreground">{isArabic ? "خطوة الروتين:" : "Regimen Step:"}</span>{" "}
                        {product.regimen_step.replace(/_/g, " ")}
                      </div>
                    )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Ingredients (INCI) */}
              <AccordionItem value="ingredients" className="border-border">
                <AccordionTrigger className="text-sm font-medium uppercase tracking-widest hover:no-underline py-5">
                  <span className="flex items-center gap-2">
                    <Beaker className="w-4 h-4 text-primary" />
                    {isArabic ? "المكونات (INCI)" : "Ingredients (INCI)"}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="py-2">
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                      <img src={pdpIngredients} alt="Clinical botanical ingredients" className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-asper-ink/30 to-transparent" />
                    </div>
                    {product.key_ingredients && product.key_ingredients.length > 0 ? (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">
                          {isArabic ? "المكونات الفعالة الرئيسية" : "Key Active Ingredients"}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.key_ingredients.map((ing) => (
                            <span key={ing} className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-xs text-foreground font-medium">{ing}</span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                          {isArabic
                            ? "للحصول على قائمة INCI الكاملة، يرجى مراجعة عبوة المنتج."
                            : "For the full INCI list, please refer to the product packaging."}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {isArabic
                          ? "يرجى مراجعة عبوة المنتج لمعرفة القائمة الكاملة للمكونات."
                          : "Please refer to the product packaging for the complete ingredient list."}
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Regulatory Warnings */}
              <AccordionItem value="regulatory" className="border-border">
                <AccordionTrigger className="text-sm font-medium uppercase tracking-widest hover:no-underline py-5">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    {isArabic ? "التحذيرات التنظيمية" : "Regulatory Warnings"}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="py-2 space-y-4">
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                      <img src={pdpRegulatory} alt="Certification and authenticity seal" className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-asper-ink/30 to-transparent" />
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                    <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <p className="font-medium text-foreground text-xs uppercase tracking-wider mb-2">
                        {isArabic ? "تحذيرات مهمة" : "Important Warnings"}
                      </p>
                      <ul className="space-y-1.5 text-xs">
                          <li>• {isArabic ? "للاستخدام الخارجي فقط. تجنبي ملامسة العينين." : "For external use only. Avoid contact with eyes."}</li>
                          <li>• {isArabic ? "توقفي عن الاستخدام في حال حدوث تهيج." : "Discontinue use if irritation occurs."}</li>
                          <li>• {isArabic ? "يُحفظ بعيداً عن متناول الأطفال." : "Keep out of reach of children."}</li>
                          <li>• {isArabic ? "يُخزّن في درجة حرارة أقل من 25 درجة مئوية." : "Store below 25°C. Protect from direct sunlight."}</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{isArabic ? "ملاحظة:" : "Note:"} </span>
                        {isArabic
                          ? "قد يختلف تصميم العبوة عن الصورة المعروضة بسبب تحديثات الشركة المصنعة. المنتج والمكونات تبقى كما هي."
                          : "Packaging design may vary from the image shown due to manufacturer updates. The product and ingredients remain the same."}
                      </p>
                    </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Reviews with Contextual Social Proof */}
              <AccordionItem value="reviews" className="border-border">
                <AccordionTrigger className="text-sm font-medium uppercase tracking-widest hover:no-underline py-5">
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-polished-gold" />
                    {isArabic ? "التقييمات" : "Reviews"}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ProductReviews productId={product.id} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <h2 className="font-display text-2xl text-foreground mb-8">{isArabic ? "قد يعجبك أيضاً" : "You May Also Like"}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} to={`/product/${rp.handle}`} className="group">
                  <div className="aspect-square bg-asper-stone rounded-lg overflow-hidden mb-3 border border-transparent group-hover:border-polished-gold transition-colors duration-300">
                    <img src={rp.image_url || "/editorial-showcase-2.webp"} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="text-xs text-asper-ink-muted uppercase tracking-widest font-body">{rp.brand}</p>
                  <p className="text-sm font-medium text-asper-ink line-clamp-2 font-body">{rp.title}</p>
                  <SplitPrice amount={rp.price ?? 0} className="mt-1" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />

      {/* Sticky Add-to-Cart Bar */}
      <StickyAddToCart
        productTitle={product.title}
        price={currentPrice}
        onAddToCart={handleAddToCart}
        triggerRef={ctaRef as React.RefObject<HTMLElement>}
      />
    </div>
  );
};

export default ProductDetail;
