import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/auth/sign-in", "/auth/register", "/register/verify", "/auth/forgot-password", "/auth/partner-reset-password", "/auth/staff-invitation", "/team/verify-otp", "/team/accept-invite", "/reset-password", "/unauthorized", "/", "/api/health", "/api/auth/logout", "/university-profile-demo"];

// Prefixes rather than exact paths — for public routes with a dynamic
// segment (e.g. /p/[slug], the shareable partner profile).
const publicRoutePrefixes = ["/p/"];

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
  data_entry: "/data-entry/knowledge-hub",
};

// Verifies the token's signature (and standard exp claim) with jose — the
// role used for routing decisions comes only from a verified /auth/me call
// afterward, never from the separate, user-editable `userRole` cookie or
// from the JWT's own payload (the real backend token carries no role
// claim). Any failure (bad signature, expired, missing secret, malformed
// token, unreachable /auth/me) resolves to "no role" rather than falling
// back to anything client-supplied.
async function verifyToken(token: string): Promise<boolean> {
  const secret = process.env.AUTH_SECRET_KEY;
  if (!secret) {
    console.error("[middleware] AUTH_SECRET_KEY is not configured — rejecting all tokens.");
    return false;
  }
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

async function fetchRole(token: string): Promise<string | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("[middleware] NEXT_PUBLIC_API_URL is not configured — cannot resolve role.");
    return null;
  }
  try {
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.role === "string" ? data.role : null;
  } catch {
    return null;
  }
}

async function getVerifiedRole(token: string): Promise<string | null> {
  if (!(await verifyToken(token))) return null;
  return fetchRole(token);
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const role = token ? await getVerifiedRole(token) : null;

  if (pathname === "/auth/sign-in" && role) {
    const destination = roleHomePaths[role] ?? "/unauthorized";
    return NextResponse.redirect(redirectTo(req, destination));
  }

  if (publicRoutes.includes(pathname) || publicRoutePrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (!token || !role) {
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
