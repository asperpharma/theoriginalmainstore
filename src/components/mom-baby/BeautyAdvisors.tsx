import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Calendar, BadgePercent, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface AdvisorAvailability {
  en: string;
  ar: string;
}

interface AdvisorSpecialty {
  en: string;
  ar: string;
}

interface Advisor {
  name: string;
  nameAr: string;
  specialty: AdvisorSpecialty;
  discount: number;
  experience: string;
  availability: AdvisorAvailability;
  initial: string;
}

const advisors: Advisor[] = [
  {
    name: "Dr. Lina",
    nameAr: "د. لينا",
    specialty: { en: "Dermocosmetics", ar: "مستحضرات التجميل الطبية" },
    discount: 25,
    experience: "8+ yrs",
    availability: { en: "Thursday", ar: "الخميس" },
    initial: "L",
  },
  {
    name: "Rawan",
    nameAr: "روان",
    specialty: { en: "Clinical Supplementation", ar: "المكملات السريرية" },
    discount: 20,
    experience: "5+ yrs",
    availability: { en: "Tuesday", ar: "الثلاثاء" },
    initial: "R",
  },
  {
    name: "Sarah",
    nameAr: "سارة",
    specialty: { en: "Maternal Wellness", ar: "صحة الأم" },
    discount: 15,
    experience: "6+ yrs",
    availability: { en: "Friday", ar: "الجمعة" },
    initial: "S",
  },
  {
    name: "Nour",
    nameAr: "نور",
    specialty: { en: "Pediatric Skincare", ar: "عناية بشرة الأطفال" },
    discount: 20,
    experience: "10+ yrs",
    availability: { en: "On Demand", ar: "عند الطلب" },
    initial: "N",
  },
];

export default function BeautyAdvisors() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      className="relative py-20 bg-gradient-to-b from-asper-stone/40 via-background to-asper-stone/20 overflow-hidden"
    >
      {/* Ambient background blurs */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-primary/4 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-5 py-2 text-xs font-body uppercase tracking-widest text-accent mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            {isAr ? "استشارة شخصية" : "Personal Consultation"}
          </span>

          <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4 section-header">
            {isAr ? "مستشاراتنا المتخصصات" : "Our Expert Advisors"}
          </h2>

          <p className="font-body text-muted-foreground max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            {isAr
              ? "احجزي موعداً مجانياً مع مستشارتنا المتخصصة واحصلي على خصم حصري على مشترياتك."
              : "Book a free session with our specialist and receive an exclusive discount on your purchases."}
          </p>
        </motion.div>

        {/* Advisor cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advisors.map((advisor, i) => (
            <motion.div
              key={advisor.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="group relative rounded-2xl bg-card p-7 text-center neu-raised border border-border/40 hover:border-accent/25 transition-colors duration-300"
            >
              {/* Gold top accent line */}
              <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

              {/* Avatar */}
              <div className="relative mx-auto mb-5 w-[4.5rem] h-[4.5rem]">
                {/* Outer gold ring */}
                <div className="absolute inset-0 rounded-full border border-accent/30 neu-flat" />
                {/* Inner avatar circle */}
                <div className="absolute inset-1.5 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-heading text-xl font-bold text-primary">
                    {advisor.initial}
                  </span>
                </div>
              </div>

              {/* Name */}
              <h3 className="font-heading text-lg text-foreground mb-0.5">
                {isAr ? advisor.nameAr : advisor.name}
              </h3>

              {/* Specialty */}
              <p className="text-[11px] font-body text-accent uppercase tracking-wider mb-1">
                {isAr ? advisor.specialty.ar : advisor.specialty.en}
              </p>

              {/* Experience */}
              <p className="text-[10px] font-body text-muted-foreground mb-4">
                {advisor.experience}
              </p>

              {/* Gold divider */}
              <div className="gold-accent-line mb-4 opacity-40" />

              {/* Discount badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-body font-semibold mb-3 bg-accent/10 text-accent border border-accent/20">
                <BadgePercent className="w-3.5 h-3.5" />
                -{advisor.discount}% {isAr ? "خصم" : "off"}
              </div>

              {/* Availability */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground mb-5">
                <Calendar className="w-3 h-3 shrink-0" />
                <span>{isAr ? advisor.availability.ar : advisor.availability.en}</span>
              </div>

              {/* CTA */}
              <Button
                size="sm"
                className="w-full luxury-button luxury-button-primary text-xs tracking-wide"
              >
                <Star className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
                {isAr ? "احجزي الآن" : "Book Now"}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
