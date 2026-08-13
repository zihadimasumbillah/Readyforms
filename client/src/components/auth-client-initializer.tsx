"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { initializeAuthClient } from "@/lib/api/auth-service";

export function AuthClientInitializer() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.backendToken) {
      const token = session.user.backendToken;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token);
      }
      initializeAuthClient(() => token);
    }
  }, [session]);

  return null;
}
