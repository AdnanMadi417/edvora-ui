import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // PUBLIC PAGES (login/signup)
  const PUBLIC_ROUTES = ["/admin/login", "/partner/login", "/partner/signup"];
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();

  // Get role from cookie (or localStorage via client-side hook)
  const role = req.cookies.get("role")?.value;

  // Protect admin pages
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Protect partner pages
  if (pathname.startsWith("/partner") && role !== "partner") {
    return NextResponse.redirect(new URL("/partner/login", req.url));
  }

  return NextResponse.next();
}

// Apply middleware to all admin and partner routes
export const config = {
  matcher: ["/admin/:path*", "/partner/:path*"],
};
