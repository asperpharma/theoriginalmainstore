import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Flower2, Sparkles, Palette, Scissors, Heart, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Category {
  id: string;
  en: string;
  ar: string;
  Icon: LucideIcon;
  href: string;
}

const CATEGORIES: Category[] = [
  {
    id: "perfume",
    en: "Perfume",
    ar: "عطور",
    Icon: Flower2,
    href: "/collections/perfume",
  },
  {
    id: "skincare",
    en: "Skincare",
    ar: "العناية بالبشرة",
    Icon: Sparkles,
    href: "/collections/skincare",
  },
  {
    id: "makeup",
    en: "Makeup",
    ar: "مكياج",
    Icon: Palette,
    href: "/collections/makeup",
  },
  {
    id: "hair",
    en: "Hair",
    ar: "العناية بالشعر",
    Icon: Scissors,
    href: "/collections/hair",
  },
  {
    id: "body",
    en: "Body",
    ar: "العناية بالجسم",
    Icon: Heart,
    href: "/collections/body",
  },
  {
    id: "suncare",
    en: "Sun Care",
    ar: "حماية من الشمس",
    Icon: Sun,
    href: "/collections/suncare",
  },
];

export const ShopByCategory = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  return (
    <section className="py-16 lg:py-20 bg-card relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-polished-gold/30 to-transparent" />

      <div className="luxury-container">
        <AnimatedSection className="text-center mb-12" animation="fade-up">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-polished-gold mb-3 block">
            {isArabic ? "تسوقي حسب الفئة" : "Browse by Category"}
          </span>
          <h2 className="font-display text-2xl lg:text-3xl text-asper-ink">
            {isArabic ? "اكتشفي مجموعاتنا" : "Shop by Category"}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-polished-gold/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-polished-gold/60" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-polished-gold/60" />
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={150}>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 lg:gap-8">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={category.href}
                className="group flex flex-col items-center gap-3 cursor-pointer"
              >
                {/* Neumorphic circle icon */}
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center bg-background border border-gold/15 transition-all duration-250 shadow-[6px_6px_12px_hsl(0_0%_85%/0.5),-6px_-6px_12px_hsl(0_0%_100%/0.8)] group-hover:shadow-[inset_4px_4px_8px_hsl(0_0%_85%/0.4),inset_-4px_-4px_8px_hsl(0_0%_100%/0.7)] group-hover:border-polished-gold/40">
                  <category.Icon className="w-8 h-8 lg:w-10 lg:h-10 text-burgundy group-hover:text-polished-gold transition-colors duration-250" strokeWidth={1.5} />
                </div>
                <span className="font-body text-xs lg:text-sm font-medium text-asper-ink group-hover:text-polished-gold transition-colors duration-250 text-center">
                  {isArabic ? category.ar : category.en}
                </span>
              </Link>
            ))}
          </div>
        </AnimatedSection>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-polished-gold/30 to-transparent" />
    </section>
  );
};

