import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Cookies from "js-cookie";

jest.mock("lib/useApi", () => ({ __esModule: true, default: { get: jest.fn() }, publicApi: { get: jest.fn() } }));
jest.mock("lib/clientTelemetry", () => ({ reportClientEvent: jest.fn() }));
jest.mock("features/partners/services", () => ({
  partnersApi: { getProfile: jest.fn(() => Promise.resolve({ data: { type: "individual" } })) },
}));

import api from "lib/useApi";
import { reportClientEvent } from "lib/clientTelemetry";
import { partnersApi } from "features/partners/services";
import {
  AUTH_LOOP_BREAKER_STORAGE_KEY,
  SIGN_IN_URL,
  UNAUTHORIZED_URL,
  __resetAuthRedirectState,
  authRedirectNavigator,
} from "lib/authRedirect";
import RoleGuard from "./RoleGuard";

const mockedGet = api.get as jest.Mock;
const mockedReport = reportClientEvent as jest.Mock;
const mockedProfile = partnersApi.getProfile as jest.Mock;
let replace: jest.SpyInstance;

const httpError = (status: number, data: unknown = { detail: "x" }, contentType = "application/json") =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    response: { status, data, headers: { "content-type": contentType } },
  });
const networkError = () => Object.assign(new Error("Network Error"), { isAxiosError: true, code: "ERR_NETWORK" });

const CF_PAGE = "<!DOCTYPE html><html><head><title>Just a moment...</title></head></html>";

function renderGuard(roles: string[] = ["partner"]) {
  return render(
    <RoleGuard allowedRoles={roles}>
      <div>secret content</div>
    </RoleGuard>,
  );
}

// Flushes the microtasks of one failed /auth/me attempt under fake timers.
const flush = () => act(async () => undefined);

// Walks the automatic retry schedule (1 s, 2 s, 4 s). Each timer is only
// scheduled after the previous attempt fails, so the clock must step.
async function exhaustRetries() {
  for (const delay of [1000, 2000, 4000]) {
    await act(async () => { jest.advanceTimersByTime(delay); });
    await flush();
  }
}

beforeEach(() => {
  mockedGet.mockReset();
  mockedReport.mockReset();
  mockedProfile.mockClear();
  sessionStorage.clear();
  __resetAuthRedirectState();
  replace = jest.spyOn(authRedirectNavigator, "replace").mockImplementation(() => undefined);
  jest.spyOn(console, "warn").mockImplementation(() => undefined);
  Cookies.set("token", "tok", { path: "/" });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("RoleGuard", () => {
  it("renders children for an allowed role after exactly one session call", async () => {
    mockedGet.mockResolvedValue({ data: { id: "u1", role: "partner" } });
    renderGuard(["partner"]);

    expect(await screen.findByText("secret content")).toBeInTheDocument();
    expect(mockedGet).toHaveBeenCalledTimes(1);
    expect(mockedGet).toHaveBeenCalledWith("/auth/me");
    expect(replace).not.toHaveBeenCalled();
    expect(mockedReport).not.toHaveBeenCalled();
  });

  it("loads the partner profile once for a partner, and not for other roles", async () => {
    mockedGet.mockResolvedValue({ data: { id: "u1", role: "partner" } });
    renderGuard(["partner"]);
    await screen.findByText("secret content");
    await waitFor(() => expect(mockedProfile).toHaveBeenCalledTimes(1));

    mockedProfile.mockClear();
    mockedGet.mockResolvedValue({ data: { id: "u2", role: "admin" } });
    renderGuard(["admin"]);
    await screen.findAllByText("secret content");
    expect(mockedProfile).not.toHaveBeenCalled();
  });

  it("accepts the role case-insensitively", async () => {
    mockedGet.mockResolvedValue({ data: { id: "u1", role: "Admin" } });
    renderGuard(["admin"]);
    expect(await screen.findByText("secret content")).toBeInTheDocument();
  });

  it("sends a role the layout does not allow to /unauthorized exactly once, keeping the token", async () => {
    mockedGet.mockResolvedValue({ data: { id: "u1", role: "admin" } });
    renderGuard(["partner"]);

    await waitFor(() => expect(replace).toHaveBeenCalledWith(UNAUTHORIZED_URL));
    expect(replace).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("secret content")).toBeNull();
    expect(Cookies.get("token")).toBe("tok");
  });

  it("401: clears the token and goes to sign-in exactly once, without retrying", async () => {
    mockedGet.mockRejectedValue(httpError(401, { detail: { code: "auth_invalid_token" } }));
    renderGuard();

    await waitFor(() => expect(replace).toHaveBeenCalledWith(SIGN_IN_URL));
    expect(replace).toHaveBeenCalledTimes(1);
    expect(mockedGet).toHaveBeenCalledTimes(1);
    expect(Cookies.get("token")).toBeUndefined();
    expect(screen.queryByText("secret content")).toBeNull();
  });

  it("403: goes to /unauthorized exactly once and keeps the token", async () => {
    mockedGet.mockRejectedValue(httpError(403, { detail: { code: "auth_inactive_user" } }));
    renderGuard();

    await waitFor(() => expect(replace).toHaveBeenCalledWith(UNAUTHORIZED_URL));
    expect(replace).toHaveBeenCalledTimes(1);
    expect(mockedGet).toHaveBeenCalledTimes(1);
    expect(Cookies.get("token")).toBe("tok");
  });

  describe.each([
    ["429", () => httpError(429, { detail: "Too Many Requests" })],
    ["500", () => httpError(500, { detail: "Internal Server Error" })],
    ["network error", networkError],
    ["Cloudflare 403 page", () => httpError(403, CF_PAGE, "text/html")],
  ])("%s", (_label, makeError) => {
    it("stays on the page, retries 3 times with backoff, then shows the error state with Retry", async () => {
      jest.useFakeTimers();
      mockedGet.mockImplementation(() => Promise.reject(makeError()));
      renderGuard();
      await flush();
      expect(mockedGet).toHaveBeenCalledTimes(1);

      await act(async () => { jest.advanceTimersByTime(999); });
      expect(mockedGet).toHaveBeenCalledTimes(1);
      await act(async () => { jest.advanceTimersByTime(1); });
      await flush();
      expect(mockedGet).toHaveBeenCalledTimes(2);

      await act(async () => { jest.advanceTimersByTime(2000); });
      await flush();
      expect(mockedGet).toHaveBeenCalledTimes(3);

      await act(async () => { jest.advanceTimersByTime(4000); });
      await flush();
      expect(mockedGet).toHaveBeenCalledTimes(4);

      expect(screen.getByTestId("auth-error-unavailable")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      expect(screen.queryByText("secret content")).toBeNull();

      // Blocked for a long time: no further calls and no navigation.
      await act(async () => { jest.advanceTimersByTime(60_000); });
      expect(mockedGet).toHaveBeenCalledTimes(4);
      expect(replace).not.toHaveBeenCalled();
      expect(Cookies.get("token")).toBe("tok");
      expect(mockedReport).toHaveBeenCalledWith("auth_guard_error_state", expect.objectContaining({ kind: "unavailable", attempts: 4 }));
    });
  });

  it("Retry runs a fresh round of session checks and recovers", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockedGet.mockImplementation(() => Promise.reject(httpError(503, { detail: "down" })));
    renderGuard();
    await flush();
    await exhaustRetries();
    expect(screen.getByTestId("auth-error-unavailable")).toBeInTheDocument();
    expect(mockedGet).toHaveBeenCalledTimes(4);

    mockedGet.mockResolvedValue({ data: { id: "u1", role: "partner" } });
    await user.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => expect(screen.getByText("secret content")).toBeInTheDocument());
    expect(mockedGet).toHaveBeenCalledTimes(5);
    expect(replace).not.toHaveBeenCalled();
  });

  it("loop breaker: after three recent redirects a 401 shows the error state instead of navigating", async () => {
    const now = Date.now();
    sessionStorage.setItem(AUTH_LOOP_BREAKER_STORAGE_KEY, JSON.stringify([now - 3000, now - 2000, now - 1000]));
    mockedGet.mockRejectedValue(httpError(401));
    renderGuard();

    expect(await screen.findByTestId("auth-error-loop")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(Cookies.get("token")).toBe("tok");
    expect(mockedReport).toHaveBeenCalledWith("auth_loop_breaker_tripped", expect.objectContaining({ target: "sign-in" }));
  });
});
