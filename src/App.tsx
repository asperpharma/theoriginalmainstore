import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useCartSync } from "@/hooks/useCartSync";
import { verifyBrandDNA } from "@/lib/verifyBrandDNA";
import { Analytics } from "@vercel/analytics/react";

// Always-eager: primary landing pages
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import NotFound from "./pages/NotFound";

// Lazy: everything else — splits the main bundle from 1.3MB to ~400KB
const ProductDetail        = lazy(() => import("./pages/ProductDetail"));
const Collections          = lazy(() => import("./pages/Collections"));
const CollectionDetail     = lazy(() => import("./pages/CollectionDetail"));
const Brands               = lazy(() => import("./pages/Brands"));
const BrandVichy           = lazy(() => import("./pages/BrandVichy"));
const BrandDetail          = lazy(() => import("./pages/BrandDetail"));
const BestSellers          = lazy(() => import("./pages/BestSellers"));
const Offers               = lazy(() => import("./pages/Offers"));
const Contact              = lazy(() => import("./pages/Contact"));
const SkinConcerns         = lazy(() => import("./pages/SkinConcerns"));
const ConcernCollection    = lazy(() => import("./pages/ConcernCollection"));
const Wishlist             = lazy(() => import("./pages/Wishlist"));
const Auth                 = lazy(() => import("./pages/Auth"));
const Account              = lazy(() => import("./pages/Account"));
const Profile              = lazy(() => import("./pages/Profile"));
const Philosophy           = lazy(() => import("./pages/Philosophy"));
const AsperIntelligence    = lazy(() => import("./pages/AsperIntelligence"));
const RegimenPortal        = lazy(() => import("./pages/RegimenPortal"));
const Health               = lazy(() => import("./pages/Health"));
const TrackOrder           = lazy(() => import("./pages/TrackOrder"));
const Checkout             = lazy(() => import("./pages/Checkout"));
const ShopAllOrganized     = lazy(() => import("./components/ShopAllOrganized"));
const BulkUpload           = lazy(() => import("./pages/BulkUpload"));
const AdminOrders          = lazy(() => import("./pages/AdminOrders"));
const ManageProducts       = lazy(() => import("./pages/ManageProducts"));
const AdminAuditLogs       = lazy(() => import("./pages/AdminAuditLogs"));
const PurgeReview          = lazy(() => import("./pages/PurgeReview"));
const DriverDashboard      = lazy(() => import("./pages/DriverDashboard"));
const BrandIntelligenceDashboard = lazy(() => import("./pages/BrandIntelligenceDashboard"));
const MomBaby                    = lazy(() => import("./pages/MomBaby"));
const PrivacyPolicy              = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService             = lazy(() => import("./pages/TermsOfService"));
import { RequireAdmin } from "./components/RequireAdmin";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ScrollToTop } from "./components/ScrollToTop";

const BeautyAssistant = lazy(() =>
  import("@/components/BeautyAssistant").then((m) => ({ default: m.BeautyAssistant })),
);
const FloatingConciergeWidget = lazy(() =>
  import("@/components/FloatingConciergeWidget").then((m) => ({ default: m.FloatingConciergeWidget })),
);


const queryClient = new QueryClient();

// Cart sync wrapper component
function CartSyncProvider({ children }: { children: React.ReactNode }) {
  useCartSync();
  return <>{children}</>;
}

// Scroll to top on every route change
function RouteScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Clinical DNA verification: runs once on load to ensure brand tokens are active (see docs/LAUNCH_DAY_PROTOCOL.md)
function useBrandDNAGuard() {
  useEffect(() => {
    const t = setTimeout(verifyBrandDNA, 100);
    return () => clearTimeout(t);
  }, []);
}

const App = () => {
  useBrandDNAGuard();
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <CartSyncProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-center" />
            <Analytics />
            <BrowserRouter>
              <RouteScrollReset />
              <ScrollToTop />
              <ErrorBoundary>
              <Suspense fallback={null}>
                <BeautyAssistant />
                <FloatingConciergeWidget />
              </Suspense>
              <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/chat" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/products" element={<Shop />} />
                <Route path="/shop/organized" element={<ShopAllOrganized />} />
                <Route path="/product/:handle" element={<ProductDetail />} />
                <Route path="/collections" element={<Collections />} />
                <Route
                  path="/collections/:slug"
                  element={<CollectionDetail />}
                />
                <Route path="/brands" element={<Brands />} />
                <Route path="/brands/vichy" element={<BrandVichy />} />
                <Route path="/brands/:slug" element={<BrandDetail />} />
                <Route path="/best-sellers" element={<BestSellers />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/skin-concerns" element={<SkinConcerns />} />
                <Route
                  path="/concerns/:concernSlug"
                  element={<ConcernCollection />}
                />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/account" element={<Account />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/philosophy" element={<Philosophy />} />
                <Route path="/intelligence" element={<AsperIntelligence />} />
                <Route path="/health" element={<Health />} />
                <Route path="/portal/regimen/:id" element={<RegimenPortal />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/tracking" element={<Navigate to="/track-order" replace />} />
                <Route path="/shipping" element={<Navigate to="/contact" replace />} />
                <Route path="/returns" element={<Navigate to="/contact" replace />} />
                <Route path="/consultation" element={<Navigate to="/skin-concerns" replace />} />
                <Route path="/mom-baby" element={<MomBaby />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/admin/bulk-upload" element={<RequireAdmin><BulkUpload /></RequireAdmin>} />
                <Route path="/admin/orders" element={<RequireAdmin><AdminOrders /></RequireAdmin>} />
                <Route path="/admin/products" element={<RequireAdmin><ManageProducts /></RequireAdmin>} />
                <Route path="/admin/audit-logs" element={<RequireAdmin><AdminAuditLogs /></RequireAdmin>} />
                <Route path="/admin/purge-review" element={<RequireAdmin><PurgeReview /></RequireAdmin>} />
                <Route path="/driver" element={<RequireAdmin><DriverDashboard /></RequireAdmin>} />
                <Route
                  path="/brand-intelligence"
                  element={
                    <RequireAdmin>
                      <BrandIntelligenceDashboard />
                    </RequireAdmin>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </CartSyncProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
