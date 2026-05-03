import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";

const sections = {
  en: [
    {
      title: "Information We Collect",
      body: "We collect information you provide directly to us, such as your name, email address, shipping address, and payment information when you place an order. We also automatically collect certain information when you visit our website, including your IP address, browser type, and pages viewed.",
    },
    {
      title: "How We Use Your Information",
      body: "We use the information we collect to process your orders, communicate with you about your purchases, send you marketing communications (with your consent), improve our services, and comply with our legal obligations.",
    },
    {
      title: "Sharing Your Information",
      body: "We do not sell your personal information. We may share your information with trusted service providers who assist us in operating our website and processing orders (e.g., payment processors, shipping carriers). These providers are contractually obligated to keep your information confidential.",
    },
    {
      title: "Data Security",
      body: "We implement industry-standard security measures to protect your personal information from unauthorised access, disclosure, alteration, or destruction. All payment data is processed through secure, PCI-compliant channels.",
    },
    {
      title: "Cookies",
      body: "We use cookies and similar tracking technologies to enhance your browsing experience, analyse site traffic, and personalise content. You can control cookies through your browser settings, though disabling them may affect some site functionality.",
    },
    {
      title: "Your Rights",
      body: "You have the right to access, correct, or delete your personal data. You may also withdraw consent for marketing communications at any time. To exercise these rights, please contact us at asperpharma@gmail.com.",
    },
    {
      title: "Changes to This Policy",
      body: "We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page with a revised effective date.",
    },
  ],
  ar: [
    {
      title: "المعلومات التي نجمعها",
      body: "نجمع المعلومات التي تقدمها لنا مباشرةً، مثل اسمك وعنوان بريدك الإلكتروني وعنوان الشحن ومعلومات الدفع عند إتمام طلبك. كما نجمع تلقائياً بعض المعلومات عند زيارتك لموقعنا، بما في ذلك عنوان IP ونوع المتصفح والصفحات التي تزورها.",
    },
    {
      title: "كيف نستخدم معلوماتك",
      body: "نستخدم المعلومات التي نجمعها لمعالجة طلباتك، والتواصل معك بشأن مشترياتك، وإرسال الاتصالات التسويقية (بموافقتك)، وتحسين خدماتنا، والامتثال لالتزاماتنا القانونية.",
    },
    {
      title: "مشاركة معلوماتك",
      body: "لا نبيع معلوماتك الشخصية. قد نشارك معلوماتك مع مزودي خدمات موثوقين يساعدوننا في تشغيل موقعنا ومعالجة الطلبات (مثل معالجي الدفع وشركات الشحن). هؤلاء الموفرون ملزمون تعاقدياً بالحفاظ على سرية معلوماتك.",
    },
    {
      title: "أمان البيانات",
      body: "نطبق تدابير أمنية على مستوى الصناعة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو الإفصاح أو التعديل أو الإتلاف. تُعالج جميع بيانات الدفع عبر قنوات آمنة ومتوافقة مع معيار PCI.",
    },
    {
      title: "ملفات تعريف الارتباط",
      body: "نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتحسين تجربة التصفح لديك، وتحليل حركة الموقع، وتخصيص المحتوى. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك، وإن كان تعطيلها قد يؤثر على بعض وظائف الموقع.",
    },
    {
      title: "حقوقك",
      body: "لديك الحق في الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها. كما يمكنك سحب موافقتك على الاتصالات التسويقية في أي وقت. لممارسة هذه الحقوق، يرجى التواصل معنا على asperpharma@gmail.com.",
    },
    {
      title: "التغييرات على هذه السياسة",
      body: "قد نحدّث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بالتغييرات الجوهرية بنشر السياسة المحدّثة على هذه الصفحة مع تاريخ سريان مُعدَّل.",
    },
  ],
};

export default function PrivacyPolicy() {
  const { language, isRTL } = useLanguage();
  const isAr = language === "ar";

  usePageMeta({
    title: isAr ? "سياسة الخصوصية — آسبر بيوتي" : "Privacy Policy — Asper Beauty",
    description: isAr
      ? "تعرف على كيفية جمع آسبر بيوتي لمعلوماتك واستخدامها وحمايتها."
      : "Learn how Asper Beauty collects, uses, and protects your information.",
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
              {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {isAr ? "آخر تحديث: أبريل 2026" : "Last updated: April 2026"}
            </p>
            <div className="w-16 h-px bg-gold/60 mx-auto mt-6" />
          </header>

          {/* Intro paragraph */}
          <p className="font-body text-base md:text-lg text-foreground leading-relaxed mb-12">
            {isAr
              ? "في آسبر بيوتي، نلتزم بحماية خصوصيتك. توضح هذه السياسة كيفية جمعنا لمعلوماتك الشخصية واستخدامها وحمايتها عند استخدامك لموقعنا الإلكتروني أو خدماتنا."
              : "At Asper Beauty, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our website or services."}
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
                ? "هل لديك أسئلة؟ تواصل معنا على "
                : "Questions? Reach us at "}
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
