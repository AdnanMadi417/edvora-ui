"use client";

import { useState } from "react";
import clsx from "clsx";
import WidgetStatus, { resolveWidgetState } from "./WidgetStatus";
import { compactNumber, type WidgetStateProps } from "./types";

export interface CategoryDatum {
  key: string;
  label: string;
  value: number;
}

export interface CategoryColumnChartProps extends WidgetStateProps {
  /** Up to ~8 categories; more should fold into "Other". */
  data: CategoryDatum[];
  /** Category drawn in the accent; the rest are muted. Default: the largest. */
  highlightKey?: string;
  formatValue?: (value: number) => string;
  unit?: string;
  label: string;
  heightClass?: string;
  className?: string;
}

/**
 * Columns for a handful of categories (e.g. applications by Institution),
 * each with its value in a bubble on the cap. One hue: the highlighted
 * category in the accent, others muted, so colour never stands for identity.
 */
export default function CategoryColumnChart({ data, highlightKey, formatValue = compactNumber, unit = "", label, heightClass = "h-48", state, emptyMessage, errorMessage, onRetry, className }: CategoryColumnChartProps) {
  const [focus, setFocus] = useState<string | null>(null);
  const resolved = resolveWidgetState(state, data.length > 0);
  if (resolved !== "ready") return <WidgetStatus state={resolved} skeleton="chart" emptyMessage={emptyMessage} errorMessage={errorMessage} onRetry={onRetry} className={className} />;
  const max = Math.max(1, ...data.map((d) => d.value));
  const hiKey = highlightKey ?? data.reduce((a, b) => (b.value > a.value ? b : a)).key;
  return (
    <div className={className}>
      <ul aria-label={label} className={clsx("flex items-end gap-3 border-b border-ub-chart-grid pt-8", heightClass)}>
        {data.map((d) => {
          const active = d.key === hiKey || focus === d.key;
          // The bubble shows the number only; the unit is in the accessible label.
          const text = formatValue(d.value);
          const full = `${text}${unit ? ` ${unit}` : ""}`;
          return (
            <li key={d.key} tabIndex={0} aria-label={`${d.label}: ${full}`} onFocus={() => setFocus(d.key)} onBlur={() => setFocus(null)} onMouseEnter={() => setFocus(d.key)} onMouseLeave={() => setFocus(null)} className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end rounded-ub-sm outline-none focus-visible:ring-2 focus-visible:ring-ub-border-focus">
              <span aria-hidden="true" className={clsx("ub-tabular mb-1.5 whitespace-nowrap rounded-ub-full border px-2 py-0.5 text-ub-label-sm", active ? "border-transparent bg-ub-tooltip text-ub-text-on-action" : "border-ub-border bg-ub-surface text-ub-text-primary")}>
                {text}
              </span>
              <span aria-hidden="true" className={clsx("w-full max-w-10 rounded-t-ub-md transition-[height,background-color] duration-ub-slow ease-ub-standard motion-reduce:transition-none", active ? "bg-ub-chart-cat-1" : "bg-ub-chart-muted")} style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }} />
            </li>
          );
        })}
      </ul>
      <div aria-hidden="true" className="mt-2 flex gap-3">
        {data.map((d) => (
          <span key={d.key} className="flex-1 truncate text-center text-ub-caption text-ub-text-tertiary" title={d.label}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
