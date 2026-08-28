/** Course type only applies to Master's/PhD programs — request bodies send
 * an int (1/2/3), responses return the lowercase string. */
export const COURSE_TYPE_OPTIONS: { value: number; label: string; response: string }[] = [
  { value: 1, label: "Coursework", response: "course_work" },
  { value: 2, label: "Research", response: "research" },
  { value: 3, label: "Mixed Mode", response: "mixed_mode" },
];

const REQUEST_BY_RESPONSE: Record<string, number> = Object.fromEntries(
  COURSE_TYPE_OPTIONS.map((o) => [o.response, o.value])
);

/** Accepts either the request int or the response string. */
export function courseTypeLabel(value: string | number | null | undefined): string | null {
  if (value == null || value === "") return null;
  const entry = typeof value === "number"
    ? COURSE_TYPE_OPTIONS.find((o) => o.value === value)
    : COURSE_TYPE_OPTIONS.find((o) => o.response === value);
  return entry?.label ?? null;
}

/** Converts a response string (or an already-numeric value) to the request int. */
export function courseTypeRequestValue(value: string | number | null | undefined): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return value;
  return REQUEST_BY_RESPONSE[value] ?? null;
}

/**
 * Whether a qualification unlocks course_type — verified empirically
 * against the real backend: it's a case-insensitive SUBSTRING match on the
 * qualification name ("Master's Degree" and "Doctoral Degree (PhD)" both
 * qualify, not just the bare "master"/"phd" values), not an exact match.
 */
export function isMasterOrPhd(qualificationName: string | null | undefined): boolean {
  if (!qualificationName) return false;
  const normalized = qualificationName.toLowerCase();
  return normalized.includes("master") || normalized.includes("phd");
}
