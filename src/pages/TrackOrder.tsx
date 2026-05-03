import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Calendar,
  Key,
  Loader2,
  MapPin,
  Package,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLanguage } from "@/contexts/LanguageContext";

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  order_number: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  city: string;
  area?: string | null;
  delivery_address: string;
  created_at: string;
  updated_at: string;
}

const statusSteps = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

type StatusKey = (typeof statusSteps)[number] | "cancelled";

const statusConfig: Record<
  StatusKey,
  { label: string; color: string; labelAr: string; helper: string; helperAr: string }
> = {
  pending: {
    label: "Pending",
    labelAr: "قيد الانتظار",
    color: "bg-yellow-500",
    helper: "We received your request and are preparing it.",
    helperAr: "تم استلام طلبك وجاري تحضيره.",
  },
  confirmed: {
    label: "Confirmed",
    labelAr: "مؤكد",
    color: "bg-blue-500",
    helper: "Order confirmed by our team.",
    helperAr: "تم تأكيد الطلب من فريقنا.",
  },
  processing: {
    label: "Processing",
    labelAr: "قيد المعالجة",
    color: "bg-purple-500",
    helper: "Packing your items with care.",
    helperAr: "يتم تجهيز المنتجات بعناية.",
  },
  shipped: {
    label: "Shipped",
    labelAr: "تم الشحن",
    color: "bg-indigo-500",
    helper: "On the way to your city.",
    helperAr: "في الطريق إلى مدينتك.",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    labelAr: "في طريقه للتوصيل",
    color: "bg-orange-500",
    helper: "Our driver is heading to you today.",
    helperAr: "السائق في الطريق إليك اليوم.",
  },
  delivered: {
    label: "Delivered",
    labelAr: "تم التوصيل",
    color: "bg-green-500",
    helper: "Delivered successfully. Enjoy!",
    helperAr: "تم التوصيل بنجاح، استمتعي!",
  },
  cancelled: {
    label: "Cancelled",
    labelAr: "ملغي",
    color: "bg-red-500",
    helper: "Order was cancelled.",
    helperAr: "تم إلغاء الطلب.",
  },
};

const TrackOrder = () => {
  const { language, isRTL } = useLanguage();
  const isAr = language === "ar";

  usePageMeta({
    title: isAr ? "تتبع طلبك | أسبر بيوتي" : "Track Your Order | Asper Beauty",
    description: isAr ? "تابع حالة طلبك من أسبر بيوتي في الوقت الفعلي. أدخل رقم طلبك ورمز التأكيد." : "Track your Asper Beauty order status in real time. Enter your order number and access code.",
    canonical: "/track-order",
  });
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("order") || "",
  );
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-track if both order and token are provided in URL
  const trackOrder = useCallback(async (orderNum: string, confirmToken: string) => {
    const normalizedOrder = orderNum.trim().toUpperCase();
    const normalizedToken = confirmToken.trim().toUpperCase();
    if (!normalizedOrder || !normalizedToken) {
      throw new Error("validation");
    }

    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber: normalizedOrder, token: normalizedToken }),
    });
    const data = await res.json();
    if (!res.ok || data?.error) throw new Error(data?.error || "not_found");
    return data.order as Order;
  }, []);

  const handleAutoTrack = useCallback(async (orderNum: string, confirmToken: string) => {
    setLoading(true);
    setError("");
    setOrder(null);
    setHasSearched(true);
    try {
      setOrder(await trackOrder(orderNum, confirmToken));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg === "not_found"
          ? (isAr ? "لم يتم العثور على الطلب. يرجى التحقق من بياناتك." : "Order not found. Please check your details.")
          : msg === "validation"
            ? (isAr ? "يجب إدخال رقم الطلب ورمز التأكيد" : "Order number and token are required")
          : (isAr ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  }, [isAr, trackOrder]);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedOrder = orderNumber.trim();
    const normalizedToken = token.trim();
    if (!normalizedOrder || !normalizedToken) {
      setError(
        isAr
          ? "يجب إدخال رقم الطلب ورمز التأكيد"
          : "Order number and token are required",
      );
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);
    setHasSearched(true);
    try {
      setOrder(await trackOrder(normalizedOrder, normalizedToken));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg === "not_found"
          ? (isAr ? "لم يتم العثور على الطلب. يرجى التحقق من بياناتك." : "Order not found. Please check your details.")
          : msg === "validation"
            ? (isAr ? "يجب إدخال رقم الطلب ورمز التأكيد" : "Order number and token are required")
          : (isAr ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlOrder = searchParams.get("order");
    const urlToken = searchParams.get("token");
    if (urlOrder && urlToken) {
      setOrderNumber(urlOrder);
      setToken(urlToken);
      void handleAutoTrack(urlOrder, urlToken);
    }
  }, [handleAutoTrack, searchParams]);

  const getStatusStep = useCallback((status: string) => {
    const stepIndex = statusSteps.indexOf(status as StatusKey);
    return stepIndex >= 0 ? stepIndex : 0;
  }, []);

  const stepLabels = useMemo(
    () => statusSteps.map((key) => (isAr ? statusConfig[key].labelAr : statusConfig[key].label)),
    [isAr],
  );

  const progressWidth = useMemo(() => {
    if (!order) return 0;
    if (order.status === "cancelled") return 0;
    return ((getStatusStep(order.status) + 1) / statusSteps.length) * 100;
  }, [getStatusStep, order]);

  const orderItems = useMemo(
    () => (order && Array.isArray(order.items) ? order.items : []),
    [order],
  );

  const formattedCreatedAt = useMemo(() => {
    if (!order) return "";
    return format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a");
  }, [order]);

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Package className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-display text-foreground mb-2">
              {isAr ? "تتبع طلبك" : "Track Your Order"}
            </h1>
            <p className="text-muted-foreground">
              {isAr ? "أدخل رقم طلبك ورمز التأكيد لعرض حالة طلبك" : "Enter your order number and confirmation token to view your order status"}
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">{isAr ? "رقم الطلب" : "Order Number"}</Label>
                  <Input
                    id="orderNumber"
                    placeholder={isAr ? "مثال: ASP-20240115-a1b2" : "e.g., ASP-20240115-a1b2"}
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    {isAr ? "رمز التأكيد" : "Confirmation Token"}
                  </Label>
                  <Input
                    id="token"
                    placeholder={isAr ? "تحقق من بريد التأكيد الإلكتروني" : "Check your confirmation email"}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isAr ? "يمكنك إيجاد هذا الرمز في بريد تأكيد طلبك" : "You can find this token in your order confirmation email"}
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isAr ? "جاري البحث..." : "Searching..."}
                      </>
                    )
                    : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        {isAr ? "تتبع الطلب" : "Track Order"}
                      </>
                    )}
                </Button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3" role="alert" aria-live="polite">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
            </CardContent>
        </Card>

          {!order && hasSearched && !loading && !error && (
            <Card className="mb-6">
              <CardContent className="py-4 text-sm text-muted-foreground">
                {isAr
                  ? "لم يتم العثور على بيانات بعد. تأكدي من كتابة رقم الطلب والرمز كما في بريد التأكيد."
                  : "No order found yet. Double-check the order number and token from your confirmation email."}
              </CardContent>
            </Card>
          )}

          {order && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Order Status Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {isAr ? `طلب ${order.order_number}` : `Order ${order.order_number}`}
                    </CardTitle>
                    <Badge
                      className={`${
                        statusConfig[order.status as StatusKey]?.color || "bg-gray-500"
                      } text-white`}
                    >
                      {isAr
                        ? (statusConfig[order.status as StatusKey]?.labelAr || order.status)
                        : (statusConfig[order.status as StatusKey]?.label || order.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    {isAr
                      ? (statusConfig[order.status as StatusKey]?.helperAr || "")
                      : (statusConfig[order.status as StatusKey]?.helper || "")}
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {isAr ? "آخر تحديث:" : "Last updated:"}{" "}
                    {format(new Date(order.updated_at), "MMM d, yyyy · h:mm a")}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Steps */}
                  {order.status !== "cancelled" && (
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        {stepLabels.map((step, index) => (
                          <div
                            key={step}
                            className="flex flex-col items-center flex-1"
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                index <= getStatusStep(order.status)
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <span className="text-[10px] mt-1 text-center text-muted-foreground hidden sm:block">
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progressWidth}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {order.status === "cancelled" && (
                    <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      {isAr ? "تم إلغاء الطلب. تواصلي مع الدعم إذا كان هذا غير صحيح." : "This order was cancelled. Contact support if this seems incorrect."}
                    </div>
                  )}

                  <div className="grid gap-4 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{isAr ? "عنوان التوصيل" : "Delivery Address"}</p>
                        <p className="text-muted-foreground">
                          {order.delivery_address}
                          {order.area ? `, ${order.area}` : ""}, {order.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{isAr ? "تاريخ الطلب" : "Order Date"}</p>
                        <p className="text-muted-foreground">
                          {formattedCreatedAt}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{isAr ? "عناصر الطلب" : "Order Items"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {orderItems.length === 0
                    ? (
                      <p className="text-sm text-muted-foreground">
                        {isAr ? "لا توجد عناصر مسجلة لهذا الطلب حتى الآن." : "No items are recorded for this order yet."}
                      </p>
                    )
                    : (
                      <div className="space-y-4">
                        {orderItems.map((item, index) => (
                          <div key={item.id ?? index} className="flex items-center gap-4">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-16 h-16 object-cover rounded-lg bg-muted"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {isAr ? "الكمية" : "Qty"}: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium">
                              {item.price.toFixed(2)} JOD
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                  <Separator className="my-4" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                      <span>{order.subtotal.toFixed(2)} JOD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isAr ? "الشحن" : "Shipping"}</span>
                      <span>
                        {order.shipping_cost === 0
                          ? isAr ? "مجاني" : "Free"
                          : `${order.shipping_cost.toFixed(2)} JOD`}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-base">
                      <span>{isAr ? "الإجمالي" : "Total"}</span>
                      <span className="text-primary">
                        {order.total.toFixed(2)} JOD
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrder;
