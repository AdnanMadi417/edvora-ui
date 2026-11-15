"use client";

import { useId } from "react";
import clsx from "clsx";
import { CalendarDays } from "lucide-react";
import Combobox from "components/ub/forms/selection/Combobox";

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
 * Searchable period picker shared with the rest of the app.
 */
export default function PeriodSelect({ value, onChange, options = ["week", "month", "intake", "year"], label = "Period", size = "sm", disabled, className }: PeriodSelectProps) {
  const id = useId();
  return (
    <div className={clsx("relative inline-flex", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Combobox compact id={id} ariaLabel={label} value={value} onChange={next => onChange(next as DashboardPeriod)} options={options.map(period => ({ value: period, label: PERIOD_LABELS[period] }))} disabled={disabled} leadingIcon={<CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-ub-icon" />} triggerClassName={size === "sm" ? "!h-8" : "h-10"} />
    </div>
  );
}
