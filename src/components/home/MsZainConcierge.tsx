import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { pinEliteBrandsToTop, ELITE_BRANDS } from "@/lib/eliteBrandSorter";
import { cn } from "@/lib/utils";

const LUXURY_EASE = [0.19, 1, 0.22, 1] as const;

const ELITE_BRAND_LIST = ELITE_BRANDS.map((b) => b.toLowerCase());

interface EliteProduct {
  id: string;
  title: string;
  brand: string | null;
  price: number | null;
  image_url: string | null;
  handle: string | null;
  asper_category: string | null;
  clinical_badge: string | null;
}

async function fetchEliteProducts(): Promise<EliteProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, title, brand, price, image_url, handle, asper_category, clinical_badge"
    )
    .eq("available", true)
    .limit(80);

  if (error || !data) return [];

  const elite = data.filter(
    (p) =>
      p.brand &&
      ELITE_BRAND_LIST.includes(p.brand.trim().toLowerCase())
  );

  return pinEliteBrandsToTop(
    elite.map((p) => ({ ...p, id: String(p.id) }))
  ).slice(0, 8);
}

function EliteProductCard({
  product,
  delay,
  isAr,
}: {
  product: EliteProduct;
  delay: number;
  isAr: boolean;
}) {
  const price =
    product.price != null
      ? Number(product.price).toFixed(3)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: LUXURY_EASE, delay }}
      className={cn(
        "group flex flex-col bg-white rounded-sm overflow-hidden",
        "border border-transparent",
        "transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
        "hover:border-[#C5A028] hover:shadow-lg"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-[#F8F8FF] overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-[#800020]/30 text-2xl">
              {product.brand?.charAt(0) ?? "A"}
            </span>
          </div>
        )}
        {product.clinical_badge && (
          <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.2em] bg-[#800020] text-white px-2 py-1 font-body font-semibold">
            {product.clinical_badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <p className="font-body text-[9px] uppercase tracking-[0.25em] text-[#C5A028] font-semibold">
          {product.brand}
        </p>
        <h3
          className={cn(
            "font-display text-sm text-[#1a1a1a] leading-snug line-clamp-2",
            isAr && "font-arabic"
          )}
        >
          {product.title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-3">
          {price && (
            <span className="font-body text-sm text-[#333333] font-medium">
              {price}{" "}
              <span className="text-[10px] text-[#333333]/60">JOD</span>
            </span>
          )}
          <Link
            to={`/product/${product.handle ?? product.id}`}
            className="inline-flex items-center justify-center font-body text-[9px] uppercase tracking-[0.2em] text-white bg-[#800020] px-3 py-2 hover:bg-[#600018] transition-colors duration-300 min-h-[36px]"
          >
            {isAr ? "اضيفي" : "Add"}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function MsZainConcierge() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["ms-zain-elite-products"],
    queryFn: fetchEliteProducts,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      className="w-full bg-[#F8F8FF] py-16 md:py-24"
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: LUXURY_EASE }}
        >
          <span className="font-body text-[10px] uppercase tracking-[0.4em] text-[#C5A028] mb-3 block font-semibold">
            {isAr ? "مس زين — كونسيير الجمال" : "Ms. Zain — Beauty Concierge"}
          </span>

          <h2
            className={cn(
              "font-display text-2xl md:text-3xl lg:text-4xl text-[#1a1a1a] leading-tight mb-4",
              isAr && "font-arabic"
            )}
          >
            {isAr
              ? "إشراق المختار — طقوس تفوق الزمن"
              : "A Radiant Ritual, Curated for the Discerning Eye"}
          </h2>

          <div className="gold-accent-line mx-auto my-5" />

          <p
            className={cn(
              "font-body text-sm md:text-base text-[#555555] leading-relaxed max-w-2xl mx-auto",
              isAr && "font-arabic"
            )}
          >
            {isAr
              ? "استيقاظ راقٍ لبشرتكِ — مجموعة من أرقى الدور العالمية، منتقاة بعين الخبيرة."
              : "A sophisticated awakening for your skin regimen. The world's most eminent maisons, selected with curator's precision."}
          </p>
        </motion.div>

        {/* Product grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-white/60 animate-pulse rounded-sm"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => (
              <EliteProductCard
                key={product.id}
                product={product}
                delay={i * 0.07}
                isAr={isAr}
              />
            ))}
          </div>
        ) : null}

        {/* CTA */}
        {products.length > 0 && (
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: LUXURY_EASE, delay: 0.4 }}
          >
            <Link
              to="/shop?elite=true"
              className="inline-flex items-center justify-center font-body text-[11px] uppercase tracking-[0.3em] text-[#1a1a1a] border-b border-[#C5A028] pb-1 hover:text-[#800020] transition-colors duration-400 min-h-[44px] px-4"
            >
              {isAr ? "اكتشفي المجموعة الكاملة" : "Discover the Full Collection"}
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
