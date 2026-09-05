"use client";

import { useEffect, useState } from "react";

const DRAFT_KEY = "program-draft:create";

/** Saves the in-progress Create Program form to this browser's local
 * storage only — there's no backend "draft" status on a program, so this
 * can't sync across staff or devices. It exists purely so a form isn't lost
 * to an accidental tab close. */
export function useDraftAutosave<T>(formData: T, enabled: boolean) {
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    try {
      setHasDraft(!!localStorage.getItem(DRAFT_KEY));
    } catch {
      setHasDraft(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      } catch {
        // Storage unavailable (private browsing, quota) — silently skip autosave.
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [formData, enabled]);

  const readDraft = (): T | null => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Storage unavailable — nothing to clear.
    }
    setHasDraft(false);
  };

  const dismissDraft = () => setHasDraft(false);

  return { hasDraft, readDraft, clearDraft, dismissDraft };
}
