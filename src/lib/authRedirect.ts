/**
 * The one place the app navigates a user away because of their session.
 *
 * Two guarantees (UBX-423):
 * 1. Single flight: at most one auth redirect per page load, whoever asks
 *    first (RoleGuard, or the axios interceptor on any API call).
 * 2. Loop breaker: redirects are counted in sessionStorage. More than
 *    AUTH_LOOP_BREAKER_MAX_REDIRECTS inside AUTH_LOOP_BREAKER_WINDOW_MS means
 *    the app is ping-ponging (for example sign-in ↔ role home). We then stop
 *    navigating, tell the UI via a window event, and report it.
 */
import Cookies from "js-cookie";
import { reportClientEvent } from "./clientTelemetry";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const SIGN_IN_URL = `${BASE_PATH}/auth/sign-in`;
export const LOGOUT_URL = `${BASE_PATH}/api/auth/logout`;
export const UNAUTHORIZED_URL = `${BASE_PATH}/unauthorized`;

export const AUTH_LOOP_BREAKER_STORAGE_KEY = "ubx.auth-redirects";
export const AUTH_LOOP_BREAKER_WINDOW_MS = 30_000;
export const AUTH_LOOP_BREAKER_MAX_REDIRECTS = 3;
export const AUTH_LOOP_BREAKER_EVENT = "ubx:auth-loop-breaker";

export type AuthRedirectTarget = "sign-in" | "unauthorized";
export type AuthRedirectOutcome = "navigated" | "already-scheduled" | "loop-breaker" | "logging-out";

/** Indirection so tests can observe navigation without touching window.location. */
export const authRedirectNavigator = {
  replace(url: string): void {
    window.location.replace(url);
  },
};

let redirectScheduled = false;
let loggingOut = false;

export const setLoggingOut = (value: boolean): void => {
  loggingOut = value;
};

function readRedirectTimestamps(): number[] {
  try {
    const raw = sessionStorage.getItem(AUTH_LOOP_BREAKER_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((t): t is number => typeof t === "number") : [];
  } catch {
    return [];
  }
}

function writeRedirectTimestamps(timestamps: number[]): void {
  try {
    sessionStorage.setItem(AUTH_LOOP_BREAKER_STORAGE_KEY, JSON.stringify(timestamps));
  } catch {
    // Storage unavailable (private mode, quota). The single-flight flag still protects this page load.
  }
}

export function recentAuthRedirects(now: number = Date.now()): number[] {
  return readRedirectTimestamps().filter((t) => now - t >= 0 && now - t < AUTH_LOOP_BREAKER_WINDOW_MS);
}

/** Records one redirect. Returns false when it is one too many for the window (loop breaker trips). */
export function recordAuthRedirect(now: number = Date.now()): boolean {
  const recent = recentAuthRedirects(now);
  recent.push(now);
  writeRedirectTimestamps(recent);
  return recent.length <= AUTH_LOOP_BREAKER_MAX_REDIRECTS;
}

export function isAuthLoopBreakerTripped(now: number = Date.now()): boolean {
  return recentAuthRedirects(now).length > AUTH_LOOP_BREAKER_MAX_REDIRECTS;
}

export function resetAuthLoopBreaker(): void {
  try {
    sessionStorage.removeItem(AUTH_LOOP_BREAKER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function redirectForAuth(target: AuthRedirectTarget, reason: string): AuthRedirectOutcome {
  if (typeof window === "undefined") return "already-scheduled";
  if (loggingOut) return "logging-out";
  if (redirectScheduled) return "already-scheduled";
  redirectScheduled = true;

  if (!recordAuthRedirect()) {
    const redirects = recentAuthRedirects().length;
    console.warn(`[auth] loop breaker tripped: ${redirects} redirects in ${AUTH_LOOP_BREAKER_WINDOW_MS / 1000}s (last: ${target}, ${reason})`);
    reportClientEvent("auth_loop_breaker_tripped", { target, reason, redirects, window_ms: AUTH_LOOP_BREAKER_WINDOW_MS });
    window.dispatchEvent(new CustomEvent(AUTH_LOOP_BREAKER_EVENT, { detail: { target, reason } }));
    return "loop-breaker";
  }

  if (target === "sign-in") {
    // The backend rejected this token, so it is dead weight. Dropping it also
    // stops the middleware from bouncing sign-in back to the role home.
    Cookies.remove("token", { path: "/" });
    Cookies.remove("userRole", { path: "/" });
  }
  authRedirectNavigator.replace(target === "sign-in" ? SIGN_IN_URL : UNAUTHORIZED_URL);
  return "navigated";
}

export const redirectToSignIn = (reason: string): AuthRedirectOutcome => redirectForAuth("sign-in", reason);
export const redirectToUnauthorized = (reason: string): AuthRedirectOutcome => redirectForAuth("unauthorized", reason);

/** Test-only: forget the per-page-load state. */
export function __resetAuthRedirectState(): void {
  redirectScheduled = false;
  loggingOut = false;
}
