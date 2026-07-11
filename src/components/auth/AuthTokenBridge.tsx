import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { setAuthTokenGetter } from "@/lib/auth-token";

/**
 * Keeps a module-level Clerk getToken() available to apiFetch.
 * Must update during render (not only in useEffect) so the first
 * authenticated API call after sign-in already has a token getter.
 */
export function AuthTokenBridge() {
  const { getToken, isLoaded, isSignedIn } = useClerkAuth();

  if (isLoaded) {
    if (isSignedIn) {
      setAuthTokenGetter(async () => {
        try {
          return await getToken();
        } catch {
          return null;
        }
      });
    } else {
      setAuthTokenGetter(async () => null);
    }
  }

  return null;
}
