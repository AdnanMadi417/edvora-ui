import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

import { DISABLED_ROUTE_PREFIXES } from "./config/featureFlags";
import { classifyAuthFailure } from "./lib/authFailure";

const publicRoutes = ["/auth/sign-in", "/apply-as-adviser", "/apply-as-adviser/verify", "/auth/forgot-password", "/auth/reset-password", "/auth/staff-invitation", "/team/verify-otp", "/team/accept-invite", "/reset-password", "/unauthorized", "/", "/api/health", "/api/auth/logout", "/api/telemetry/client-event"];

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
  reviewer: "/reviewer/advisors",
  data_entry: "/data-entry/knowledge-hub",
};

// How long to wait for the backend's answer about a token before treating
// the session as unavailable. A hung backend must not hang every page.
const SESSION_CHECK_TIMEOUT_MS = 5000;

// What the backend said about the token (UBX-423):
// - "role":        verified and the role is known.
// - "denied":      a definite no — bad signature, or a JSON 401/403 from our API.
// - "unavailable": we could not get an answer (timeout, 5xx, 429, a response
//                  generated at the edge such as a Cloudflare block or
//                  challenge, or no backend URL). Not a reason to log anyone out.
type SessionResolution = { kind: "role"; role: string } | { kind: "denied" } | { kind: "unavailable" };

// Verifies the token's signature (and standard exp claim) with jose — the
// role used for routing decisions comes only from a verified /auth/me call
// afterward, never from the separate, user-editable `userRole` cookie or
// from the JWT's own payload (the real backend token carries no role
// claim).
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

function timeoutSignal(ms: number): AbortSignal | undefined {
  return typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(ms) : undefined;
}

async function fetchRole(token: string): Promise<SessionResolution> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("[middleware] NEXT_PUBLIC_API_URL is not configured — cannot resolve role.");
    return { kind: "unavailable" };
  }
  try {
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: timeoutSignal(SESSION_CHECK_TIMEOUT_MS),
      cache: "no-store",
    });
    const contentType = res.headers.get("content-type");
    const isJson = !!contentType && /application\/json/i.test(contentType);

    if (res.ok) {
      if (!isJson) return { kind: "unavailable" };
      const data = await res.json().catch(() => null);
      return typeof data?.role === "string" ? { kind: "role", role: data.role } : { kind: "unavailable" };
    }

    const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");
    const kind = classifyAuthFailure({
      status: res.status,
      contentType,
      body,
      mitigated: res.headers.has("cf-mitigated"),
    });
    return kind === "unavailable" ? { kind: "unavailable" } : { kind: "denied" };
  } catch {
    return { kind: "unavailable" };
  }
}

async function resolveSession(token: string): Promise<SessionResolution> {
  if (!(await verifyToken(token))) return { kind: "denied" };
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

function isPublicPath(pathname: string): boolean {
  return publicRoutes.includes(pathname) || publicRoutePrefixes.some((p) => pathname.startsWith(p));
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const isSignIn = pathname === "/auth/sign-in";

  // Public pages other than sign-in never need the session, so they never
  // cost a backend call. Sign-in needs it to bounce an already-signed-in user
  // to their home page.
  if (isPublicPath(pathname) && !isSignIn) {
    return NextResponse.next();
  }

  if (!token) {
    return isSignIn ? NextResponse.next() : redirectToSignIn(req);
  }

  const session = await resolveSession(token);

  if (isSignIn) {
    if (session.kind === "role") {
      return NextResponse.redirect(redirectTo(req, roleHomePaths[session.role] ?? "/unauthorized"));
    }
    // Denied or unavailable: render sign-in normally, never bounce. A denied
    // token is dead weight, so drop it; an unavailable answer keeps it.
    const res = NextResponse.next();
    if (session.kind === "denied") {
      res.cookies.delete("token");
      res.cookies.delete("userRole");
    }
    return res;
  }

  if (session.kind === "denied") {
    return redirectToSignIn(req);
  }

  if (session.kind === "unavailable") {
    // The signature verified but the backend could not confirm the role.
    // Redirecting here would either log the user out on a transient failure
    // or start a sign-in ↔ home loop. Let the page render: RoleGuard shows
    // "Can't reach the server" and never renders role content without a
    // confirmed session, and the client retries with backoff.
    return NextResponse.next();
  }

  const role = session.role;

  for (const [prefix, allowedRoles] of Object.entries(protectedPrefixes)) {
    if (matchesPrefix(pathname, prefix)) {
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(redirectTo(req, "/unauthorized"));
      }
      break;
    }
  }

  // Features that are merged but not released yet. Checked after the role
  // loop so a wrong-role request still gets the honest "unauthorized"
  // answer; an allowed user just lands back on their home page. See
  // config/featureFlags.ts.
  if (DISABLED_ROUTE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return NextResponse.redirect(redirectTo(req, roleHomePaths[role] ?? "/unauthorized"));
  }

  return NextResponse.next();
}

export const config = {
  // Static files (images, fonts, scripts, manifests) are excluded so a page
  // load does not trigger one backend session check per asset.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|map|woff|woff2|ttf|otf|txt|xml|json|webmanifest)$).*)",
  ],
};
