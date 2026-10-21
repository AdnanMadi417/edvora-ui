/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

// jose is ESM-only, which this jest setup does not transform; the signature
// check is jose's job, so it is mocked: "good-*" tokens verify, others fail.
jest.mock("jose", () => ({
  jwtVerify: jest.fn((token: string) =>
    token.startsWith("good-") ? Promise.resolve({ payload: {}, protectedHeader: {} }) : Promise.reject(new Error("bad signature")),
  ),
}));

const API_URL = "https://api.test";
process.env.AUTH_SECRET_KEY = "test-secret-at-least-32-characters-long!!";
process.env.NEXT_PUBLIC_API_URL = API_URL;

import { middleware } from "./middleware";

const fetchMock = jest.fn();
const CF_PAGE = "<!DOCTYPE html><html><head><title>Just a moment...</title></head></html>";

async function token(kind: "good" | "bad" = "good") {
  return `${kind}-token`;
}

function request(path: string, jwt?: string) {
  return new NextRequest(`https://app.test${path}`, {
    headers: jwt ? { cookie: `token=${jwt}; userRole=partner` } : {},
  });
}

const backend = {
  role: (role: string) =>
    new Response(JSON.stringify({ id: "user-1", role }), { status: 200, headers: { "content-type": "application/json" } }),
  status: (status: number, body: unknown = { detail: "x" }) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }),
  cloudflare: (status: number) =>
    new Response(CF_PAGE, { status, headers: { "content-type": "text/html", "cf-mitigated": "challenge" } }),
};

const location = (res: Response) => {
  const value = res.headers.get("location");
  return value ? new URL(value).pathname : null;
};
const clearsToken = (res: Response) => /(^|,\s*)token=;/.test(res.headers.get("set-cookie") ?? "");

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("middleware", () => {
  it("lets a verified token with an allowed role through, with one backend call", async () => {
    fetchMock.mockResolvedValue(backend.role("partner"));
    const res = await middleware(request("/partner/applications", await token()));
    expect(location(res)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/api/auth/me`);
  });

  it("sends a verified token with the wrong role to /unauthorized", async () => {
    fetchMock.mockResolvedValue(backend.role("admin"));
    const res = await middleware(request("/partner/applications", await token()));
    expect(location(res)).toBe("/unauthorized");
  });

  it("sends a badly signed token to sign-in and clears it, without calling the backend", async () => {
    const res = await middleware(request("/partner/applications", await token("bad")));
    expect(location(res)).toBe("/auth/sign-in");
    expect(clearsToken(res)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a token the backend rejects (JSON 401) to sign-in and clears it", async () => {
    fetchMock.mockResolvedValue(backend.status(401, { detail: { code: "auth_invalid_token" } }));
    const res = await middleware(request("/partner/applications", await token()));
    expect(location(res)).toBe("/auth/sign-in");
    expect(clearsToken(res)).toBe(true);
  });

  it("treats a JSON 403 (inactive user) as denied too", async () => {
    fetchMock.mockResolvedValue(backend.status(403, { detail: { code: "auth_inactive_user" } }));
    const res = await middleware(request("/partner/applications", await token()));
    expect(location(res)).toBe("/auth/sign-in");
  });

  describe.each([
    ["503 from the backend", () => backend.status(503, { detail: "down" })],
    ["429 from the backend", () => backend.status(429, { detail: "slow down" })],
    ["a Cloudflare challenge page", () => backend.cloudflare(403)],
    ["a Cloudflare 5xx page", () => backend.cloudflare(522)],
    ["a 200 that is not JSON", () => new Response(CF_PAGE, { status: 200, headers: { "content-type": "text/html" } })],
  ])("when the session check answers with %s", (_label, response) => {
    it("lets the protected page render instead of logging the user out (RoleGuard takes over)", async () => {
      fetchMock.mockResolvedValue(response());
      const res = await middleware(request("/partner/applications", await token()));
      expect(location(res)).toBeNull();
      expect(clearsToken(res)).toBe(false);
    });

    it("renders the sign-in page without bouncing", async () => {
      fetchMock.mockResolvedValue(response());
      const res = await middleware(request("/auth/sign-in", await token()));
      expect(location(res)).toBeNull();
      expect(clearsToken(res)).toBe(false);
    });
  });

  it("treats a network failure or timeout as unavailable", async () => {
    fetchMock.mockRejectedValue(new Error("fetch failed"));
    const res = await middleware(request("/partner/applications", await token()));
    expect(location(res)).toBeNull();
    expect(clearsToken(res)).toBe(false);
  });

  it("bounces a signed-in user from sign-in to their home page", async () => {
    fetchMock.mockResolvedValue(backend.role("partner"));
    const res = await middleware(request("/auth/sign-in", await token()));
    expect(location(res)).toBe("/partner/applications");
  });

  it("renders sign-in and drops a token the backend rejects", async () => {
    fetchMock.mockResolvedValue(backend.status(401));
    const res = await middleware(request("/auth/sign-in", await token()));
    expect(location(res)).toBeNull();
    expect(clearsToken(res)).toBe(true);
  });

  it("sends a visitor without a token to sign-in, without calling the backend", async () => {
    const res = await middleware(request("/partner/applications"));
    expect(location(res)).toBe("/auth/sign-in");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["/apply-as-adviser", "/auth/forgot-password", "/api/health", "/api/auth/logout", "/api/telemetry/client-event", "/p/some-partner"])(
    "never calls the backend for the public route %s, even with a token",
    async (path) => {
      const res = await middleware(request(path, await token()));
      expect(location(res)).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
});
