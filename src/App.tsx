import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { frFR } from "@clerk/localizations";
import { useTranslation } from "react-i18next";
import { clerkAppearance } from "@/lib/clerkTheme";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { RequireAdmin, RequireAuth } from "@/components/auth/RequireAuth";
import { AuthTokenBridge } from "@/components/auth/AuthTokenBridge";
import { InAppBrowserNotice } from "@/components/InAppBrowserNotice";
import { ApplicationButtonProvider } from "@/contexts/ApplicationButtonContext";
import Index from "./pages/Index";
import ApplicationSection from "./components/sections/ApplicationSection";
import ApplicationSubmittedSection from "./components/sections/ApplicationSubmittedSection";
import AdminApplicationsPage from "./pages/admin/AdminApplicationsPage";
import AdminApplicationDetailPage from "./pages/admin/AdminApplicationDetailPage";
import EventOpsDashboardPage from "./pages/admin/EventOpsDashboardPage";
import Dashboard from "./pages/dashboard";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import PostAuthRedirect from "./pages/PostAuthRedirect";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

const App = () => {
  const { t, i18n } = useTranslation();

  if (!clerkPublishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <p>{t("app.missingClerkKey")}</p>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={clerkAppearance}
      localization={i18n.language === "fr" ? frFR : undefined}
    >
      <QueryClientProvider client={queryClient}>
        <AuthTokenBridge />
        <ApplicationButtonProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" />
            <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
              <BrowserRouter>
                <InAppBrowserNotice />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/signin" element={<SignInPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/login" element={<Navigate to="/signin" replace />} />
                  <Route
                    path="/user-dashboard"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route
                    path="/post-auth"
                    element={
                      <RequireAuth>
                        <PostAuthRedirect />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <RequireAuth>
                        <Dashboard />
                      </RequireAuth>
                    }
                  />
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
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </GoogleReCaptchaProvider>
          </TooltipProvider>
        </ApplicationButtonProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default App;
