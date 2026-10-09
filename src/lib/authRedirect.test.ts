import Cookies from "js-cookie";

jest.mock("./clientTelemetry", () => ({ reportClientEvent: jest.fn() }));

import { reportClientEvent } from "./clientTelemetry";
import {
  AUTH_LOOP_BREAKER_EVENT,
  AUTH_LOOP_BREAKER_STORAGE_KEY,
  AUTH_LOOP_BREAKER_WINDOW_MS,
  SIGN_IN_URL,
  UNAUTHORIZED_URL,
  __resetAuthRedirectState,
  authRedirectNavigator,
  isAuthLoopBreakerTripped,
  recordAuthRedirect,
  redirectToSignIn,
  redirectToUnauthorized,
  resetAuthLoopBreaker,
  setLoggingOut,
} from "./authRedirect";

const mockedReport = reportClientEvent as jest.Mock;
let replace: jest.SpyInstance;

beforeEach(() => {
  sessionStorage.clear();
  __resetAuthRedirectState();
  mockedReport.mockReset();
  replace = jest.spyOn(authRedirectNavigator, "replace").mockImplementation(() => undefined);
  jest.spyOn(console, "warn").mockImplementation(() => undefined);
  Cookies.remove("token", { path: "/" });
  Cookies.remove("userRole", { path: "/" });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("loop breaker", () => {
  it("allows three redirects inside the window and trips on the fourth", () => {
    const t = 1_000_000;
    expect(recordAuthRedirect(t)).toBe(true);
    expect(recordAuthRedirect(t + 100)).toBe(true);
    expect(recordAuthRedirect(t + 200)).toBe(true);
    expect(isAuthLoopBreakerTripped(t + 200)).toBe(false);
    expect(recordAuthRedirect(t + 300)).toBe(false);
    expect(isAuthLoopBreakerTripped(t + 300)).toBe(true);
  });

  it("forgets redirects older than the window", () => {
    const t = 1_000_000;
    recordAuthRedirect(t);
    recordAuthRedirect(t + 1);
    recordAuthRedirect(t + 2);
    expect(recordAuthRedirect(t + AUTH_LOOP_BREAKER_WINDOW_MS + 1)).toBe(true);
    expect(isAuthLoopBreakerTripped(t + AUTH_LOOP_BREAKER_WINDOW_MS + 1)).toBe(false);
  });

  it("persists across page loads through sessionStorage", () => {
    recordAuthRedirect(5_000);
    expect(JSON.parse(sessionStorage.getItem(AUTH_LOOP_BREAKER_STORAGE_KEY) as string)).toEqual([5_000]);
    resetAuthLoopBreaker();
    expect(sessionStorage.getItem(AUTH_LOOP_BREAKER_STORAGE_KEY)).toBeNull();
  });

  it("survives unreadable storage contents", () => {
    sessionStorage.setItem(AUTH_LOOP_BREAKER_STORAGE_KEY, "not json");
    expect(recordAuthRedirect()).toBe(true);
    sessionStorage.setItem(AUTH_LOOP_BREAKER_STORAGE_KEY, JSON.stringify(["x", null, 7]));
    expect(isAuthLoopBreakerTripped()).toBe(false);
  });
});

describe("redirectToSignIn", () => {
  it("clears the token, navigates once, and refuses a second redirect on the same page", () => {
    Cookies.set("token", "abc", { path: "/" });
    Cookies.set("userRole", "partner", { path: "/" });

    expect(redirectToSignIn("test")).toBe("navigated");
    expect(replace).toHaveBeenCalledWith(SIGN_IN_URL);
    expect(Cookies.get("token")).toBeUndefined();
    expect(Cookies.get("userRole")).toBeUndefined();

    expect(redirectToSignIn("again")).toBe("already-scheduled");
    expect(redirectToUnauthorized("again")).toBe("already-scheduled");
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it("does nothing while the user is logging out", () => {
    setLoggingOut(true);
    expect(redirectToSignIn("test")).toBe("logging-out");
    expect(replace).not.toHaveBeenCalled();
  });

  it("stops navigating when the loop breaker trips, keeps the token, and announces it", () => {
    const now = Date.now();
    sessionStorage.setItem(AUTH_LOOP_BREAKER_STORAGE_KEY, JSON.stringify([now - 3000, now - 2000, now - 1000]));
    Cookies.set("token", "abc", { path: "/" });
    const listener = jest.fn();
    window.addEventListener(AUTH_LOOP_BREAKER_EVENT, listener);

    expect(redirectToSignIn("role-guard:401")).toBe("loop-breaker");

    expect(replace).not.toHaveBeenCalled();
    expect(Cookies.get("token")).toBe("abc");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(mockedReport).toHaveBeenCalledWith(
      "auth_loop_breaker_tripped",
      expect.objectContaining({ target: "sign-in", reason: "role-guard:401", redirects: 4 }),
    );
    window.removeEventListener(AUTH_LOOP_BREAKER_EVENT, listener);
  });
});

describe("redirectToUnauthorized", () => {
  it("navigates once and keeps the token", () => {
    Cookies.set("token", "abc", { path: "/" });
    expect(redirectToUnauthorized("role-guard:403")).toBe("navigated");
    expect(replace).toHaveBeenCalledWith(UNAUTHORIZED_URL);
    expect(Cookies.get("token")).toBe("abc");
  });

  it("counts toward the loop breaker as well", () => {
    const now = Date.now();
    sessionStorage.setItem(AUTH_LOOP_BREAKER_STORAGE_KEY, JSON.stringify([now - 3000, now - 2000, now - 1000]));
    expect(redirectToUnauthorized("role-guard:403")).toBe("loop-breaker");
    expect(replace).not.toHaveBeenCalled();
  });
});
