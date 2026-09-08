import { useMemo } from "react";

/**
 * Whether `current` has changed from `baseline`, via a plain JSON
 * comparison. Shared so "is this form dirty" — used for the unsaved-
 * changes guard, the discard confirmation, and disabling Save — can't
 * drift between the create and edit forms computing it independently
 * (see the intake-months/commission-currency bugs that slipped through
 * exactly that way).
 *
 * Pass `null` for `baseline` while the real starting point hasn't loaded
 * yet (e.g. an edit form still waiting on the fetched record) — treated
 * as "not dirty" rather than comparing against an incomplete baseline
 * and reporting a false change.
 */
export function useIsFormDirty<T>(current: T, baseline: T | null): boolean {
  return useMemo(() => {
    if (baseline === null) return false;
    return JSON.stringify(current) !== JSON.stringify(baseline);
  }, [current, baseline]);
}
