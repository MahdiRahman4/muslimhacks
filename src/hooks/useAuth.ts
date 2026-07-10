import { useCallback, useEffect, useState } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { ApiError, fetchCurrentUser, fetchUserSummary } from "@/lib/api";
import type { AuthUser, UserSummary } from "@/types/application";

export function useAuth() {
  const { isLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!isLoaded) {
      return null;
    }

    if (!isSignedIn) {
      setUser(null);
      setSummary(null);
      setLoading(false);
      return null;
    }

    try {
      const data = await fetchCurrentUser();
      setUser(data.user);

      try {
        const summaryData = await fetchUserSummary();
        setSummary(summaryData.summary);
      } catch {
        setSummary(null);
      }

      return data.user;
    } catch {
      setUser(null);
      setSummary(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser, clerkUser?.id]);

  const logout = async () => {
    await signOut();
    setUser(null);
    setSummary(null);
  };

  return {
    user,
    summary,
    clerkUser,
    loading: !isLoaded || loading,
    isAuthenticated: Boolean(isSignedIn && user),
    isAdmin: user?.role === "admin",
    logout,
    refreshUser,
    getErrorMessage: (error: unknown) =>
      error instanceof ApiError ? error.message : "Something went wrong",
  };
}
