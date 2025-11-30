import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import { createQueryClient } from "./utils/queryConfig";
import ErrorBoundary from "./components/ErrorBoundary";
import CookieConsent from "./components/CookieConsent";
import { SiteContentProvider } from "@/contexts/SiteContentContext";
import Auth from "./pages/Auth";
import EmailVerification from "./pages/EmailVerification";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import CampaignForm from "./pages/CampaignForm";
import CampaignDetail from "./pages/CampaignDetail";
import MetricsEntry from "./pages/MetricsEntry";
import DataExport from "./pages/DataExport";
import CalculationLogs from "./pages/CalculationLogs";
import ContentManagement from "./pages/ContentManagement";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import Brands from "./pages/Brands";
import AVECalculator from "./pages/AVECalculator";
import BrandCampaignManagement from "./pages/BrandCampaignManagement";
import BrandPerformanceDashboard from "./pages/BrandPerformanceDashboard";

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
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              
              {/* Protected routes with sidebar */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/campaigns/new" element={<CampaignForm />} />
                <Route path="/campaigns/:id" element={<CampaignDetail />} />
                <Route path="/campaigns/:id/edit" element={<CampaignForm />} />
                <Route path="/campaigns/:id/metrics" element={<MetricsEntry />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/brands/:brandId/dashboard" element={<BrandPerformanceDashboard />} />
                <Route path="/ave-calculator" element={<AVECalculator />} />
                <Route path="/calculation-logs" element={<CalculationLogs />} />
                <Route path="/content-management" element={<ContentManagement />} />
                <Route path="/brand-campaign-management" element={<BrandCampaignManagement />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/data-export" element={<DataExport />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SiteContentProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
