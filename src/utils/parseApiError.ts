import { isAxiosError } from "axios";

export function parseApiError(err: unknown, fallback: string): string {
  if (!isAxiosError(err)) return fallback;
  const data = err.response?.data;
  return (
    (typeof data?.message === "string" ? data.message : null) ??
    (typeof data?.detail === "string" ? data.detail : null) ??
    (Array.isArray(data?.detail) && data.detail[0]?.msg ? String(data.detail[0].msg) : null) ??
    fallback
  );
}
