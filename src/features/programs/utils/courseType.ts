import type { CourseType } from "features/programs/types";

/** Course type only applies to Master's/PhD programs. Requests and
 * responses both use these strings — request bodies used to take an int
 * (1/2/3) but that's now a 422 on the backend; value here doubles as the
 * exact string every endpoint expects and returns. */
export const COURSE_TYPE_OPTIONS: { value: CourseType; label: string }[] = [
  { value: "course_work", label: "Coursework" },
  { value: "research", label: "Research" },
  { value: "mixed_mode", label: "Mixed Mode" },
];

export function courseTypeLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return COURSE_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? null;
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
