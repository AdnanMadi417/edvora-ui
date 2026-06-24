import type { ReactNode } from "react";

/** All supported display formats for AppDate. */
export type DateFormat = "month" | "month-year" | "short" | "long" | "datetime" | "relative";

export interface AppDateProps {
  /** The date value — string (ISO or any parseable format), Date object, null, or undefined. */
  value?: string | Date | null;
  /**
   * Display format.
   * - `month`      → Jan
   * - `month-year` → Jan 2026
   * - `short`      → 23 Jun 2026
   * - `long`       → 23 June 2026
   * - `datetime`   → 23 Jun 2026, 2:30 PM
   * - `relative`   → 5 minutes ago / Yesterday
   * @default "short"
   */
  format?: DateFormat;
  /**
   * BCP 47 locale tag used for Intl formatting.
   * @default "en-GB"
   */
  locale?: string;
  /**
   * Rendered when `value` is absent or invalid.
   * @default "—"
   */
  fallback?: ReactNode;
  /** Extra Tailwind / CSS classes on the wrapping `<time>` element. */
  className?: string;
}
