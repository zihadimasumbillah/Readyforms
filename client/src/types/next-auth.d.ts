import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    isAdmin?: boolean;
    backendToken?: string;
  }

  interface Session {
    user?: {
      id?: string;
      isAdmin?: boolean;
      backendToken?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    backendToken?: string;
  }
}
