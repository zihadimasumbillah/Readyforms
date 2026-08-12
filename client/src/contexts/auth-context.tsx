"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

export { useAuth };

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  language?: string;
  theme?: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
