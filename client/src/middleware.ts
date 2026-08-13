import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "5562ddd89f11888122e29b1254e98b2247e4fffa8ae77acaa7a043833ffb6e85",
  });

  // If user is logged in and visits login or register, redirect them to appropriate home
  if (token && (pathname === "/auth/login" || pathname === "/auth/register")) {
    if (token.isAdmin) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Strict Admin Isolation: Admin users accessing /dashboard are redirected to /admin
  if (token && token.isAdmin && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  const publicRoutes = [
    "/",
    "/templates",
    "/templates/create",
    "/templates/preview",
    "/templates/[id]",
    "/about",
    "/pricing",
    "/api-status",
    "/auth/login",
    "/auth/register",
  ];

  const isPublicRoute = publicRoutes.some((route) => {
    if (route.includes("[id]")) {
      const pattern = route.replace("[id]", "[^/]+");
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    return pathname === route || pathname.startsWith(route + "/");
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin")) {
    if (!token?.isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/auth).*)'],
};
