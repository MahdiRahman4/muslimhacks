import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useAuth } from "@/hooks/useAuth";
import { useApplicationButtonState } from "@/contexts/ApplicationButtonContext";

const REDIRECT_FROM = new Set(["/", "/dashboard"]);

/** Sends signed-in applicants without an application to /apply. */
export function RedirectToApplyIfNeeded() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { isAdmin, loading: authLoading } = useAuth();
  const { hasApplication, isLoading: appLoading } = useApplicationButtonState();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || authLoading || appLoading || !isSignedIn) {
      return;
    }
    if (isAdmin || hasApplication) {
      return;
    }
    if (!REDIRECT_FROM.has(location.pathname)) {
      return;
    }

    navigate("/apply", { replace: true });
  }, [
    appLoading,
    authLoading,
    hasApplication,
    isAdmin,
    isLoaded,
    isSignedIn,
    location.pathname,
    navigate,
  ]);

  return null;
}
