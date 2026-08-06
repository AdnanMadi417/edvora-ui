import { isAxiosError } from "axios";

/**
 * Extracts a user-facing message from a caught request error.
 * Prefers the backend's response body (message, then detail as a string or
 * FastAPI-style validation array), then falls back to the error's own
 * message (e.g. "Network Error" when there's no response at all), then the
 * caller-supplied fallback.
 */
export function parseApiError(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data;
    return (
      (typeof data?.message === "string" ? data.message : null) ??
      (typeof data?.detail === "string" ? data.detail : null) ??
      (Array.isArray(data?.detail) && data.detail[0]?.msg ? String(data.detail[0].msg) : null) ??
      (err.message ? err.message : null) ??
      fallback
    );
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
