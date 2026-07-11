import { useEffect } from "react";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { setAuthTokenGetter } from "@/lib/auth-token";

export function AuthTokenBridge() {
  const { getToken, isLoaded, isSignedIn } = useClerkAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setAuthTokenGetter(async () => null);
      return;
    }

    setAuthTokenGetter(async () => getToken());
  }, [getToken, isLoaded, isSignedIn]);

  return null;
}
