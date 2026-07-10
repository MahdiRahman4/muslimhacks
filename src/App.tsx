import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { RequireAdmin, RequireAuth } from "@/components/auth/RequireAuth";
import { AuthTokenBridge } from "@/components/auth/AuthTokenBridge";
import Index from "./pages/Index";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ApplicationSection from "./components/sections/ApplicationSection";
import ApplicationSubmittedSection from "./components/sections/ApplicationSubmittedSection";
import AdminApplicationsPage from "./pages/admin/AdminApplicationsPage";
import AdminApplicationDetailPage from "./pages/admin/AdminApplicationDetailPage";
import EventOpsDashboardPage from "./pages/admin/EventOpsDashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App = () => {
  if (!clerkPublishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <p>Missing VITE_CLERK_PUBLISHABLE_KEY. Copy .env.example to .env and add your Clerk key.</p>
      </div>
    );
  }

  return (
  <ClerkProvider publishableKey={clerkPublishableKey}>
    <QueryClientProvider client={queryClient}>
      <AuthTokenBridge />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<Navigate to="/signin" replace />} />
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
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
  );
};

export default App;
