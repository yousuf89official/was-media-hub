import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import { createQueryClient } from "./utils/queryConfig";
import ErrorBoundary from "./components/ErrorBoundary";
import CookieConsent from "./components/CookieConsent";
import { SiteContentProvider } from "@/contexts/SiteContentContext";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const Auth = lazy(() => import("./pages/Auth"));
const EmailVerification = lazy(() => import("./pages/EmailVerification"));
const DashboardLayout = lazy(() =>
  import("./components/DashboardLayout").then((m) => ({
    default: m.DashboardLayout,
  }))
);
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CampaignForm = lazy(() => import("./pages/CampaignForm"));
const DataExport = lazy(() => import("./pages/DataExport"));
const CalculationLogs = lazy(() => import("./pages/CalculationLogs"));
const ContentManagement = lazy(() => import("./pages/ContentManagement"));
const Profile = lazy(() => import("./pages/Profile"));
const Reports = lazy(() => import("./pages/Reports"));
const Brands = lazy(() => import("./pages/Brands"));
const AVECalculator = lazy(() => import("./pages/AVECalculator"));
const BrandCampaignManagement = lazy(() =>
  import("./pages/BrandCampaignManagement")
);
const BrandPerformanceDashboard = lazy(() =>
  import("./pages/BrandPerformanceDashboard")
);
const UserManagement = lazy(() => import("./pages/UserManagement"));

const queryClient = createQueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <SiteContentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CookieConsent />
          <BrowserRouter>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                {/* Protected routes with sidebar */}
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/campaigns/new" element={<CampaignForm />} />
                  <Route path="/campaigns/:id/edit" element={<CampaignForm />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/brands" element={<Brands />} />
                  <Route
                    path="/brands/:brandId/dashboard"
                    element={<BrandPerformanceDashboard />}
                  />
                  <Route path="/ave-calculator" element={<AVECalculator />} />
                  <Route
                    path="/calculation-logs"
                    element={<CalculationLogs />}
                  />
                  <Route
                    path="/content-management"
                    element={<ContentManagement />}
                  />
                  <Route
                    path="/brand-campaign-management"
                    element={<BrandCampaignManagement />}
                  />
                  <Route
                    path="/user-management"
                    element={<UserManagement />}
                  />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/data-export" element={<DataExport />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </SiteContentProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
