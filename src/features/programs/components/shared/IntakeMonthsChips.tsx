import React from "react";
import { CALENDAR_MONTHS, nextIntakeMonth } from "features/programs/utils/intakeMonths";

interface IntakeMonthsChipsProps {
  months?: number[] | null;
  /** "sm" for tight spaces (tables, cards); "md" for detail pages. Defaults to "md". */
  size?: "sm" | "md";
  /** Whether to show a dot indicator on the single nearest upcoming month. Defaults to true. */
  showDot?: boolean;
  /** Cap how many chips render, prioritizing the soonest upcoming months; the rest collapse into a "+N" chip. Unset shows everything. */
  maxVisible?: number;
  className?: string;
}

const SIZE_CLASSES: Record<"sm" | "md", string> = {
  sm: "px-2 py-0.5 text-[11px] gap-1",
  md: "px-3 py-1 text-xs gap-1.5",
};

/** Recurring months have no "past" — a month either recurs or it doesn't.
 * The nearest one (soonest from today, wrapping year-end) is highlighted;
 * everything else renders identically, sorted by that same proximity so
 * the nearest one always reads first. */
export default function IntakeMonthsChips({
  months,
  size = "md",
  showDot = true,
  maxVisible,
  className,
}: IntakeMonthsChipsProps) {
  if (!months || months.length === 0) return null;

  const soonest = nextIntakeMonth(months);
  const current = new Date().getMonth() + 1;
  const distance = (m: number) => (m - current + 12) % 12;
  const sorted = [...months].sort((a, b) => distance(a) - distance(b));

  const visible = maxVisible != null ? sorted.slice(0, maxVisible) : sorted;
  const hiddenCount = maxVisible != null ? sorted.length - visible.length : 0;

  return (
    <div className={`flex flex-wrap gap-1 ${className ?? ""}`}>
      {visible.map((month) => {
        const isNext = month === soonest;
        return (
          <span
            key={month}
            className={`inline-flex items-center rounded-full border font-medium ${SIZE_CLASSES[size]} ${
              isNext ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"
            }`}
          >
            {showDot && isNext && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
            {CALENDAR_MONTHS.find((m) => m.value === month)?.short ?? month}
          </span>
        );
      })}
      {hiddenCount > 0 && (
        <span
          title={sorted.slice(maxVisible).map((m) => CALENDAR_MONTHS.find((cm) => cm.value === m)?.label ?? m).join(", ")}
          className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-50 font-medium text-slate-500 ${SIZE_CLASSES[size]}`}
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}
