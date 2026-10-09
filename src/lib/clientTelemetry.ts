/**
 * Fire-and-forget client events for conditions we want to see in monitoring
 * rather than discover in a security investigation (UBX-423). The browser
 * posts to our own Next.js route, which turns the event into an OpenTelemetry
 * log record for SigNoz. Must never throw and never block the UI.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const CLIENT_EVENT_URL = `${BASE_PATH}/api/telemetry/client-event`;

export type ClientEventName = "auth_guard_error_state" | "auth_loop_breaker_tripped";

export type ClientEventAttributes = Record<string, string | number | boolean | null | undefined>;

// Sign-in (features/auth/hooks/useSignIn.ts) stores these in localStorage.
// They are sent as *_hint because the browser can edit them; the server
// route adds the verified user id from the session cookie alongside.
const HINT_KEYS: Array<[storageKey: string, attribute: string]> = [
  ["partnerId", "partner_id_hint"],
  ["userId", "user_id_hint"],
  ["userRole", "role_hint"],
];

export function identityHints(): ClientEventAttributes {
  const hints: ClientEventAttributes = {};
  try {
    for (const [storageKey, attribute] of HINT_KEYS) {
      const value = localStorage.getItem(storageKey);
      if (value) hints[attribute] = value;
    }
  } catch {
    // Storage unavailable: no hints.
  }
  return hints;
}

export function reportClientEvent(name: ClientEventName, attributes: ClientEventAttributes = {}): void {
  if (typeof window === "undefined") return;
  const payload = {
    name,
    ts: Date.now(),
    attributes: { path: window.location.pathname, ...identityHints(), ...attributes },
  };
  console.warn(`[client-event] ${name}`, payload.attributes);
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const sent = navigator.sendBeacon(CLIENT_EVENT_URL, new Blob([body], { type: "application/json" }));
      if (sent) return;
    }
    if (typeof fetch === "function") {
      fetch(CLIENT_EVENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => undefined);
    }
  } catch {
    // Telemetry is best effort.
  }
}
