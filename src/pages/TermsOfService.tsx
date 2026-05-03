import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsOfService() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  usePageMeta({
    title: isAr
      ? "الشروط والأحكام | أسبر بيوتي شوب"
      : "Terms of Service | Asper Beauty Shop",
    description: isAr
      ? "اقرأ شروط وأحكام الاستخدام والشراء في متجر أسبر بيوتي شوب"
      : "Read the terms and conditions for using and purchasing at Asper Beauty Shop.",
    canonical: "/terms",
  });

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8">
          {isAr ? "الشروط والأحكام" : "Terms of Service"}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {isAr ? "آخر تحديث: أبريل 2026" : "Last updated: April 2026"}
        </p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="font-display text-xl font-semibold mb-3">
              {isAr ? "١. القبول بالشروط" : "1. Acceptance of Terms"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isAr
                ? "باستخدامك موقع أسبر بيوتي شوب وإتمام أي عملية شراء، فإنك توافق على الالتزام بهذه الشروط والأحكام."
                : "By using Asper Beauty Shop and completing any purchase, you agree to be bound by these terms and conditions."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">
              {isAr ? "٢. الطلبات والدفع" : "2. Orders & Payment"}
            </h2>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
              {isAr ? (
                <>
                  <li>جميع الطلبات تخضع للتوفر في المخزون</li>
                  <li>الدفع عند الاستلام (COD) متاح في جميع أنحاء الأردن</li>
                  <li>يجب أن يكون المبلغ بالدينار الأردني (JOD)</li>
                  <li>نحتفظ بحق إلغاء الطلب في حال عدم التوفر</li>
                </>
              ) : (
                <>
                  <li>All orders are subject to stock availability</li>
                  <li>Cash on Delivery (COD) is available across Jordan</li>
                  <li>All prices are in Jordanian Dinar (JOD)</li>
                  <li>We reserve the right to cancel orders in case of unavailability</li>
                </>
              )}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">
              {isAr ? "٣. الشحن والتوصيل" : "3. Shipping & Delivery"}
            </h2>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
              {isAr ? (
                <>
                  <li>رسوم الشحن: ٣ دينار للطلبات داخل عمّان، ٥ دينار للمحافظات</li>
                  <li>شحن مجاني للطلبات التي تتجاوز ٥٠ دينار</li>
                  <li>التوصيل خلال ١–٣ أيام عمل</li>
                  <li>توصيل في نفس اليوم متاح في عمّان (حسب التوفر)</li>
                </>
              ) : (
                <>
                  <li>Shipping: 3 JOD within Amman, 5 JOD to governorates</li>
                  <li>Free shipping on orders over 50 JOD</li>
                  <li>Delivery within 1–3 business days</li>
                  <li>Same-day delivery available in Amman (subject to availability)</li>
                </>
              )}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">
              {isAr ? "٤. الإرجاع والاستبدال" : "4. Returns & Exchanges"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isAr
                ? "يمكن إرجاع المنتجات خلال ٧ أيام من تاريخ الاستلام شرط أن تكون في حالتها الأصلية وغير مستخدمة. المنتجات التجميلية المفتوحة غير قابلة للإرجاع لأسباب صحية. للبدء بعملية الإرجاع، تواصل معنا عبر صفحة الاتصال."
                : "Products may be returned within 7 days of receipt provided they are in original, unused condition. Opened cosmetic products are non-returnable for hygiene reasons. To initiate a return, contact us via the contact page."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">
              {isAr ? "٥. المنتجات والأسعار" : "5. Products & Pricing"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isAr
                ? "نسعى للحفاظ على دقة معلومات المنتجات والأسعار. في حال وجود خطأ في السعر، سنتواصل معك قبل الشحن. الصور المعروضة قد تختلف قليلاً عن المنتج الفعلي."
                : "We strive to maintain accurate product information and pricing. In case of a pricing error, we will contact you before shipping. Product images may slightly differ from the actual product."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">
              {isAr ? "٦. الاستخدام المقبول" : "6. Acceptable Use"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isAr
                ? "يُحظر استخدام الموقع لأي أغراض غير مشروعة أو لإرسال طلبات وهمية. نحتفظ بحق حظر المستخدمين الذين ينتهكون هذه الشروط."
                : "Use of this site for unlawful purposes or placing fraudulent orders is prohibited. We reserve the right to block users who violate these terms."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">
              {isAr ? "٧. تواصل معنا" : "7. Contact Us"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isAr
                ? "لأي استفسارات، تواصل معنا عبر صفحة "
                : "For any questions, contact us via the "}
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
