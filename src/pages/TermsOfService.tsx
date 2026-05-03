import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";

const sections = {
  en: [
    {
      title: "Acceptance of Terms",
      body: "By accessing or using the Asper Beauty website (www.asperbeautyshop.com), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.",
    },
    {
      title: "Products and Pricing",
      body: "All prices displayed on our website are in Jordanian Dinars (JOD) and are subject to change without notice. We reserve the right to modify or discontinue any product at any time. Product descriptions and images are provided for informational purposes; actual products may vary slightly.",
    },
    {
      title: "Orders and Payment",
      body: "By placing an order, you represent that you are of legal age and that the information you provide is accurate and complete. We accept cash on delivery (COD) and other payment methods as displayed at checkout. We reserve the right to refuse or cancel any order at our discretion.",
    },
    {
      title: "Shipping and Delivery",
      body: "We ship within Jordan. Delivery times are estimates and not guaranteed. Risk of loss for items purchased passes to you upon delivery. We are not responsible for delays caused by external factors such as weather or customs procedures.",
    },
    {
      title: "Returns and Refunds",
      body: "We accept returns of unopened, unused products in their original packaging within 7 days of delivery. To initiate a return, please contact us at asperpharma@gmail.com. Refunds will be processed within 5–7 business days after we receive the returned item.",
    },
    {
      title: "Intellectual Property",
      body: "All content on this website, including text, images, logos, and graphics, is the property of Asper Beauty and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use any content without our prior written permission.",
    },
    {
      title: "Limitation of Liability",
      body: "Asper Beauty shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products. Our total liability for any claim shall not exceed the amount you paid for the relevant product.",
    },
    {
      title: "Governing Law",
      body: "These Terms of Service are governed by the laws of the Hashemite Kingdom of Jordan. Any disputes arising from these terms shall be resolved in the competent courts of Amman, Jordan.",
    },
    {
      title: "Changes to Terms",
      body: "We reserve the right to update these Terms of Service at any time. Continued use of our website after changes are posted constitutes your acceptance of the revised terms.",
    },
  ],
  ar: [
    {
      title: "قبول الشروط",
      body: "بالدخول إلى موقع آسبر بيوتي (www.asperbeautyshop.com) أو استخدامه، فإنك توافق على الالتزام بشروط الخدمة هذه وجميع القوانين واللوائح المعمول بها. إذا لم توافق على أي من هذه الشروط، فيحظر عليك استخدام هذا الموقع.",
    },
    {
      title: "المنتجات والأسعار",
      body: "جميع الأسعار المعروضة على موقعنا بالدينار الأردني (JOD) وهي عرضة للتغيير دون إشعار مسبق. نحتفظ بالحق في تعديل أي منتج أو إيقافه في أي وقت. تُقدَّم أوصاف المنتجات وصورها لأغراض إعلامية فقط، وقد تختلف المنتجات الفعلية قليلاً.",
    },
    {
      title: "الطلبات والدفع",
      body: "بتقديم طلبك، فإنك تُقرّ بأنك بلغت السن القانونية وأن المعلومات التي تقدمها دقيقة وكاملة. نقبل الدفع عند الاستلام (COD) وطرق الدفع الأخرى المعروضة عند إتمام الشراء. نحتفظ بالحق في رفض أي طلب أو إلغائه وفق تقديرنا.",
    },
    {
      title: "الشحن والتسليم",
      body: "نشحن داخل الأردن. مواعيد التسليم تقديرية وغير مضمونة. تنتقل مخاطر الفقدان عليك عند التسليم. لسنا مسؤولين عن التأخيرات الناجمة عن عوامل خارجية كالأحوال الجوية أو إجراءات الجمارك.",
    },
    {
      title: "الإرجاع والمبالغ المستردة",
      body: "نقبل إرجاع المنتجات غير المفتوحة وغير المستخدمة في عبوتها الأصلية خلال 7 أيام من التسليم. لبدء عملية الإرجاع، يرجى التواصل معنا على asperpharma@gmail.com. تُعالج المبالغ المستردة في غضون 5–7 أيام عمل بعد استلام المنتج المُعاد.",
    },
    {
      title: "الملكية الفكرية",
      body: "جميع المحتويات على هذا الموقع، بما في ذلك النصوص والصور والشعارات والرسومات، هي ملك لآسبر بيوتي وتحميها قوانين الملكية الفكرية المعمول بها. لا يجوز لك إعادة إنتاج أي محتوى أو توزيعه أو استخدامه دون إذن كتابي مسبق منا.",
    },
    {
      title: "تحديد المسؤولية",
      body: "لا تتحمل آسبر بيوتي المسؤولية عن أي أضرار غير مباشرة أو عرضية أو تبعية ناجمة عن استخدامك لموقعنا أو منتجاتنا. لا تتجاوز مسؤوليتنا الإجمالية عن أي مطالبة المبلغ الذي دفعته مقابل المنتج ذي الصلة.",
    },
    {
      title: "القانون الحاكم",
      body: "تخضع شروط الخدمة هذه لقوانين المملكة الأردنية الهاشمية. تُحال أي نزاعات ناشئة عن هذه الشروط إلى المحاكم المختصة في عمّان، الأردن.",
    },
    {
      title: "التغييرات على الشروط",
      body: "نحتفظ بالحق في تحديث شروط الخدمة هذه في أي وقت. استمرار استخدامك لموقعنا بعد نشر التغييرات يُعدّ قبولاً منك للشروط المُعدَّلة.",
    },
  ],
};

export default function TermsOfService() {
  const { language, isRTL } = useLanguage();
  const isAr = language === "ar";

  usePageMeta({
    title: isAr ? "الشروط والأحكام — آسبر بيوتي" : "Terms of Service — Asper Beauty",
    description: isAr
      ? "اقرأ شروط وأحكام استخدام موقع آسبر بيوتي وخدماتنا."
      : "Read the terms and conditions for using the Asper Beauty website and services.",
  });

  const content = sections[isAr ? "ar" : "en"];

  return (
    <div className="min-h-screen bg-cream" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="pt-36 pb-24">
        <article className="max-w-3xl mx-auto px-6 md:px-8">
          {/* Page header */}
          <header className="text-center mb-16">
            <span className="font-script text-xl text-gold mb-3 block">
              {isAr ? "آسبر بيوتي" : "Asper Beauty"}
            </span>
            <h1 className="font-display text-4xl md:text-5xl text-burgundy mb-4">
              {isAr ? "الشروط والأحكام" : "Terms of Service"}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {isAr ? "آخر تحديث: أبريل 2026" : "Last updated: April 2026"}
            </p>
            <div className="w-16 h-px bg-gold/60 mx-auto mt-6" />
          </header>

          {/* Intro paragraph */}
          <p className="font-body text-base md:text-lg text-foreground leading-relaxed mb-12">
            {isAr
              ? "يُرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام موقع آسبر بيوتي أو تقديم أي طلب شراء. يُمثّل استخدامك للموقع موافقتك على الالتزام بهذه الشروط."
              : "Please read these Terms of Service carefully before using the Asper Beauty website or placing any order. Your use of the site constitutes your agreement to be bound by these terms."}
          </p>

          {/* Sections */}
          <div className="space-y-10">
            {content.map((section, i) => (
              <section key={i}>
                <h2 className="font-display text-xl md:text-2xl text-burgundy mb-3">
                  {section.title}
                </h2>
                <p className="font-body text-base text-foreground leading-relaxed">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          {/* Contact footer */}
          <div className="mt-16 pt-8 border-t border-gold/30 text-center">
            <p className="font-body text-sm text-muted-foreground">
              {isAr
                ? "للاستفسارات، تواصل معنا على "
                : "For enquiries, contact us at "}
              <a
                href="mailto:asperpharma@gmail.com"
                className="text-gold hover:underline"
              >
                asperpharma@gmail.com
              </a>
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
