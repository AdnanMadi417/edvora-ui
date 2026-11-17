"use client";
import { useEffect, useState } from "react";
import {
  configurationSchema,
  withoutRemovedCentreFields,
  emptyConfiguration,
  type CentreConfiguration,
} from "../configuration";
import {
  publishedCentreConfiguration,
  WORKSPACE_EVENT,
} from "features/language-centre-admin/services/centreWorkspace";
import { getDemoCentreConfiguration } from "../fixtures/demoData";
const key = (id: string) => `unibexs:language-centre:v1:${id}`;
export function readCentreConfiguration(
  id: string,
  centreId?: string
): CentreConfiguration | null {
  const published = publishedCentreConfiguration(centreId || id);
  if (published) return withoutRemovedCentreFields(published);
  const raw = localStorage.getItem(key(id));
  return raw
    ? (configurationSchema.parse(
        withoutRemovedCentreFields(JSON.parse(raw))
      ) as CentreConfiguration)
    : (() => {
        const demo = getDemoCentreConfiguration(id);
        return demo ? withoutRemovedCentreFields(demo) : null;
      })();
}
export function saveCentreConfiguration(
  id: string,
  value: CentreConfiguration
) {
  if (!id)
    throw new Error(
      "The university ID is missing. Language centre details could not be saved."
    );
  // Clear unpublished configuration when the centre is disabled.
  const stored = value.enabled
    ? configurationSchema.parse(withoutRemovedCentreFields(value))
    : { ...emptyConfiguration(), enabled: false };
  try {
    localStorage.setItem(key(id), JSON.stringify(stored));
  } catch {
    throw new Error(
      "Language Centre details could not be saved in this browser. Storage may be full or unavailable. Free browser storage, then try saving again."
    );
  }
  window.dispatchEvent(new Event("language-centre-updated"));
}
export function useCentreConfiguration(id?: string, centreId?: string) {
  const [value, setValue] = useState<CentreConfiguration>(emptyConfiguration);
  const [initialValue, setInitialValue] =
    useState<CentreConfiguration>(emptyConfiguration);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!id) return;
    const load = () => {
      setLoading(true);
      try {
        const saved = readCentreConfiguration(id, centreId);
        setValue(saved || emptyConfiguration());
        setInitialValue(saved || emptyConfiguration());
        setExists(!!saved);
        setError(null);
      } catch {
        setError(
          "Unable to read the language centre saved in this browser. Check browser storage and try again."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener(WORKSPACE_EVENT, load);
    window.addEventListener("language-centre-updated", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener(WORKSPACE_EVENT, load);
      window.removeEventListener("language-centre-updated", load);
    };
  }, [id, centreId, attempt]);
  return {
    value,
    initialValue,
    dirty: JSON.stringify(value) !== JSON.stringify(initialValue),
    setValue,
    exists,
    loading,
    error,
    retry: () => setAttempt((v) => v + 1),
  };
}

/** Overlay locally managed availability without requiring an API filter contract. */
export function useCentreAvailability<
  T extends { id: string; has_language_center: boolean }
>(universities: T[]): T[] {
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const ids = universities.map((university) => university.id).join(",");
  useEffect(() => {
    const load = () => {
      const next: Record<string, boolean> = {};
      for (const id of ids.split(",").filter(Boolean)) {
        try {
          const saved = readCentreConfiguration(id);
          if (saved) next[id] = saved.enabled;
        } catch {
          /* A corrupt record must not remove a university from the listing. */
        }
      }
      setAvailability(next);
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener(WORKSPACE_EVENT, load);
    window.addEventListener("language-centre-updated", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener(WORKSPACE_EVENT, load);
      window.removeEventListener("language-centre-updated", load);
    };
  }, [ids]);
  return universities.map((university) =>
    Object.prototype.hasOwnProperty.call(availability, university.id)
      ? { ...university, has_language_center: availability[university.id] }
      : university
  );
}
