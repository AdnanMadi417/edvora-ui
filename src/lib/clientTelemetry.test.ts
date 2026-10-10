import { CLIENT_EVENT_URL, identityHints, reportClientEvent } from "./clientTelemetry";

const fetchMock = jest.fn(() => Promise.resolve());

beforeEach(() => {
  localStorage.clear();
  fetchMock.mockClear();
  (global as any).fetch = fetchMock;
  Object.defineProperty(navigator, "sendBeacon", { value: undefined, configurable: true });
  jest.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => jest.restoreAllMocks());

const sentPayload = () => JSON.parse((fetchMock.mock.calls[0] as any)[1].body);

describe("reportClientEvent", () => {
  it("posts the event with the page path and the caller's attributes", () => {
    reportClientEvent("auth_guard_error_state", { kind: "unavailable", status: 503, attempts: 4 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect((fetchMock.mock.calls[0] as any)[0]).toBe(CLIENT_EVENT_URL);
    const payload = sentPayload();
    expect(payload.name).toBe("auth_guard_error_state");
    expect(payload.attributes).toMatchObject({ path: "/", kind: "unavailable", status: 503, attempts: 4 });
  });

  it("adds the identity hints sign-in stored, marked as hints", () => {
    localStorage.setItem("partnerId", "partner-1");
    localStorage.setItem("userId", "user-1");
    localStorage.setItem("userRole", "partner");
    reportClientEvent("auth_loop_breaker_tripped", { target: "sign-in", reason: "role-guard:401", redirects: 4 });
    expect(sentPayload().attributes).toMatchObject({
      partner_id_hint: "partner-1",
      user_id_hint: "user-1",
      role_hint: "partner",
      target: "sign-in",
    });
  });

  it("sends no hints when nothing is stored", () => {
    expect(identityHints()).toEqual({});
    reportClientEvent("auth_guard_error_state");
    const attrs = sentPayload().attributes;
    expect(attrs.partner_id_hint).toBeUndefined();
    expect(attrs.user_id_hint).toBeUndefined();
  });

  it("prefers sendBeacon when available", () => {
    const beacon = jest.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", { value: beacon, configurable: true });
    reportClientEvent("auth_guard_error_state");
    expect(beacon).toHaveBeenCalledWith(CLIENT_EVENT_URL, expect.any(Blob));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never throws, even if the transport does", () => {
    fetchMock.mockImplementationOnce(() => { throw new Error("boom"); });
    expect(() => reportClientEvent("auth_guard_error_state")).not.toThrow();
  });
});
