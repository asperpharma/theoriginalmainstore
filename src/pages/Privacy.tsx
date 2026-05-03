import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Privacy() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  usePageMeta({
    title: isAr
      ? "سياسة الخصوصية | أسبر بيوتي شوب"
      : "Privacy Policy | Asper Beauty Shop",
    description: isAr
      ? "تعرف على كيفية جمع بياناتك واستخدامها وحمايتها في متجر أسبر بيوتي شوب"
      : "Learn how Asper Beauty Shop collects, uses, and protects your personal data.",
    canonical: "/privacy",
  });

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8">
          {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {isAr ? "آخر تحديث: أبريل 2026" : "Last updated: April 2026"}
        </p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="font-display text-xl font-semibold mb-3">
              {isAr ? "١. المعلومات التي نجمعها" : "1. Information We Collect"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isAr
                ? "عند إتمام طلب شراء، نجمع: الاسم الكامل، رقم الهاتف، عنوان التوصيل، المدينة، والمنطقة. البريد الإلكتروني اختياري ويُستخدم فقط للتواصل بشأن الطلب."
                : "When placing an order, we collect: full name, phone number, delivery address, city, and area. Email is optional and used only for order-related communication."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">
              {isAr ? "٢. كيف نستخدم بياناتك" : "2. How We Use Your Data"}
            </h2>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
              {isAr ? (
                <>
                  <li>معالجة الطلبات وتنظيم عمليات التوصيل</li>
                  <li>التواصل معك بخصوص حالة طلبك</li>
                  <li>تحسين خدماتنا وتجربة التسوق</li>
                  <li>الامتثال للمتطلبات القانونية</li>
                </>
              ) : (
                <>
                  <li>Processing orders and coordinating delivery</li>
                  <li>Communicating with you about your order status</li>
                  <li>Improving our services and shopping experience</li>
                  <li>Complying with legal requirements</li>
                </>
              )}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">
              {isAr ? "٣. مشاركة البيانات" : "3. Data Sharing"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isAr
                ? "لا نبيع بياناتك الشخصية لأي طرف ثالث. قد نشارك معلومات التوصيل مع سائقي التوصيل المعيّنين لإتمام طلبك فقط."
                : "We do not sell your personal data to third parties. We may share delivery information with assigned delivery drivers solely to fulfill your order."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">
              {isAr ? "٤. الاحتفاظ بالبيانات" : "4. Data Retention"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isAr
                ? "نحتفظ ببيانات الطلبات لمدة ٣ سنوات لأغراض المحاسبة والدعم. يمكنك طلب حذف بياناتك بالتواصل معنا عبر صفحة الاتصال."
                : "We retain order data for 3 years for accounting and support purposes. You may request deletion of your data by contacting us through the contact page."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">
              {isAr ? "٥. الأمان" : "5. Security"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isAr
                ? "تُخزَّن جميع البيانات بشكل مشفر على خوادم Supabase الموثوقة. نستخدم بروتوكول HTTPS لجميع الاتصالات."
                : "All data is encrypted at rest and stored on Supabase's secure infrastructure. We use HTTPS for all communications."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">
              {isAr ? "٦. ملفات تعريف الارتباط (Cookies)" : "6. Cookies"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isAr
                ? "نستخدم ملفات تعريف الارتباط الضرورية لإدارة جلسات التسوق وسلة المشتريات. لا نستخدم ملفات تتبع الطرف الثالث."
                : "We use essential cookies to manage shopping sessions and the cart. We do not use third-party tracking cookies."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">
              {isAr ? "٧. تواصل معنا" : "7. Contact Us"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isAr
                ? "لأي استفسارات تتعلق بالخصوصية، تواصل معنا عبر صفحة "
                : "For any privacy inquiries, contact us via the "}
              <a href="/contact" className="text-primary underline">
                {isAr ? "الاتصال" : "contact page"}
              </a>
              {isAr ? "." : "."}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
