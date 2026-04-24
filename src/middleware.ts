import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/auth/sign-in", "/unauthorized", "/", "/api/health"];

const protectedPrefixes: Record<string, string[]> = {
  "/admin": ["admin"],
  "/partner": ["partner"],
  "/account-manager": ["account_manager"],
};

const roleHomePaths: Record<string, string> = {
  admin: "/admin/applications",
  partner: "/partner/applications",
  account_manager: "/account-manager/applications",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("userRole")?.value;

  if (pathname === "/auth/sign-in" && token) {
    const destination = (role && roleHomePaths[role]) ?? "/unauthorized";
    return NextResponse.redirect(new URL(destination, req.url));
  }

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  if (!role) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  for (const [prefix, allowedRoles] of Object.entries(protectedPrefixes)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
