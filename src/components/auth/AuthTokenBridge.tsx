import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { setAuthTokenGetter, tokenRemainingSeconds } from "@/lib/auth-token";

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
          const token = await getToken();
          // clerk-js can serve a stale cached token when its background
          // refresh lags (throttled tab, slow network). If the cached token
          // is expired or about to expire, force a fresh one.
          if (token && !(tokenRemainingSeconds(token) > 5)) {
            if (import.meta.env.DEV) {
              console.warn(
                "[auth-token] cached Clerk token expired/near expiry; forcing refresh (skipCache)",
              );
            }
            return await getToken({ skipCache: true });
          }
          return token;
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
