import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Sparkles, Crown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const services = [
  {
    icon: Truck,
    titleEn: "Amman Concierge Delivery",
    titleAr: "توصيل كونسيرج في عمّان",
    descEn: "Same-day, temperature-controlled delivery across Amman. Your regimen arrives in pristine clinical condition — cold-chain sealed from our pharmacy to your doorstep.",
    descAr: "توصيل في نفس اليوم بتحكم في درجة الحرارة عبر عمّان. يصل روتينك بحالة سريرية مثالية — مغلق بالسلسلة الباردة من صيدليتنا إلى بابك.",
    badgeEn: "FREE OVER 50 JOD",
    badgeAr: "مجاني فوق 50 دينار",
  },
  {
    icon: Sparkles,
    titleEn: "AI Beauty Advisor",
    titleAr: "مستشارة الجمال بالذكاء الاصطناعي",
    descEn: "Upload a photo and receive a pharmacist-grade skin assessment powered by Gemini Vision. Personalized routines crafted by our dual-persona AI — Dr. Sami for clinical needs, Ms. Zain for beauty goals.",
    descAr: "ارفع صورة واحصل على تقييم صيدلاني لبشرتك بتقنية Gemini Vision. روتينات مخصصة من ذكائنا الاصطناعي المزدوج — د. سامي للاحتياجات السريرية، وآنسة زين لأهداف الجمال.",
    badgeEn: "AI-POWERED",
    badgeAr: "مدعوم بالذكاء الاصطناعي",
  },
  {
    icon: Crown,
    titleEn: "The Elite Subscription",
    titleAr: "الاشتراك النخبوي",
    descEn: "Never run out of your routine. Our Smart Shelf tracks your usage and sends a gentle reminder before you're due — ensuring uninterrupted clinical care with exclusive VIP pricing.",
    descAr: "لا تنفد منتجاتك أبداً. رفّنا الذكي يتتبع استخدامك ويرسل تذكيراً لطيفاً قبل انتهائها — لضمان رعاية سريرية متواصلة بأسعار VIP حصرية.",
    badgeEn: "VIP PERKS",
    badgeAr: "مزايا VIP",
  },
];

const VIPConcierge = () => {
  const { language, isRTL } = useLanguage();
  const isAr = language === "ar";

  return (
    <section
      className="py-16 sm:py-20"
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(60 100% 97%) 100%)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4 border-accent text-accent font-body text-xs tracking-[0.2em] px-4 py-1.5">
            <Crown className="h-3 w-3 me-1.5 inline" />
            {isAr ? "خدمات الكونسيرج VIP" : "VIP CONCIERGE SERVICES"}
          </Badge>
          <h2 className="font-arabic text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            {isAr ? <>الفخامة <span className="text-primary">تأتي إليك</span></> : <>Luxury That <span className="text-primary">Comes to You</span></>}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto font-body">
            {isAr
              ? "خدمات متميزة لمن يتوقعون دقة صيدلانية مع راحة فندقية خمس نجوم."
              : "Premium services designed for those who expect pharmacy-grade precision with five-star convenience."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {services.map((service, i) => (
            <Card key={i} className="group bg-white border-border/40 hover:border-accent/40 transition-all duration-400 ease-luxury shadow-md hover:shadow-xl overflow-hidden">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/15 transition-colors duration-400">
                  <service.icon className="h-6 w-6 text-accent" />
                </div>
                <Badge variant="secondary" className="w-fit mb-4 text-[10px] tracking-[0.15em] font-body">
                  {isAr ? service.badgeAr : service.badgeEn}
                </Badge>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">{isAr ? service.titleAr : service.titleEn}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed flex-1">{isAr ? service.descAr : service.descEn}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/intelligence">
            <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white font-body tracking-wider group">
              {isAr ? "اختبر خدمة الكونسيرج" : "Experience the Concierge"}
              <ArrowRight className="h-4 w-4 ms-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default VIPConcierge;

