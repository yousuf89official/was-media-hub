import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import Brands from "./pages/Brands";
import AVECalculator from "./pages/AVECalculator";
import CalculationLogs from "./pages/CalculationLogs";
import AdminSettings from "./pages/AdminSettings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected routes with sidebar */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/ave-calculator" element={<AVECalculator />} />
            <Route path="/calculation-logs" element={<CalculationLogs />} />
            <Route path="/admin-settings" element={<AdminSettings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
