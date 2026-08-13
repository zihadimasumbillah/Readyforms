import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
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

  const session = req.cookies.get("next-auth.session-token")?.value || 
                  req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!session) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin")) {
    try {
      const token = JSON.parse(atob(session.split(".")[1]));
      if (!token?.isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/auth).*)'],
};
