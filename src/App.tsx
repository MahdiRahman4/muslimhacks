import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ApplicationSubmittedSection from "./components/sections/ApplicationSubmittedSection";

const queryClient = new QueryClient();

const App = () => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/apply/submitted" element={<ApplicationSubmittedSection />}/>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </GoogleReCaptchaProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
