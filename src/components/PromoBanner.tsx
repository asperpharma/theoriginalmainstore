import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { ArrowRight, Shield, Sparkles } from "lucide-react";

interface PromoBannerProps {
  variant?: "clinical" | "luxury" | "sale";
}

export function PromoBanner({ variant = "clinical" }: PromoBannerProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const content = {
    clinical: {
      eyebrowEn: "Pharmacist's Pick",
      eyebrowAr: "اختيار الصيدلاني",
      headlineEn: "Clinically Proven Skincare",
      headlineAr: "عناية بالبشرة مُثبتة علمياً",
      subEn: "Dermatologist-tested formulations backed by science. Free consultation with every order.",
      subAr: "تركيبات مُختبرة من أطباء الجلدية ومدعومة بالعلم. استشارة مجانية مع كل طلب.",
      ctaEn: "Explore Clinical Range",
      ctaAr: "استكشفي المجموعة العلاجية",
      href: "/skin-concerns",
      Icon: Shield,
      bg: "from-[#0a0505] via-[#1a0808] to-[#2a0c0c]",
    },
    luxury: {
      eyebrowEn: "Curated Luxury",
      eyebrowAr: "فخامة مُختارة",
      headlineEn: "Indulge in Premium Beauty",
      headlineAr: "انغمسي في الجمال الفاخر",
      subEn: "350+ prestigious brands. Every product guaranteed authentic with our pharmacist seal.",
      subAr: "أكثر من ٣٥٠ علامة تجارية مرموقة. كل منتج مضمون الأصالة بختم الصيدلاني.",
      ctaEn: "Shop Luxury",
      ctaAr: "تسوقي الفخامة",
      href: "/brands",
      Icon: Sparkles,
      bg: "from-[#2a1a0a] via-[#1a0f05] to-[#0a0505]",
    },
    sale: {
      eyebrowEn: "Limited Time Offer",
      eyebrowAr: "عرض لفترة محدودة",
      headlineEn: "Up to 40% Off Best Sellers",
      headlineAr: "خصم يصل إلى ٤٠٪ على الأكثر مبيعاً",
      subEn: "Don't miss our biggest sale of the season. Authentic products at unbeatable prices.",
      subAr: "لا تفوتي أكبر تخفيضاتنا هذا الموسم. منتجات أصلية بأسعار لا تُقاوم.",
      ctaEn: "Shop Offers",
      ctaAr: "تسوقي العروض",
      href: "/offers",
      Icon: Sparkles,
      bg: "from-[#800020] via-[#5a0018] to-[#2a000c]",
    },
  };

  const c = content[variant];

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl mx-4 md:mx-0",
        "shadow-[12px_12px_24px_hsl(0_0%_82%/0.5),-12px_-12px_24px_hsl(0_0%_100%/0.7)]",
      )}
    >
      <div className={cn("bg-gradient-to-r py-12 md:py-16 px-8 md:px-16", c.bg)}>
        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-polished-gold/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-polished-gold/40 to-transparent" />

        {/* Maroon glow */}
        <div
          className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(128,0,32,0.2) 0%, transparent 70%)" }}
        />

        <div className={cn(
          "relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16",
          isAr && "md:flex-row-reverse text-right"
        )}>
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/5 border border-polished-gold/20 shadow-[6px_6px_14px_rgba(0,0,0,0.4),-4px_-4px_10px_rgba(255,255,255,0.04)]">
              <c.Icon className="w-9 h-9 text-polished-gold" strokeWidth={1.5} />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1">
            <span className={cn(
              "inline-block font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-polished-gold mb-3",
              isAr && "tracking-[0.05em]"
            )}>
              {isAr ? c.eyebrowAr : c.eyebrowEn}
            </span>
            <h3 className={cn(
              "font-display text-2xl md:text-3xl font-bold text-white mb-3 leading-tight",
              isAr && "font-arabic"
            )}>
              {isAr ? c.headlineAr : c.headlineEn}
            </h3>
            <p className={cn(
              "font-body text-sm md:text-base text-white/55 max-w-lg leading-relaxed",
              isAr && "font-arabic leading-[1.8]"
            )}>
              {isAr ? c.subAr : c.subEn}
            </p>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0">
            <Link
              to={c.href}
              className={cn(
                "group inline-flex items-center gap-3 px-8 py-4 rounded-xl cursor-pointer",
                "bg-polished-gold text-white font-body text-xs font-semibold uppercase tracking-[0.2em]",
                "transition-all duration-200",
                "shadow-[6px_6px_14px_rgba(197,160,40,0.35),-4px_-4px_10px_rgba(255,255,255,0.06)]",
                "hover:shadow-[8px_8px_18px_rgba(197,160,40,0.4),-6px_-6px_14px_rgba(255,255,255,0.08)]",
                "hover:-translate-y-1",
                "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]",
                "active:translate-y-0",
                isAr && "flex-row-reverse tracking-[0.05em]"
              )}
            >
              {isAr ? c.ctaAr : c.ctaEn}
              <ArrowRight className={cn("w-4 h-4 transition-transform duration-200 group-hover:translate-x-1", isAr && "rotate-180 group-hover:-translate-x-1")} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
