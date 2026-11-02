"use client";

import { useId } from "react";
import clsx from "clsx";
import { CalendarDays, ChevronDown } from "lucide-react";
import { focusRing } from "components/ub/recipes";

export type DashboardPeriod = "week" | "month" | "intake" | "year";

export const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  week: "This week",
  month: "This month",
  intake: "This intake",
  year: "This year",
};

export interface PeriodSelectProps {
  value: DashboardPeriod;
  onChange: (value: DashboardPeriod) => void;
  /** Which periods to offer, in order. Default all four. */
  options?: DashboardPeriod[];
  /** Accessible name. Default "Period". */
  label?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

/**
 * Period dropdown for dashboards and cards. A native select styled as a
 * pill, so keyboard, screen readers and mobile pickers work everywhere.
 */
export default function PeriodSelect({ value, onChange, options = ["week", "month", "intake", "year"], label = "Period", size = "sm", disabled, className }: PeriodSelectProps) {
  const id = useId();
  return (
    <div className={clsx("relative inline-flex", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <CalendarDays aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ub-icon" />
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as DashboardPeriod)}
        className={clsx(
          "cursor-pointer appearance-none rounded-ub-full border border-ub-border bg-ub-surface ps-9 pe-9 text-ub-label-md text-ub-text-primary transition-colors duration-ub-fast hover:border-ub-border-hover disabled:cursor-not-allowed disabled:text-ub-text-disabled",
          size === "sm" ? "h-8" : "h-10",
          focusRing,
        )}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {PERIOD_LABELS[o]}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ub-icon" />
    </div>
  );
}
