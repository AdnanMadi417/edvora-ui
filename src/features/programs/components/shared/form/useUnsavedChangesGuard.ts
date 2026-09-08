"use client";

import { useEffect } from "react";

/** Warns before a tab close/refresh while there are unsaved changes. Cannot
 * intercept in-app navigation (Next's App Router has no route-change-block
 * API) — callers should confirm separately before their own "Back"/"Cancel"
 * actions when `isDirty` is true. */
export function useUnsavedChangesGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
}

/** Confirms with the user before running `action` if there are unsaved
 * changes — for in-app navigation (Back/Cancel) that beforeunload can't see. */
export function confirmDiscard(isDirty: boolean, action: () => void) {
  if (!isDirty || window.confirm("You have unsaved changes. Leave without saving?")) {
    action();
  }
}
