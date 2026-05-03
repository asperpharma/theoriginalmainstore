import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const LUXURY_EASE = [0.19, 1, 0.22, 1] as const;

export function DrSamiDisclaimer() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  return (
    <motion.aside
      dir={isAr ? "rtl" : "ltr"}
      aria-label={isAr ? "إرشادات الدكتور سامي" : "Dr. Sami Wellness Guidance"}
      className="w-full bg-[#800020]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: LUXURY_EASE }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
        {/* Avatar / label */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full border border-[#C5A028] flex items-center justify-center bg-[#600018]">
            <span className="font-display text-[#C5A028] text-xs select-none">
              Rx
            </span>
          </div>
          <span className="font-body text-[9px] uppercase tracking-[0.3em] text-[#C5A028] font-semibold whitespace-nowrap">
            {isAr ? "د. سامي — الاستشارة العلمية" : "Dr. Sami — Wellness Guidance"}
          </span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-[#C5A028]/40 shrink-0" />

        {/* Disclaimer text */}
        <p
          className={cn(
            "font-body text-[11px] text-white/80 leading-relaxed text-center sm:text-start",
            isAr && "font-arabic text-right"
          )}
        >
          {isAr ? (
            <>
              جميع العروض التجميلية الراقية خضعت للفحص الآمن ضمن نظامك
              الجمالي.{" "}
              <span className="text-white/60">
                ملاحظة: هذا إرشاد عافية، وليس تشخيصاً طبياً.
              </span>
            </>
          ) : (
            <>
              All elite cosmetic offerings are safely vetted for your regimen.{" "}
              <span className="text-white/60">
                Note: This is wellness guidance, not a medical diagnosis.
              </span>
            </>
          )}
        </p>
      </div>
    </motion.aside>
  );
}
