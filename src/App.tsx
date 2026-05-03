import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useCartSync } from "@/hooks/useCartSync";
import { verifyBrandDNA } from "@/lib/verifyBrandDNA";
import { RequireAdmin } from "./components/RequireAdmin";

// Slim top-bar shown during lazy route loading
const RouteLoadingBar = () => (
  <div className="fixed inset-x-0 top-0 z-[9999] h-0.5 overflow-hidden">
    <div className="h-full w-full animate-pulse bg-gradient-to-r from-[#800020] via-[#C5A028] to-[#800020]" />
  </div>
);

// Eagerly load only the landing page for fastest LCP
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-load all other routes — they are only needed when navigated to
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Collections = lazy(() => import("./pages/Collections"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail"));
const Brands = lazy(() => import("./pages/Brands"));
const BrandVichy = lazy(() => import("./pages/BrandVichy"));
const BrandDetail = lazy(() => import("./pages/BrandDetail"));
const BestSellers = lazy(() => import("./pages/BestSellers"));
const Offers = lazy(() => import("./pages/Offers"));
const Wedding = lazy(() => import("./pages/Wedding"));
const Contact = lazy(() => import("./pages/Contact"));
const SkinConcerns = lazy(() => import("./pages/SkinConcerns"));
const ConcernCollection = lazy(() => import("./pages/ConcernCollection"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const Profile = lazy(() => import("./pages/Profile"));
const Philosophy = lazy(() => import("./pages/Philosophy"));
const Shop = lazy(() => import("./pages/Shop"));
const ShopAllOrganized = lazy(() => import("./components/ShopAllOrganized"));
const DriverDashboard = lazy(() => import("./pages/DriverDashboard"));
const AdminAuditLogs = lazy(() => import("./pages/AdminAuditLogs"));
const AdminEmailDashboard = lazy(() => import("./pages/AdminEmailDashboard"));
const AsperIntelligence = lazy(() => import("./pages/AsperIntelligence"));
const PurgeReview = lazy(() => import("./pages/PurgeReview"));
const BrandIntelligenceDashboard = lazy(() => import("./pages/BrandIntelligenceDashboard"));
const AdminSaleSubscribers = lazy(() => import("./pages/AdminSaleSubscribers"));
const Health = lazy(() => import("./pages/Health"));
const RegimenPortal = lazy(() => import("./pages/RegimenPortal"));
const BulkUpload = lazy(() => import("./pages/BulkUpload"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const ManageProducts = lazy(() => import("./pages/ManageProducts"));
const CatalogIngestion = lazy(() => import("./pages/CatalogIngestion"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const AdminShopify = lazy(() => import("./pages/AdminShopify"));

const BeautyAssistant = lazy(() =>
  import("@/components/BeautyAssistant").then((m) => ({ default: m.BeautyAssistant })),
);
const FloatingConciergeWidget = lazy(() =>
  import("@/components/FloatingConciergeWidget").then((m) => ({ default: m.FloatingConciergeWidget })),
);


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min — avoid redundant refetches
      gcTime: 15 * 60 * 1000,     // 15 min garbage collection
      refetchOnWindowFocus: false, // prevent refetch on tab switch
      retry: 1,                    // single retry on failure
    },
  },
});

// Cart sync wrapper component
function CartSyncProvider({ children }: { children: React.ReactNode }) {
  useCartSync();
  return <>{children}</>;
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
            <BrowserRouter>
              <Suspense fallback={null}>
                <BeautyAssistant />
                <FloatingConciergeWidget />
              </Suspense>
              <Suspense fallback={<RouteLoadingBar />}>
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
                  <Route path="/wedding" element={<Wedding />} />
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
                  <Route path="/admin/bulk-upload" element={<RequireAdmin><BulkUpload /></RequireAdmin>} />
                  <Route path="/admin/orders" element={<RequireAdmin><AdminOrders /></RequireAdmin>} />
                  <Route path="/admin/products" element={<RequireAdmin><ManageProducts /></RequireAdmin>} />
                  <Route path="/admin/catalog-ingestion" element={<RequireAdmin><CatalogIngestion /></RequireAdmin>} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/tracking" element={<Navigate to="/track-order" replace />} />
                  <Route path="/shipping" element={<Navigate to="/contact" replace />} />
                  <Route path="/returns" element={<Navigate to="/contact" replace />} />
                  <Route path="/consultation" element={<Navigate to="/skin-concerns" replace />} />
                  <Route path="/driver" element={<RequireAdmin><DriverDashboard /></RequireAdmin>} />
                  <Route path="/admin/audit-logs" element={<RequireAdmin><AdminAuditLogs /></RequireAdmin>} />
                  <Route path="/admin/purge-review" element={<RequireAdmin><PurgeReview /></RequireAdmin>} />
                  <Route path="/admin/emails" element={<RequireAdmin><AdminEmailDashboard /></RequireAdmin>} />
                  <Route path="/admin/sale-subscribers" element={<AdminSaleSubscribers />} />
                  <Route path="/admin/shopify" element={<RequireAdmin><AdminShopify /></RequireAdmin>} />
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
            </BrowserRouter>
          </TooltipProvider>
        </CartSyncProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
