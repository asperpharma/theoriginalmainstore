import { Link, useLocation } from "react-router-dom";
import { Home, Search, MessageCircle, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useLanguage } from "@/contexts/LanguageContext";

const navItems = [
  { icon: Home, labelEn: "Home", labelAr: "الرئيسية", path: "/" },
  { icon: Search, labelEn: "Shop", labelAr: "المتجر", path: "/shop" },
  { icon: MessageCircle, labelEn: "Ezabila", labelAr: "إزابيلا", path: "#concierge", isConcierge: true },
  { icon: ShoppingBag, labelEn: "Cart", labelAr: "السلة", path: "#cart", isCart: true },
  { icon: User, labelEn: "Profile", labelAr: "حسابي", path: "/auth" },
];

interface Props {
  onOpenConcierge: () => void;
  onOpenCart: () => void;
}

export default function MobileBottomNav({ onOpenConcierge, onOpenCart }: Props) {
  const location = useLocation();
  const cartCount = useCartStore((s) => s.items.reduce((t, i) => t + i.quantity, 0));
  const { language } = useLanguage();
  const isArabic = language === "ar";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md shadow-[0_-2px_10px_-2px_hsl(var(--foreground)/0.06)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const label = isArabic ? item.labelAr : item.labelEn;
          const isActive =
            !item.isConcierge && !item.isCart && (
            location.pathname === item.path ||
            (item.path === "/shop" && (location.pathname === "/products" || location.pathname.startsWith("/shop")))
          );

          if (item.isConcierge) {
            return (
              <button
                key={item.labelEn}
                onClick={onOpenConcierge}
                className="relative flex flex-col items-center justify-center -mt-5"
                aria-label={isArabic ? "فتح المساعد الذكي" : "Open AI Concierge"}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg concierge-badge">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-body font-medium text-primary mt-1">
                  {label}
                </span>
              </button>
            );
          }

          if (item.isCart) {
            return (
              <button
                key={item.labelEn}
                onClick={onOpenCart}
                className="relative flex flex-col items-center justify-center gap-0.5 py-2"
                aria-label={isArabic ? "فتح السلة" : "Open Cart"}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground text-[9px] font-bold">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-body text-muted-foreground">
                  {label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.labelEn}
              to={item.path}
              className="flex flex-col items-center justify-center gap-0.5 py-2"
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-body transition-colors",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
