"use client";

import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useMemo, useCallback } from "react";

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
      isAdmin: (session.user as any).isAdmin || false,
      language: (session.user as any).language,
      theme: (session.user as any).theme,
    } as User;
  }, [session]);

  const token = useMemo(() => (session?.user as any)?.backendToken || null, [session]);

  const login = useCallback(async (provider?: "google", _token?: string, _user?: User) => {
    if (provider) {
      window.location.href = `/api/auth/signin/${provider}`;
    }
  }, []);

  const logout = useCallback(async () => {
    await nextAuthSignOut({ redirect: false });
  }, []);

  const isAuthenticated = !!user;

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    status,
    updateSession: update,
  };
}
