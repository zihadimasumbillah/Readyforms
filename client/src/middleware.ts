import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const { pathname } = req.nextUrl;

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
    "/api/auth",
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

  if (!isAuthenticated) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && !(req.auth?.user as any)?.isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};
