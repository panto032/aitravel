import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthApi = pathname.startsWith("/api/auth");

  // Allow public routes and auth API
  if (isPublicRoute || isAuthApi) {
    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Admin routes - check role via JWT
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const role = req.auth?.user?.role;
    if (role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)",
  ],
};
