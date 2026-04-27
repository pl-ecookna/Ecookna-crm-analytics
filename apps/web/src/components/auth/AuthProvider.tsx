import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createApiClient } from "@ecookna/api-client";
import type { AuthUser, AuthLoginRequest } from "@ecookna/shared-types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: AuthLoginRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const api = createApiClient(import.meta.env.VITE_API_BASE_URL || "");

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = async () => {
    try {
      const response = await api.me();
      if (response.user) {
        setUser(response.user);
        setStatus("authenticated");
        return response.user;
      }

      setUser(null);
      setStatus("unauthenticated");
      return null;
    } catch (error) {
      console.error("Failed to restore auth session:", error);
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const login = async (payload: AuthLoginRequest) => {
    const response = await api.login(payload);
    setUser(response.user);
    setStatus("authenticated");
    return response.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated" && !!user,
    login,
    logout,
    refresh,
  }), [user, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
