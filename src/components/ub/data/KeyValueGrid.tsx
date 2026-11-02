import type { ReactNode } from "react";
import clsx from "clsx";

export interface KeyValueItem {
  label: string;
  /** Value node; numbers should be Amount, Numeral or AppDate (tabular). */
  value?: ReactNode;
  /** Small line under the value, e.g. a DaysTag or "Tracked automatically". */
  hint?: ReactNode;
}

export interface KeyValueGridProps {
  items: KeyValueItem[];
  /** Tiles per row from md up; one column on mobile. Default 2. */
  columns?: 1 | 2 | 3 | 4;
  /** Shown when a value is null, undefined or "". Default "Not available". */
  fallback?: ReactNode;
  className?: string;
}

const COLS: Record<NonNullable<KeyValueGridProps["columns"]>, string> = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 md:grid-cols-3",
  4: "sm:grid-cols-2 md:grid-cols-4",
};

/**
 * Prominent label/value tiles on the subtle surface. Use it for the few
 * figures a card leads with (commission amount and due date, visa fee,
 * tuition); use DescriptionList for longer read-only detail lists.
 */
export default function KeyValueGrid({ items, columns = 2, fallback = "Not available", className }: KeyValueGridProps) {
  return (
    <dl className={clsx("grid grid-cols-1 gap-3", COLS[columns], className)}>
      {items.map(({ label, value, hint }) => {
        const missing = value === null || value === undefined || value === "";
        return (
          <div key={label} className="min-w-0 rounded-ub-md border border-ub-border bg-ub-surface-subtle p-4">
            <dt className="text-ub-label-sm text-ub-text-secondary">{label}</dt>
            <dd className={clsx("ub-tabular mt-1 break-words text-ub-heading-sm", missing ? "text-ub-text-tertiary" : "text-ub-text-primary")}>{missing ? fallback : value}</dd>
            {hint && <dd className="mt-2 text-ub-body-sm text-ub-text-secondary">{hint}</dd>}
          </div>
        );
      })}
    </dl>
  );
}
