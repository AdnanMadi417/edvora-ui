import { classifyAuthFailure, classifyRequestError, requestErrorStatus } from "./authFailure";

const JSON_TYPE = "application/json";
const HTML_TYPE = "text/html; charset=UTF-8";
const CF_PAGE = "<!DOCTYPE html><html><head><title>Just a moment...</title></head></html>";

describe("classifyAuthFailure", () => {
  it("treats a missing status (network error, CORS-hidden edge response) as unavailable", () => {
    expect(classifyAuthFailure({})).toBe("unavailable");
    expect(classifyAuthFailure({ status: null })).toBe("unavailable");
    expect(classifyAuthFailure({ status: 0 })).toBe("unavailable");
  });

  it("treats a JSON 401 from our backend as unauthenticated", () => {
    expect(classifyAuthFailure({ status: 401, contentType: JSON_TYPE, body: { detail: { code: "auth_invalid_token" } } })).toBe("unauthenticated");
    expect(classifyAuthFailure({ status: 401 })).toBe("unauthenticated");
  });

  it("treats a JSON 403 from our backend as forbidden", () => {
    expect(classifyAuthFailure({ status: 403, contentType: JSON_TYPE, body: { detail: { code: "auth_inactive_user" } } })).toBe("forbidden");
    expect(classifyAuthFailure({ status: 403, body: { detail: "Access denied" } })).toBe("forbidden");
  });

  it("never treats a Cloudflare-generated 401/403 as a definite answer", () => {
    expect(classifyAuthFailure({ status: 403, contentType: HTML_TYPE, body: CF_PAGE })).toBe("unavailable");
    expect(classifyAuthFailure({ status: 403, body: CF_PAGE })).toBe("unavailable");
    expect(classifyAuthFailure({ status: 403, contentType: JSON_TYPE, body: {}, mitigated: true })).toBe("unavailable");
    expect(classifyAuthFailure({ status: 401, contentType: HTML_TYPE, body: CF_PAGE })).toBe("unavailable");
  });

  it("treats a 403 without a JSON body as unavailable", () => {
    expect(classifyAuthFailure({ status: 403, contentType: "text/plain", body: "blocked" })).toBe("unavailable");
  });

  it("treats rate limits, server errors and anything else as unavailable", () => {
    for (const status of [400, 404, 408, 429, 500, 502, 503, 504, 520, 522, 524]) {
      expect(classifyAuthFailure({ status, contentType: JSON_TYPE, body: { detail: "x" } })).toBe("unavailable");
    }
  });
});

describe("classifyRequestError", () => {
  const axiosError = (status: number, data: unknown, headers: Record<string, string> = { "content-type": JSON_TYPE }) => ({
    isAxiosError: true,
    message: `Request failed with status code ${status}`,
    response: { status, data, headers },
  });

  it("reads an axios-shaped error", () => {
    expect(classifyRequestError(axiosError(401, { detail: "x" }))).toBe("unauthenticated");
    expect(classifyRequestError(axiosError(403, { detail: "x" }))).toBe("forbidden");
    expect(classifyRequestError(axiosError(429, { detail: "x" }))).toBe("unavailable");
    expect(classifyRequestError(axiosError(500, { detail: "x" }))).toBe("unavailable");
  });

  it("treats a response-less error as unavailable", () => {
    expect(classifyRequestError({ isAxiosError: true, message: "Network Error", code: "ERR_NETWORK" })).toBe("unavailable");
    expect(classifyRequestError(new Error("boom"))).toBe("unavailable");
    expect(classifyRequestError(null)).toBe("unavailable");
  });

  it("recognises a mitigated or HTML 403 from the edge", () => {
    expect(classifyRequestError(axiosError(403, CF_PAGE, { "content-type": HTML_TYPE }))).toBe("unavailable");
    expect(classifyRequestError(axiosError(403, {}, { "content-type": JSON_TYPE, "cf-mitigated": "challenge" }))).toBe("unavailable");
  });

  it("reads headers exposed through a get() method too", () => {
    const headers = { get: (name: string) => (name === "content-type" ? JSON_TYPE : null) };
    expect(classifyRequestError({ response: { status: 403, data: { detail: "x" }, headers } })).toBe("forbidden");
  });
});

describe("requestErrorStatus", () => {
  it("returns the status or null", () => {
    expect(requestErrorStatus({ response: { status: 503 } })).toBe(503);
    expect(requestErrorStatus({ message: "Network Error" })).toBeNull();
    expect(requestErrorStatus(undefined)).toBeNull();
  });
});
