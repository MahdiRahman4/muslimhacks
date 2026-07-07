import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "@/lib/api";
import { getAuthToken, setAuthToken } from "@/lib/auth";
import type { AuthUser } from "@/types/application";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const data = await fetchCurrentUser();
      setUser(data.user);
      return data.user;
    } catch {
      logoutUser();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await loginUser(email, password);
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (email: string, password: string) => {
    const data = await registerUser(email, password);
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    refreshUser,
    getErrorMessage: (error: unknown) =>
      error instanceof ApiError ? error.message : "Something went wrong",
  };
}
