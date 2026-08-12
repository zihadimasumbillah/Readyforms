"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { initializeAuthClient } from "@/lib/api/auth-service";

export function AuthClientInitializer() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      const token = (session.user as any).backendToken;
      initializeAuthClient(() => token);
    } else {
      initializeAuthClient(() => null);
    }
  }, [session]);

  return null;
}
