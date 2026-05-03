import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  IconAcne,
  IconHydration,
  IconAntiAging,
  IconSensitivity,
  IconPigmentation,
  IconRedness,
  IconSunProtection,
} from "@/components/brand/ClinicalIcons";

const concerns = [
  { en: "Acne", ar: "حب الشباب", Icon: IconAcne, query: "acne" },
  { en: "Hydration", ar: "الترطيب", Icon: IconHydration, query: "hydration" },
  { en: "Anti-Aging", ar: "مكافحة الشيخوخة", Icon: IconAntiAging, query: "aging" },
  { en: "Sensitivity", ar: "الحساسية", Icon: IconSensitivity, query: "sensitivity" },
  { en: "Pigmentation", ar: "تصبغات البشرة", Icon: IconPigmentation, query: "pigmentation" },
  { en: "Redness", ar: "الاحمرار", Icon: IconRedness, query: "redness" },
  { en: "Sun Protection", ar: "الحماية من الشمس", Icon: IconSunProtection, query: "SPF sunscreen" },
];

export default function ShopByConcern() {
  const { language, isRTL } = useLanguage();
  const isArabic = language === "ar";

  return (
    <section className="py-20 sm:py-28 bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <Badge
            variant="outline"
            className="mb-4 border-accent text-accent font-body text-xs tracking-[0.2em] px-4 py-1.5"
          >
            {isArabic ? "اكتشاف موجَّه" : "GUIDED DISCOVERY"}
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            {isArabic
              ? <span>تسوقي حسب <span className="text-primary">المشكلة</span></span>
              : <>Shop by <span className="text-primary">Concern</span></>
            }
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto font-body">
            {isArabic
              ? "أخبرينا ما يزعجك — سنريك ما يصلح."
              : "Tell us what bothers you — we'll show you what works."}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {concerns.map((c, i) => (
            <motion.div
              key={c.en}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Link
                to={`/products?q=${encodeURIComponent(c.query)}`}
                className="group flex flex-col items-center gap-3 p-6 rounded-lg border border-border bg-card hover:border-accent/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <c.Icon
                    size={26}
                    className="text-primary group-hover:text-accent transition-colors duration-300"
                  />
                </div>
                <span className="font-body text-sm font-medium text-foreground text-center">
                  {isArabic ? c.ar : c.en}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
