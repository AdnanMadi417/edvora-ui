// Mirrors the backend's app/services/actor_display.py: when an Advisor
// (partner) reads the API, every staff name is replaced with one generic
// label. The UI then shows it as "Unibexs" (lib/unibexsVoice.ts).

export const STAFF_DISPLAY_NAME = "Unibexs Operations Team";

/** True when the mock session is the Advisor area (/partner/...). */
export function viewerIsPartner(): boolean {
  return typeof window !== "undefined" && window.location.pathname.split("/")[1] === "partner";
}

/** Notification data as the backend returns it to a partner: staff identity stripped. */
export function maskNotificationData<T extends Record<string, unknown> | null | undefined>(data: T): T {
  if (!data || !viewerIsPartner()) return data;
  const masked: Record<string, unknown> = { ...data };
  for (const key of ["actor_name", "sender_name"]) if (key in masked) masked[key] = STAFF_DISPLAY_NAME;
  for (const key of ["actor_id", "sender_id"]) delete masked[key];
  return masked as T;
}
