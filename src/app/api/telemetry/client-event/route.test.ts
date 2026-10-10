/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

const mockEmit = jest.fn();
jest.mock("@opentelemetry/api-logs", () => ({
  logs: { getLogger: () => ({ emit: (...args: unknown[]) => mockEmit(...args) }) },
  SeverityNumber: { WARN: 13 },
}));
jest.mock("jose", () => ({
  jwtVerify: jest.fn((token: string) =>
    token === "good-token"
      ? Promise.resolve({ payload: { sub: "user-1" }, protectedHeader: {} })
      : Promise.reject(new Error("bad signature")),
  ),
}));

process.env.AUTH_SECRET_KEY = "test-secret-at-least-32-characters-long!!";

import { POST } from "./route";

function post(body: unknown, headers: Record<string, string> = {}, ip = "203.0.113.10") {
  return POST(
    new NextRequest("https://app.test/api/telemetry/client-event", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
      headers: { "content-type": "application/json", "cf-connecting-ip": ip, "user-agent": "jest", ...headers },
    }),
  );
}

const emittedAttributes = () => mockEmit.mock.calls[0][0].attributes;

beforeEach(() => {
  mockEmit.mockClear();
  jest.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => jest.restoreAllMocks());

describe("POST /api/telemetry/client-event", () => {
  it("logs the verified user id from the session cookie", async () => {
    const res = await post(
      { name: "auth_guard_error_state", attributes: { kind: "unavailable", status: 503, attempts: 4, path: "/partner/applications", partner_id_hint: "partner-1" } },
      { cookie: "token=good-token" },
    );
    expect(res.status).toBe(202);
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(emittedAttributes()).toMatchObject({
      "event.name": "auth_guard_error_state",
      "enduser.id": "user-1",
      "auth.token": "ok",
      "client.ip": "203.0.113.10",
      "client.kind": "unavailable",
      "client.status": 503,
      "client.attempts": 4,
      "client.path": "/partner/applications",
      "client.partner_id_hint": "partner-1",
    });
  });

  it("records an invalid or missing token instead of trusting the client", async () => {
    await post({ name: "auth_loop_breaker_tripped" }, { cookie: "token=forged" });
    expect(emittedAttributes()["auth.token"]).toBe("invalid");
    expect(emittedAttributes()["enduser.id"]).toBeUndefined();

    mockEmit.mockClear();
    await post({ name: "auth_loop_breaker_tripped" });
    expect(emittedAttributes()["auth.token"]).toBe("missing");
  });

  it("rejects unknown events, bad JSON and oversized bodies without logging", async () => {
    expect((await post({ name: "something_else" })).status).toBe(400);
    expect((await post("not json")).status).toBe(400);
    expect((await post({ name: "auth_guard_error_state", attributes: { x: "a".repeat(3000) } })).status).toBe(413);
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it("drops attributes that are not primitives and caps their length", async () => {
    await post({ name: "auth_guard_error_state", attributes: { nested: { a: 1 }, long: "x".repeat(500), ok: true } });
    const attrs = emittedAttributes();
    expect(attrs["client.nested"]).toBeUndefined();
    expect((attrs["client.long"] as string).length).toBe(200);
    expect(attrs["client.ok"]).toBe(true);
  });

  it("throttles a single IP", async () => {
    let last = 0;
    for (let i = 0; i < 31; i++) last = (await post({ name: "auth_guard_error_state" }, {}, "198.51.100.7")).status;
    expect(last).toBe(429);
    expect((await post({ name: "auth_guard_error_state" }, {}, "198.51.100.8")).status).toBe(202);
  });
});
