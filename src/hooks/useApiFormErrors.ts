import { useCallback } from "react";
import { parseApiError, parseFieldErrors, isDuplicateEmailError } from "utils/parseApiError";

interface UseApiFormErrorsOptions {
  /**
   * Maps a backend field name (the last segment of a validation error's
   * `loc` path, e.g. "email" from `["body", "individual", "email"]`) to
   * this form's own field/error key, wherever they differ. Fields not
   * listed here are assumed to already match the backend name 1:1.
   */
  fieldMap?: Record<string, string>;
  /** Merges the given patch into the form's `errors` state, e.g.
   * `(patch) => setErrors((prev) => ({ ...prev, ...patch }))`. */
  setErrors: (patch: Record<string, string>) => void;
  /**
   * Called with the REAL backend message when the error can't be attached
   * to any known field (an unrecognized business-logic error, or a network
   * failure) — show this as a toast/banner. Never receives an invented
   * frontend-only string; the caller's `fallbackMessage` is only used if
   * the backend gave nothing at all to work with.
   */
  onUnmappedError?: (message: string) => void;
  /**
   * This form's own error key for its email field (e.g. "email" or
   * "contact_email"), if it has one the backend can reject as already
   * registered/invited. When set, a duplicate-email business-logic error
   * is attached inline to this field instead of falling back to
   * `onUnmappedError`.
   */
  emailField?: string;
}

/**
 * Reusable Partner-forms error handler: takes any caught API error, and
 * either (a) maps the backend's field-level validation errors
 * (`details: [{ loc, msg }]`) onto this form's own field names via
 * `fieldMap`, so each input shows the backend's exact message next to it,
 * or (b) recognizes a known business-logic error (currently: duplicate
 * email) and attaches it to `emailField`, or (c) hands the backend's real
 * message to `onUnmappedError` as a last resort.
 *
 * Every Partner form's submit handler should route its catch block through
 * this instead of hand-rolling `parseApiError(...)` + a generic toast, so
 * new backend validation rules surface correctly without frontend changes.
 */
export function useApiFormErrors({ fieldMap = {}, setErrors, onUnmappedError, emailField }: UseApiFormErrorsOptions) {
  return useCallback((err: unknown, fallbackMessage: string) => {
    const fieldErrors = parseFieldErrors(err);
    if (Object.keys(fieldErrors).length > 0) {
      const mapped: Record<string, string> = {};
      for (const [backendField, msg] of Object.entries(fieldErrors)) {
        mapped[fieldMap[backendField] ?? backendField] = msg;
      }
      setErrors(mapped);
      return;
    }

    const message = parseApiError(err, fallbackMessage);
    if (emailField && isDuplicateEmailError(message)) {
      setErrors({ [emailField]: message });
      return;
    }
    onUnmappedError?.(message);
  }, [fieldMap, setErrors, onUnmappedError, emailField]);
}
