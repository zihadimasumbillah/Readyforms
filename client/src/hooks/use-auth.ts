"use client";

import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useMemo, useCallback, useEffect } from "react";
import { initializeAuthClient } from "@/lib/api/auth-service";

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  language?: string;
  theme?: string;
}

export function useAuth() {
  const { data: session, status, update } = useSession();

  const user = useMemo(() => {
    if (!session?.user) return null;
    return {
      id: session.user.id || "",
      name: session.user.name || "",
      email: session.user.email || "",
      isAdmin: Boolean((session.user as any).isAdmin),
      language: (session.user as any).language,
      theme: (session.user as any).theme,
    } as User;
  }, [session]);

  const token = useMemo(() => (session?.user as any)?.backendToken || null, [session]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
        initializeAuthClient(() => token);
      } else if (status === "unauthenticated") {
        localStorage.removeItem("auth_token");
        initializeAuthClient(() => null);
      }
    }
  }, [token, status]);

  const login = useCallback(async (provider?: "google", _token?: string, _user?: User) => {
    if (provider) {
      window.location.href = `/api/auth/signin/${provider}`;
    }
  }, []);

  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
    await nextAuthSignOut({ redirect: false });
  }, []);

  const isAuthenticated = !!user;
  const isLoading = status === "loading";

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isLoading,
    status,
    updateSession: update,
  };
}
