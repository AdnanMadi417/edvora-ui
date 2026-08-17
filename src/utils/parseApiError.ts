import { isAxiosError } from "axios";

function getValidationDetails(data: any): Array<{ loc?: unknown[]; msg?: unknown }> | null {
  if (Array.isArray(data?.details)) return data.details;
  if (Array.isArray(data?.detail)) return data.detail;
  return null;
}

/**
 * Extracts a user-facing message from a caught request error.
 * Prefers a field-level validation error's own message (this backend's
 * 422 responses carry `details: [{ loc, msg }, ...]`, not FastAPI's default
 * `detail` key) over the generic top-level `message` (e.g. "Request
 * validation failed"), so the specific reason is shown instead of a summary.
 * Falls back to `message`/`detail` (business-logic errors like a duplicate
 * email carry the specific text there, with `details: null`), then the
 * error's own message (e.g. "Network Error" when there's no response at
 * all), then the caller-supplied fallback.
 */
export function parseApiError(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data;
    const details = getValidationDetails(data);
    if (details && details[0]?.msg) return String(details[0].msg);
    return (
      (typeof data?.message === "string" ? data.message : null) ??
      (typeof data?.detail === "string" ? data.detail : null) ??
      (err.message ? err.message : null) ??
      fallback
    );
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export interface FieldError {
  /** The LAST segment of the `loc` path — the leaf field name, e.g. "email". */
  field: string;
  /** The full `loc` path, e.g. `["body", "branches", 0, "name"]` — needed to
   * disambiguate repeated/array fields (a form's fieldMap can inspect the
   * numeric index instead of colliding every array item onto one key). */
  loc: Array<string | number>;
  msg: string;
}

/**
 * Extracts each field-level validation error from a response
 * (`details: [{ loc: ["body", ..., "email"], msg: "..." }, ...]`), one entry
 * per item, in order. Returns [] when the error isn't this shape (e.g. a
 * business-logic error like a duplicate email, which carries `details: null`
 * and should instead be read via `parseApiError` and attached by the caller).
 */
export function parseFieldErrors(err: unknown): FieldError[] {
  if (!isAxiosError(err)) return [];
  const details = getValidationDetails(err.response?.data);
  if (!details) return [];

  const fieldErrors: FieldError[] = [];
  for (const item of details) {
    if (!item?.msg) continue;
    const loc = Array.isArray(item.loc) ? (item.loc as Array<string | number>) : [];
    const field = loc[loc.length - 1];
    if (typeof field === "string") {
      fieldErrors.push({ field, loc, msg: String(item.msg) });
    }
  }
  return fieldErrors;
}

/**
 * True when a parsed API error message indicates an email address is
 * already in use (registration, invitation, or profile-update conflicts).
 * Use to attach the backend's message to the specific email field instead
 * of showing it as a generic banner/toast.
 */
export function isDuplicateEmailError(message: string): boolean {
  return /account.*already (exists|registered)|email.*(already|taken)|already.*(a member|been invited|in use)/i.test(message);
}
