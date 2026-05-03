import { ShieldCheck, Award, FlaskConical, Leaf } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const badges = [
  { icon: ShieldCheck, en: "JFDA CERTIFIED",            ar: "معتمد من هيئة الغذاء والدواء" },
  { icon: Award,       en: "100% AUTHENTIC GUARANTEED", ar: "أصالة مضمونة 100%" },
  { icon: FlaskConical,en: "PHARMACIST VETTED",         ar: "مُدقَّق صيدلانياً" },
  { icon: Leaf,        en: "CRUELTY-FREE",              ar: "خالٍ من التجارب على الحيوانات" },
];

const ClinicalProof = () => {
  const { language, isRTL } = useLanguage();
  const isAr = language === "ar";

  return (
    <section className="py-10 sm:py-12 bg-asper-stone border-t border-rose-clay-light/30" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:flex md:items-center md:justify-between gap-8 md:gap-12">
          {badges.map((badge) => (
            <div key={badge.en} className="flex items-center gap-3 justify-center md:justify-start">
              <badge.icon className="h-5 w-5 text-polished-gold shrink-0" strokeWidth={1.6} />
              <span className="font-body text-[11px] sm:text-xs tracking-[0.15em] uppercase text-asper-ink font-medium">
                {isAr ? badge.ar : badge.en}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClinicalProof;

