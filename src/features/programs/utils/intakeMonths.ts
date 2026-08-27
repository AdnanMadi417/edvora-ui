/** Calendar months (1 = January … 12 = December) — used everywhere a
 * program/university's recurring intake months are picked or displayed.
 * Distinct from the "duration in months" MONTHS list in constants/lists. */
export const CALENDAR_MONTHS: { value: number; label: string; short: string }[] = [
  { value: 1, label: "January", short: "Jan" },
  { value: 2, label: "February", short: "Feb" },
  { value: 3, label: "March", short: "Mar" },
  { value: 4, label: "April", short: "Apr" },
  { value: 5, label: "May", short: "May" },
  { value: 6, label: "June", short: "Jun" },
  { value: 7, label: "July", short: "Jul" },
  { value: 8, label: "August", short: "Aug" },
  { value: 9, label: "September", short: "Sep" },
  { value: 10, label: "October", short: "Oct" },
  { value: 11, label: "November", short: "Nov" },
  { value: 12, label: "December", short: "Dec" },
];

export function monthLabel(month: number | string | null | undefined, short = true): string {
  const n = Number(month);
  const entry = CALENDAR_MONTHS.find((m) => m.value === n);
  if (!entry) return month != null ? String(month) : "—";
  return short ? entry.short : entry.label;
}

/** Mirrors the backend's next_intake_month(months, today) — the closest
 * upcoming recurring month, wrapping across year-end. Returns null when
 * `months` is empty. */
export function nextIntakeMonth(months: number[] | null | undefined, today: Date = new Date()): number | null {
  if (!months || months.length === 0) return null;
  const current = today.getMonth() + 1;
  const distance = (m: number) => (m - current + 12) % 12;
  return [...months].sort((a, b) => distance(a) - distance(b))[0];
}

/** Bridges a recurring month (no year) to a concrete ISO date for the
 * nearest future occurrence — needed only where a real date is still
 * required downstream (e.g. Application.intake_date, which stays a real
 * date even though Program/University intake months no longer carry one). */
export function resolveIntakeDate(month: number, today: Date = new Date()): string {
  const year = month >= today.getMonth() + 1 ? today.getFullYear() : today.getFullYear() + 1;
  return `${year}-${String(month).padStart(2, "0")}-01`;
}
