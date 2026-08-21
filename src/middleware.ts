import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/auth/sign-in", "/auth/register", "/register/verify", "/auth/forgot-password", "/auth/partner-reset-password", "/auth/staff-invitation", "/team/verify-otp", "/team/accept-invite", "/reset-password", "/unauthorized", "/", "/api/health", "/api/auth/logout"];

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

// Verifies the token's signature (and standard exp claim) with jose — the
// role used for routing decisions comes only from this verified payload,
// never from the separate, user-editable `userRole` cookie. Any failure
// (bad signature, expired, missing secret, malformed token) resolves to
// "no role" rather than falling back to trusting anything client-supplied.
async function getVerifiedRole(token: string): Promise<string | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("[middleware] JWT_SECRET is not configured — rejecting all tokens.");
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const role = token ? await getVerifiedRole(token) : null;

  if (pathname === "/auth/sign-in" && role) {
    const destination = roleHomePaths[role] ?? "/unauthorized";
    return NextResponse.redirect(redirectTo(req, destination));
  }

  if (publicRoutes.includes(pathname)) {
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
