import React from "react";
import { AppDate } from "components/ui/date";

interface IntakeDatesChipsProps {
  dates?: string[] | null;
  /** "sm" for tight spaces (tables, cards); "md" for detail pages. Defaults to "md". */
  size?: "sm" | "md";
  /** Whether to include the year alongside the month. Defaults to false. */
  showYear?: boolean;
  /** Whether to show a dot indicator on upcoming (non-past) dates. Defaults to true. */
  showDot?: boolean;
  /** Cap how many chips render, prioritizing the soonest upcoming dates; the rest collapse into a "+N" chip. Unset shows everything. */
  maxVisible?: number;
  className?: string;
}

const SIZE_CLASSES: Record<"sm" | "md", string> = {
  sm: "px-2 py-0.5 text-[11px] gap-1",
  md: "px-3 py-1 text-xs gap-1.5",
};

export default function IntakeDatesChips({
  dates,
  size = "md",
  showYear = false,
  showDot = true,
  maxVisible,
  className,
}: IntakeDatesChipsProps) {
  if (!dates || dates.length === 0) return null;

  const now = new Date();
  const sorted = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  let visible = sorted;
  let hiddenCount = 0;

  if (maxVisible != null && sorted.length > maxVisible) {
    // Prioritize the soonest upcoming dates; fall back to the most recent
    // past ones only if there aren't enough upcoming dates to fill the cap.
    const upcoming = sorted.filter((d) => new Date(d) >= now);
    const past = sorted.filter((d) => new Date(d) < now).reverse();
    visible = [...upcoming, ...past].slice(0, maxVisible).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    hiddenCount = sorted.length - visible.length;
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className ?? ""}`}>
      {visible.map((dateStr) => {
        const isPast = new Date(dateStr) < now;
        return (
          <span
            key={dateStr}
            className={`inline-flex items-center rounded-full border font-medium ${SIZE_CLASSES[size]} ${
              isPast
                ? "border-slate-200 bg-slate-100 text-slate-400 line-through"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {showDot && !isPast && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
            <AppDate value={dateStr} format={showYear ? "month-year" : "month"} fallback={dateStr} />
          </span>
        );
      })}
      {hiddenCount > 0 && (
        <span
          title={sorted.slice(maxVisible).map((d) => new Date(d).toLocaleString("en-US", { month: "short", year: "numeric" })).join(", ")}
          className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-50 font-medium text-slate-500 ${SIZE_CLASSES[size]}`}
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}
