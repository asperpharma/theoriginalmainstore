import { useState, useRef } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ChevronDown, CreditCard, Banknote, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartStore } from "@/stores/cartStore";
import AsperLogo from "@/components/brand/AsperLogo";
import { cn } from "@/lib/utils";
import { normalizePrice } from "@/lib/shopify";
import { playSuccessSound } from "@/lib/sounds";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";

/* ─── Jordanian Location Data ─── */
const CITIES = [
  { value: "amman",  en: "Amman",  ar: "عمّان" },
  { value: "zarqa",  en: "Zarqa",  ar: "الزرقاء" },
  { value: "irbid",  en: "Irbid",  ar: "إربد" },
  { value: "aqaba",  en: "Aqaba",  ar: "العقبة" },
  { value: "salt",   en: "Salt",   ar: "السلط" },
  { value: "madaba", en: "Madaba", ar: "مادبا" },
  { value: "jerash", en: "Jerash", ar: "جرش" },
  { value: "mafraq", en: "Mafraq", ar: "المفرق" },
  { value: "karak",  en: "Karak",  ar: "الكرك" },
];

const AMMAN_AREAS = [
  { en: "Dabouq",       ar: "دابوق" },
  { en: "Abdoun",       ar: "عبدون" },
  { en: "Khalda",       ar: "خلدا" },
  { en: "Sweifieh",     ar: "الصويفية" },
  { en: "Shmeisani",    ar: "الشميساني" },
  { en: "Jabal Amman",  ar: "جبل عمان" },
  { en: "Jubeiha",      ar: "الجبيهة" },
  { en: "Tla' al-Ali",  ar: "تلاع العلي" },
  { en: "Um Uthaina",   ar: "أم أذينة" },
  { en: "Al-Rabieh",    ar: "الرابية" },
  { en: "Marj al-Hamam",ar: "مرج الحمام" },
  { en: "Airport Road", ar: "طريق المطار" },
  { en: "Abu Alanda",   ar: "أبو علندا" },
  { en: "Tabarbour",    ar: "طبربور" },
  { en: "Al-Hashmi",    ar: "الهاشمي" },
];

type PaymentMethod = "cod" | "card";

export default function Checkout() {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const isAr = language === "ar";
  const { items, clearCart } = useCartStore();
  const totalPrice = items.reduce((sum, item) => sum + normalizePrice(item.price.amount) * item.quantity, 0);
  const deliveryFee = totalPrice >= 50 ? 0 : 3;
  const currency = items[0]?.price.currencyCode || "JOD";

  usePageMeta({
    title: isAr ? "إتمام الطلب | أسبر بيوتي شوب" : "Checkout | Asper Beauty Shop",
    description: isAr
      ? "أتمّ طلبك بأمان مع خدمة الدفع عند الاستلام"
      : "Complete your order securely with Cash on Delivery.",
    canonical: "/checkout",
  });

  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [shakeFields, setShakeFields] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const triggerShake = (fields: string[]) => {
    setShakeFields(new Set(fields));
    // Haptic feedback
    if ("vibrate" in navigator) navigator.vibrate(50);
    setTimeout(() => setShakeFields(new Set()), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!fullName.trim()) missing.push("fullName");
    if (!phone.trim() || phone.replace(/\D/g, "").length < 9) missing.push("phone");
    if (!city) missing.push("city");
    if (!address.trim()) missing.push("address");

    if (missing.length > 0) {
      triggerShake(missing);
      return;
    }

    if (paymentMethod === "card") {
      toast.error(isAr ? "الدفع بالبطاقة غير متاح حالياً. يرجى اختيار الدفع عند الاستلام." : "Card payment is not available. Please use Cash on Delivery.");
      return;
    }

    // COD flow — create order via API
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone: `+962${phone}`,
          email: email.trim() || undefined,
          city,
          area,
          address,
          paymentMethod,
          items: items.map((item) => ({
            id: item.variantId,
            title: item.product.node.title,
            quantity: item.quantity,
            price: normalizePrice(item.price.amount),
            image: item.product.node.images?.edges?.[0]?.node?.url,
          })),
          subtotal: totalPrice,
          deliveryFee,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(isAr ? "فشل إرسال الطلب. يرجى المحاولة مرة أخرى." : "Failed to place order. Please try again.");
        return;
      }

      playSuccessSound();
      if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
      clearCart();
      toast.success(isAr ? `تم استلام طلبك! رقم الطلب: ${data.orderNumber}` : `Order received! Order #${data.orderNumber}`);
      navigate(`/track-order?order=${data.orderNumber}&token=${data.token}`);
    } catch {
      toast.error(isAr ? "حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى." : "Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPhone = (val: string) => {
    // Only allow digits after +962
    const digits = val.replace(/\D/g, "").slice(0, 9);
    setPhone(digits);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4" dir={isRTL ? "rtl" : "ltr"}>
        <p className="font-heading text-xl text-foreground mb-4">{isAr ? "سلة التسوق فارغة" : "Your cart is empty"}</p>
        <Link to="/products">
          <Button variant="outline">{isAr ? "متابعة التسوق" : "Continue Shopping"}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* ─── Enclosed "Trust Tunnel" Header ─── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-body">
            <ArrowLeft className="h-4 w-4" />
            {isAr ? "رجوع" : "Back"}
          </button>
          <Link to="/">
            <AsperLogo size={40} />
          </Link>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-body">
            <Lock className="h-3.5 w-3.5 text-accent" />
            <span>{isAr ? "دفع آمن" : "Secure Checkout"}</span>
          </div>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        {/* Order Summary */}
        <section className="space-y-4">
          <h2 className="font-heading text-lg text-foreground">{isAr ? "ملخص الطلب" : "Order Summary"}</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.variantId} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3">
                <div className="h-12 w-12 rounded-md bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                  {item.product.node.images?.edges?.[0]?.node && (
                    <img src={item.product.node.images.edges[0].node.url} alt="" className="h-full w-full object-contain p-0.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-foreground truncate">{item.product.node.title}</p>
                  <p className="text-xs text-muted-foreground font-body">{isAr ? "الكمية" : "Qty"}: {item.quantity}</p>
                </div>
                <p className="text-sm font-body font-semibold text-foreground shrink-0">
                  {(normalizePrice(item.price.amount) * item.quantity).toFixed(2)} {currency}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 pt-2 border-t border-border/50">
            <div className="flex justify-between text-sm font-body text-muted-foreground">
              <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
              <span>{totalPrice.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between text-sm font-body text-muted-foreground">
              <span>{isAr ? "التوصيل" : "Delivery"} {deliveryFee === 0 && <span className="text-accent text-xs">{isAr ? "(مجاني!)" : "(Free!)"}</span>}</span>
              <span>{deliveryFee.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between text-base font-heading font-bold text-foreground pt-1">
              <span>{isAr ? "الإجمالي" : "Total"}</span>
              <span>{(totalPrice + deliveryFee).toFixed(2)} {currency}</span>
            </div>
            {totalPrice < 50 && (
              <p className="text-xs text-accent font-body italic">
                {isAr
                  ? `أضف ${(50 - totalPrice).toFixed(2)} ${currency} للحصول على توصيل مجاني!`
                  : `Add ${(50 - totalPrice).toFixed(2)} ${currency} more for free delivery!`}
              </p>
            )}
          </div>
        </section>

        {/* Delivery Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <h2 className="font-heading text-lg text-foreground">{isAr ? "تفاصيل التوصيل" : "Delivery Details"}</h2>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="font-body text-sm">{isAr ? "الاسم الكامل" : "Full Name"}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={isAr ? "أدخل اسمك الكامل" : "Enter your full name"}
                className={cn("h-12 rounded-xl font-body", shakeFields.has("fullName") && "animate-shake border-destructive")}
              />
              {shakeFields.has("fullName") && (
                <p className="text-xs text-destructive font-body">{isAr ? "يرجى إدخال اسمك لنعرف إلى من نوصّل." : "Please enter your name so we know who to deliver to."}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="font-body text-sm">{isAr ? "رقم الهاتف" : "Phone Number"}</Label>
              <div className="relative">
                <span className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-body font-semibold`}>
                  +962
                </span>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => formatPhone(e.target.value)}
                  placeholder="7X XXX XXXX"
                  maxLength={10}
                  className={cn("h-12 rounded-xl font-body", isRTL ? "pr-14" : "pl-14", shakeFields.has("phone") && "animate-shake border-destructive")}
                />
              </div>
              {shakeFields.has("phone") && (
                <p className="text-xs text-destructive font-body">{isAr ? "يرجى التحقق من رقم هاتفك." : "Please check your phone number. It seems a bit off."}</p>
              )}
            </div>

            {/* Email (optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-body text-sm">
                {isAr ? "البريد الإلكتروني" : "Email"}{" "}
                <span className="text-muted-foreground text-xs">({isAr ? "اختياري" : "optional"})</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="h-12 rounded-xl font-body"
              />
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <Label className="font-body text-sm">{isAr ? "المدينة" : "City"}</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className={cn("h-12 rounded-xl font-body", shakeFields.has("city") && "animate-shake border-destructive")}>
                  <SelectValue placeholder={isAr ? "اختر مدينتك" : "Select your city"} />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  {CITIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="font-body">{isAr ? c.ar : c.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {shakeFields.has("city") && (
                <p className="text-xs text-destructive font-body">{isAr ? "يرجى اختيار مدينتك للتوصيل." : "Please select your city for delivery."}</p>
              )}
            </div>

            {/* Area (Amman only) */}
            {city === "amman" && (
              <div className="space-y-1.5">
                <Label className="font-body text-sm">{isAr ? "المنطقة" : "Area"}</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className="h-12 rounded-xl font-body">
                    <SelectValue placeholder={isAr ? "اختر منطقتك" : "Select your area"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50 max-h-60">
                    {AMMAN_AREAS.map((a) => (
                      <SelectItem key={a.en} value={a.en.toLowerCase().replace(/\s/g, "-")} className="font-body">{isAr ? a.ar : a.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Street Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="font-body text-sm">{isAr ? "العنوان التفصيلي" : "Street Address"}</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={isAr ? "اسم البناية، الشارع، الطابق" : "Building name, street, floor"}
                className={cn("h-12 rounded-xl font-body", shakeFields.has("address") && "animate-shake border-destructive")}
              />
              {shakeFields.has("address") && (
                <p className="text-xs text-destructive font-body">{isAr ? "نحتاج عنوانك لتوصيل طلبك." : "We need your address to deliver your order."}</p>
              )}
            </div>
          </section>

          {/* Payment Method */}
          <section className="space-y-4">
            <h2 className="font-heading text-lg text-foreground">{isAr ? "طريقة الدفع" : "Payment Method"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* COD */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={cn(
                  "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                  paymentMethod === "cod" ? "border-accent bg-accent/5 shadow-maroon-glow" : "border-border/50 hover:border-border"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Banknote className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-body font-semibold text-sm text-foreground">{isAr ? "الدفع عند الاستلام" : "Cash on Delivery"}</p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    {isAr ? "ادفع بأمان عند وصول طلبك." : "Pay securely at your doorstep."}
                  </p>
                </div>
              </button>

              {/* Credit Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                  paymentMethod === "card" ? "border-accent bg-accent/5 shadow-maroon-glow" : "border-border/50 hover:border-border"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-body font-semibold text-sm text-foreground">{isAr ? "بطاقة ائتمان / خصم" : "Credit / Debit Card"}</p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    {isAr ? "دفع آمن عبر Shopify." : "Secure payment via Shopify."}
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 btn-ripple text-sm uppercase tracking-widest rounded-xl"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : paymentMethod === "card" ? (
              <>
                <Lock className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {isAr ? `الدفع بالبطاقة (${(totalPrice + deliveryFee).toFixed(2)} ${currency})` : `Pay with Card (${(totalPrice + deliveryFee).toFixed(2)} ${currency})`}
              </>
            ) : (
              <>
                <Banknote className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {isAr ? `تأكيد الطلب — COD (${(totalPrice + deliveryFee).toFixed(2)} ${currency})` : `Place Order — COD (${(totalPrice + deliveryFee).toFixed(2)} ${currency})`}
              </>
            )}
          </Button>

          <p className="text-[10px] text-center text-muted-foreground font-body">
            {isAr ? "بتأكيد طلبك، أنت توافق على شروط خدمة أسبر وسياسة الإرجاع." : "By placing your order, you agree to Asper's Terms of Service and Return Policy."}
          </p>
        </form>
      </main>
    </div>
  );
}
