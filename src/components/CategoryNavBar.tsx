import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const NAV_CATEGORIES = [
  { nameEn: "Skin Care", nameAr: "العناية بالبشرة", href: "/collections/skin-care" },
  { nameEn: "Hair Care", nameAr: "العناية بالشعر", href: "/collections/hair-care" },
  { nameEn: "Make Up", nameAr: "المكياج", href: "/collections/make-up" },
  { nameEn: "Body Care", nameAr: "العناية بالجسم", href: "/collections/body-care" },
  { nameEn: "Fragrances", nameAr: "العطور", href: "/collections/fragrances" },
  { nameEn: "Tools & Devices", nameAr: "الأدوات والأجهزة", href: "/collections/tools-devices" },
  { nameEn: "Best Sellers", nameAr: "الأكثر مبيعاً", href: "/best-sellers" },
  { nameEn: "Offers", nameAr: "العروض", href: "/offers" },
];

export const CategoryNavBar = () => {
  const { language, isRTL } = useLanguage();
  const location = useLocation();

  return (
    <nav
      className="w-full bg-[#F8F8FF] border-b border-[#C5A028]/20 hidden md:block"
      aria-label={language === "ar" ? "تنقل الفئات" : "Category navigation"}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
          {NAV_CATEGORIES.map((cat) => {
            const isActive = location.pathname === cat.href;
            return (
              <Link
                key={cat.href}
                to={cat.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-all duration-200 border-b-2",
                  isActive
                    ? "border-[#C5A028] text-[#C5A028]"
                    : "border-transparent text-burgundy/70 hover:text-burgundy hover:border-[#C5A028]/50"
                )}
              >
                {language === "ar" ? cat.nameAr : cat.nameEn}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
