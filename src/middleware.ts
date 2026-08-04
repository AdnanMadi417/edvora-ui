import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/auth/sign-in", "/auth/register", "/auth/forgot-password", "/auth/partner-reset-password", "/reset-password", "/unauthorized", "/", "/api/health", "/api/auth/logout"];

const protectedPrefixes: Record<string, string[]> = {
  "/admin": ["admin"],
  "/partner": ["partner"],
  "/account-manager": ["account_manager", "admin"],
  "/reviewer": ["reviewer", "admin"],
  "/data-entry": ["data_entry", "admin"],
};

const roleHomePaths: Record<string, string> = {
  admin: "/admin/applications",
  partner: "/partner/applications",
  account_manager: "/account-manager/applications",
  reviewer: "/reviewer/partners",
  data_entry: "/data-entry/universities",
};

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function redirectTo(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  return url;
}

function redirectToSignIn(req: NextRequest) {
  const res = NextResponse.redirect(redirectTo(req, "/auth/sign-in"));
  res.cookies.delete("token");
  res.cookies.delete("userRole");
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("userRole")?.value;

  if (pathname === "/auth/sign-in" && token && !isTokenExpired(token)) {
    const destination = (role && roleHomePaths[role]) ?? "/unauthorized";
    return NextResponse.redirect(redirectTo(req, destination));
  }

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (!token || isTokenExpired(token)) {
    return redirectToSignIn(req);
  }

  if (!role) {
    return redirectToSignIn(req);
  }

  for (const [prefix, allowedRoles] of Object.entries(protectedPrefixes)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(redirectTo(req, "/unauthorized"));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
