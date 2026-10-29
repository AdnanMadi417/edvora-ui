import type { DateFormat } from "components/ub/data/appDateTypes";

// ─── Parsing ─────────────────────────────────────────────────────────────────

/**
 * Coerce any supported input into a `Date`, returning `null` for invalid values.
 * Accepts ISO strings, locale strings, timestamps, and `Date` objects.
 */
export function parseDate(value: string | Date | null | undefined): Date | null {
  if (value == null || value === "") return null;

  const date = value instanceof Date ? value : new Date(value);

  return isNaN(date.getTime()) ? null : date;
}

// ─── Relative formatting ──────────────────────────────────────────────────────

const MINUTE = 60_000;
const HOUR   = 60 * MINUTE;
const DAY    = 24 * HOUR;

/**
 * Return a human-readable relative string (e.g. "5 minutes ago", "Yesterday").
 * Uses `Intl.RelativeTimeFormat` for locale-aware output where possible,
 * with a plain-English fallback for the "Yesterday" special case.
 */
export function formatRelative(date: Date, locale: string): string {
  const rtf  = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diff  = date.getTime() - Date.now(); // negative = past
  const abs   = Math.abs(diff);

  if (abs < MINUTE)        return rtf.format(Math.round(diff / 1000),         "second");
  if (abs < HOUR)          return rtf.format(Math.round(diff / MINUTE),       "minute");
  if (abs < DAY)           return rtf.format(Math.round(diff / HOUR),         "hour");
  if (abs < 2 * DAY)       return rtf.format(Math.round(diff / DAY),          "day");
  if (abs < 7 * DAY)       return rtf.format(Math.round(diff / DAY),          "day");
  if (abs < 30 * DAY)      return rtf.format(Math.round(diff / (7 * DAY)),    "week");
  if (abs < 365 * DAY)     return rtf.format(Math.round(diff / (30 * DAY)),   "month");

  return rtf.format(Math.round(diff / (365 * DAY)), "year");
}

// ─── Absolute formatting ──────────────────────────────────────────────────────

/** Intl option sets keyed by format name. */
const FORMAT_OPTIONS: Record<Exclude<DateFormat, "relative">, Intl.DateTimeFormatOptions> = {
  month:        { month: "short" },
  "month-year": { month: "short", year: "2-digit" },
  short:        { day: "numeric", month: "short",  year: "numeric" },
  long:         { day: "numeric", month: "long",   year: "numeric" },
  datetime:     { day: "numeric", month: "short",  year: "numeric", hour: "numeric", minute: "2-digit", hour12: true },
};

/**
 * Format a valid `Date` according to the requested format and locale.
 * All absolute formats delegate to `Intl.DateTimeFormat`; relative uses
 * `Intl.RelativeTimeFormat` via `formatRelative`.
 */
export function formatDate(date: Date, format: DateFormat, locale: string): string {
  if (format === "relative") return formatRelative(date, locale);

  const formatted = new Intl.DateTimeFormat(locale, FORMAT_OPTIONS[format]).format(date);
  // en-GB (and most locales) render the am/pm marker lowercase — capitalize it.
  return FORMAT_OPTIONS[format].hour12 ? formatted.replace(/\b(am|pm)\b/i, (m) => m.toUpperCase()) : formatted;
}

// ─── Machine-readable ISO string for <time datetime="..."> ───────────────────

/** Returns a full ISO 8601 string suitable for the HTML `datetime` attribute. */
export function toISOString(date: Date): string {
  return date.toISOString();
}
