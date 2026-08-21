/**
 * Scrolls the first errored field into view and focuses it. Relies on the
 * field's wrapper carrying `data-field="<name>"` (added to every shared form
 * field component) so this works the same way regardless of which component
 * rendered the field. `errors` should be checked in the same order the
 * fields appear on the page (an object literal / computeErrors() result
 * built top-to-bottom already satisfies this via key insertion order).
 */
export function scrollToFirstError(errors: Record<string, string | undefined>) {
  const firstField = Object.keys(errors).find((key) => errors[key]);
  if (!firstField) return;

  const el = document.querySelector(`[data-field="${firstField}"]`);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusable = el.querySelector("input, select, textarea, button");
  if (focusable instanceof HTMLElement) {
    focusable.focus({ preventScroll: true });
  }
}
