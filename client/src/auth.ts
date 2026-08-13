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
    },
    async authorize(credentials) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined.');
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
      } catch (error) {
        console.error("Credentials authorize error:", error);
        return null;
      }
    },
  })
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  trustHost: process.env.AUTH_TRUST_HOST === 'true' ? true : process.env.NODE_ENV !== 'production',
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL is not defined.');
          }
          const response = await axios.post(`${apiUrl}/auth/google-callback`, {
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: account.providerAccountId,
          });
          if (response.data && response.data.token) {
            (user as any).backendToken = response.data.token;
            (user as any).isAdmin = Boolean(response.data.user?.isAdmin);
            return true;
          }
        } catch (err) {
          console.error("Google OAuth backend sync error:", err);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || token.sub;
        token.backendToken = (user as any).backendToken || `oauth-token-${user.email || token.sub}`;
        token.isAdmin = Boolean((user as any).isAdmin);
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
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "5562ddd89f11888122e29b1254e98b2247e4fffa8ae77acaa7a043833ffb6e85",
});
