import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RequireAdmin, RequireAuth } from "@/components/auth/RequireAuth";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import ApplicationPage from "./pages/ApplicationPage";
import AdminApplicationsPage from "./pages/admin/AdminApplicationsPage";
import AdminApplicationDetailPage from "./pages/admin/AdminApplicationDetailPage";
import EventOpsDashboardPage from "./pages/admin/EventOpsDashboardPage";
import NotFound from "./pages/NotFound";
import ApplicationSubmittedSection from "./components/sections/ApplicationSubmittedSection";
import ApplicationSection from "./components/sections/ApplicationSection";
import Login from "./pages/login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/login" element={<LoginPage />} /> */}
          <Route
            path="/apply"
            element={
              <RequireAuth>
                <ApplicationSection />
              </RequireAuth>
            }
          />
          <Route
            path="/apply/submitted"
            element={
              <RequireAuth>
                <ApplicationSubmittedSection />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <RequireAdmin>
                <AdminApplicationsPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/event-ops"
            element={
              <RequireAdmin>
                <EventOpsDashboardPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/applications/:id"
            element={
              <RequireAdmin>
                <AdminApplicationDetailPage />
              </RequireAdmin>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
