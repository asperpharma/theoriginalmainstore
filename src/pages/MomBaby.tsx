import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import MomBabyHero from "@/components/mom-baby/MomBabyHero";
import LifecycleNav from "@/components/mom-baby/LifecycleNav";
import ConcernFilters from "@/components/mom-baby/ConcernFilters";
import LifecycleSection from "@/components/mom-baby/LifecycleSection";
import BeautyAdvisors from "@/components/mom-baby/BeautyAdvisors";
import MomBabyBrands from "@/components/mom-baby/MomBabyBrands";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";

export type LifecyclePhase = "all" | "before-birth" | "after-birth" | "first-years" | "essentials";

export default function MomBaby() {
  const [activePhase, setActivePhase] = useState<LifecyclePhase>("all");
  const [activeConcern, setActiveConcern] = useState<string | null>(null);
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  usePageMeta({
    title: isAr ? "الأم والطفل | أسبر بيوتي شوب" : "Mom & Baby | Asper Beauty Shop",
    description: isAr
      ? "منتجات العناية بالأم والطفل من أبرز العلامات الطبية المختارة بعناية من قِبل الصيادلة."
      : "Pharmacist-curated mom & baby skincare from trusted clinical brands. Safe for pregnancy, newborns, and growing children.",
    canonical: "/mom-baby",
  });

  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <Header />
      <main className="pt-16">
        <MomBabyHero />
        <LifecycleNav activePhase={activePhase} onPhaseChange={setActivePhase} />
        <ConcernFilters activeConcern={activeConcern} onConcernChange={setActiveConcern} />
        <LifecycleSection activePhase={activePhase} activeConcern={activeConcern} />
        <BeautyAdvisors />
        <MomBabyBrands />
      </main>
      <Footer />
    </div>
  );
}
