import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Heart, Sparkles, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const tips = [
  {
    persona: "dr_sami" as const,
    icon: Shield,
    name: "Dr. Sami",
    roleEn: "Clinical Authority",
    roleAr: "مرجع طبي سريري",
    titleEn: "Why Your SPF Needs Reapplication",
    titleAr: "لماذا يحتاج واقي الشمس لإعادة تطبيق؟",
    excerptEn: "Most patients apply SPF once in the morning and assume they're protected all day. UV damage is cumulative — reapply every 2 hours of sun exposure, especially in Amman's high-altitude climate.",
    excerptAr: "معظم الأشخاص يضعون واقي الشمس مرة واحدة صباحاً ويظنون أنهم محميون طوال اليوم. أضرار الأشعة فوق البنفسجية تتراكم — أعد التطبيق كل ساعتين عند التعرض للشمس، خاصةً في مناخ عمّان المرتفع.",
    tagEn: "Weekly Health Tip",
    tagAr: "نصيحة صحية أسبوعية",
    dateEn: "This Week",
    dateAr: "هذا الأسبوع",
  },
  {
    persona: "ms_zain" as const,
    icon: Heart,
    name: "Ms. Zain",
    roleEn: "Beauty Concierge",
    roleAr: "مستشارة الجمال",
    titleEn: "The 60-Second Evening Reset",
    titleAr: "إعادة الضبط المسائي في 60 ثانية",
    excerptEn: "Double cleansing isn't about scrubbing harder — it's about layering intention. Oil-based first to dissolve makeup, then water-based to purify. Your skin will thank you by morning.",
    excerptAr: "التنظيف المزدوج ليس عن الدعك الشديد — بل عن التطبيق الواعي. ابدئي بمنتج زيتي لإذابة المكياج، ثم بمنتج مائي للتنقية العميقة. بشرتك ستشكرك في الصباح.",
    tagEn: "Skincare Routine",
    tagAr: "روتين العناية بالبشرة",
    dateEn: "This Week",
    dateAr: "هذا الأسبوع",
  },
];

export default function ExpertTips() {
  const { language, isRTL } = useLanguage();
  const isAr = language === "ar";

  return (
    <section className="py-24 sm:py-32 bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 border-accent text-accent font-body text-xs tracking-[0.2em] px-4 py-1.5"
          >
            <Sparkles className="h-3 w-3 mr-1.5" />
            {isAr ? "من خبرائنا" : "FROM OUR EXPERTS"}
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            {isAr ? <>رؤى <span className="text-primary">الخبراء</span></> : <>Expert <span className="text-primary">Insights</span></>}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto font-body">
            {isAr ? "نصائح صحية وجمالية مختارة من صيادلة أسبر المتخصصين." : "Pharmacist-curated wellness advice from the minds behind Asper."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tips.map((tip, i) => (
            <Card
              key={i}
              className={`group border transition-all duration-300 hover:shadow-lg overflow-hidden ${
                tip.persona === "dr_sami"
                  ? "border-primary/20 hover:border-primary/40"
                  : "border-accent/20 hover:border-accent/40"
              }`}
            >
              <div className={`h-1 ${tip.persona === "dr_sami" ? "bg-primary" : "bg-gradient-to-r from-accent to-gold-light"}`} />
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tip.persona === "dr_sami" ? "bg-primary/10" : "bg-accent/10"}`}>
                      <tip.icon className={`h-5 w-5 ${tip.persona === "dr_sami" ? "text-primary" : "text-accent"}`} />
                    </div>
                    <div>
                      <p className="font-heading text-sm font-semibold text-foreground">{tip.name}</p>
                      <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
                        {isAr ? tip.roleAr : tip.roleEn}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {isAr ? tip.tagAr : tip.tagEn}
                  </Badge>
                </div>

                <h3 className="font-heading text-lg font-semibold text-foreground leading-snug">
                  {isAr ? tip.titleAr : tip.titleEn}
                </h3>

                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {isAr ? tip.excerptAr : tip.excerptEn}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {isAr ? tip.dateAr : tip.dateEn}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
