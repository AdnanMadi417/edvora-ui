"use client";

// Draft lifecycle for the application form: offer to resume a saved draft,
// auto-save while there's unsaved work, save on demand, clear after submit.
// Storage lives in draftStore (IndexedDB on this device only).

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormDataType } from "features/applications/partner/components/form/utility-functions/types";
import type { ApplicationFormStepId } from "./applicationFormModel";
import { applicationDrafts, type ApplicationDraft, type DraftStore } from "./draftStore";

export interface DraftOffer {
  /** Student name from the draft, when one was typed. */
  studentName?: string;
  /** Epoch ms. */
  savedAt: number;
}

interface Options {
  /** From draftKey(); null disables drafts (user not known yet). */
  key: string | null;
  formData: FormDataType;
  step: ApplicationFormStepId;
  completed: ApplicationFormStepId[];
  /** Auto-save runs only while there's unsaved work. */
  dirty: boolean;
  /** Put a resumed draft back into the form. */
  onRestore: (draft: ApplicationDraft) => void;
  store?: DraftStore;
  /** Auto-save debounce in ms. */
  delay?: number;
}

export function useApplicationDraft({ key, formData, step, completed, dirty, onRestore, store = applicationDrafts, delay = 800 }: Options) {
  const [pending, setPending] = useState<ApplicationDraft | null>(null);
  // Whether the latest write reached storage (null = nothing written yet).
  const [saved, setSaved] = useState<boolean | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set once submitted: no write may land after the draft is cleared.
  const stopped = useRef(false);
  const latest = useRef({ key, formData, step, completed, dirty, pending });
  latest.current = { key, formData, step, completed, dirty, pending };
  const restore = useRef(onRestore);
  restore.current = onRestore;

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const write = useCallback(async () => {
    const { key: k, formData: f, step: s, completed: c } = latest.current;
    if (!k || stopped.current) return false;
    const ok = await store.save(k, { formData: f, step: s, completed: c, savedAt: Date.now() });
    setSaved(ok);
    return ok;
  }, [store]);

  // Look for a saved draft once the user (and so the key) is known.
  useEffect(() => {
    setPending(null);
    if (!key) return;
    let cancelled = false;
    store.load(key).then((draft) => {
      if (!cancelled && draft) setPending(draft);
    });
    return () => {
      cancelled = true;
    };
  }, [key, store]);

  // Debounced auto-save. Paused while a saved draft is on offer, so typing
  // before choosing never overwrites it.
  useEffect(() => {
    if (!key || !dirty || pending) return;
    cancel();
    timer.current = setTimeout(() => {
      timer.current = null;
      void write();
    }, delay);
    return cancel;
  }, [key, dirty, pending, formData, step, completed, delay, write]);

  // Flush when the tab is hidden or closed, inside the debounce window.
  useEffect(() => {
    const flush = () => {
      // Nothing waiting means the last change is already written.
      if (!timer.current) return;
      cancel();
      void write();
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [write]);

  /** "Save draft": write now. The current work replaces any draft on offer. */
  const saveNow = useCallback(async () => {
    cancel();
    setPending(null);
    return write();
  }, [write]);

  const resume = useCallback(() => {
    const draft = latest.current.pending;
    if (!draft) return;
    setPending(null);
    restore.current(draft);
  }, []);

  const discard = useCallback(async () => {
    const k = latest.current.key;
    setPending(null);
    if (k) await store.discard(k);
  }, [store]);

  /** After a successful submit: delete the draft and stop saving. */
  const clear = useCallback(async () => {
    stopped.current = true;
    cancel();
    const k = latest.current.key;
    if (k) await store.discard(k);
  }, [store]);

  const offer: DraftOffer | null = pending ? { studentName: pending.formData.student?.name?.trim() || undefined, savedAt: pending.savedAt } : null;

  return { offer, resume, discard, saveNow, clear, saved };
}
