import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";

const providers: any[] = [];

if (process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim()) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

providers.push(
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      otp: { label: "OTP", type: "text" },
      isOtp: { label: "Is OTP", type: "text" },
    },
    async authorize(credentials) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || "https://readyforms-api.vercel.app/api";

        if (credentials?.isOtp === "true" && credentials?.otp) {
          const response = await axios.post(`${apiUrl}/auth/verify-otp`, {
            email: credentials?.email,
            otp: credentials?.otp,
          });

          if (response.data && response.data.token && response.data.user) {
            return {
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.name,
              image: null,
              backendToken: response.data.token,
              isAdmin: Boolean(response.data.user.isAdmin),
            };
          }
          return null;
        }

        const response = await axios.post(`${apiUrl}/auth/login`, {
          email: credentials?.email,
          password: credentials?.password,
        });

        if (response.data && response.data.token && response.data.user) {
          return {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name,
            image: null,
            backendToken: response.data.token,
            isAdmin: Boolean(response.data.user.isAdmin),
          };
        }
        return null;
      } catch (error: any) {
        console.error("Credentials authorize error:", error?.response?.data || error.message);
        return null;
      }
    },
  })
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  trustHost: true,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || "https://readyforms-api.vercel.app/api";
          const response = await axios.post(`${apiUrl}/auth/google-callback`, {
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: account.providerAccountId,
          });
          if (response.data && response.data.token) {
            (user as any).backendToken = response.data.token;
            (user as any).isAdmin = Boolean(response.data.user?.isAdmin);
            if (response.data.user?.id) {
              (user as any).id = response.data.user.id;
            }
            return true;
          }
        } catch (err: any) {
          console.error("Google OAuth backend sync error in signIn callback:", err?.response?.data || err.message);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && (user?.email || token.email)) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || "https://readyforms-api.vercel.app/api";
          const response = await axios.post(`${apiUrl}/auth/google-callback`, {
            email: user?.email || token.email,
            name: user?.name || token.name,
            image: user?.image || token.picture,
            googleId: account.providerAccountId,
          });
          if (response.data && response.data.token && response.data.user) {
            token.id = response.data.user.id;
            token.backendToken = response.data.token;
            token.isAdmin = Boolean(response.data.user.isAdmin);
          }
        } catch (err: any) {
          console.error("Google OAuth backend sync error in jwt callback:", err?.response?.data || err.message);
        }
      } else if (user) {
        token.id = (user as any).id || user.id || token.sub;
        token.backendToken = (user as any).backendToken || token.backendToken;
        token.isAdmin = Boolean((user as any).isAdmin);
      } else if ((!token.backendToken || typeof token.backendToken !== 'string' || token.backendToken.startsWith('oauth-token-')) && token.email) {
        // Auto-heal existing session cookies with backend JWT & UUID
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || "https://readyforms-api.vercel.app/api";
          const response = await axios.post(`${apiUrl}/auth/google-callback`, {
            email: token.email,
            name: token.name || token.email.split('@')[0],
          });
          if (response.data && response.data.token && response.data.user) {
            token.id = response.data.user.id;
            token.backendToken = response.data.token;
            token.isAdmin = Boolean(response.data.user.isAdmin);
          }
        } catch (err: any) {
          console.error("Auto-heal backend sync error in jwt callback:", err?.response?.data || err.message);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).backendToken = token.backendToken;
        (session.user as any).isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "5562ddd89f11888122e29b1254e98b2247e4fffa8ae77acaa7a043833ffb6e85",
});
