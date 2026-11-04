"use client";

import { useState } from "react";
import clsx from "clsx";
import WidgetStatus, { resolveWidgetState } from "../shared/WidgetStatus";
import { compactNumber, type WidgetStateProps } from "../types";

export interface PillBarDatum {
  label: string;
  value: number;
  /** pending / forecast bars are hatched instead of filled. */
  status?: "actual" | "pending";
}

export interface PillBarChartProps extends WidgetStateProps {
  data: PillBarDatum[];
  /** Index of the bar to highlight (accent + value bubble). Default: the last actual bar. */
  highlightIndex?: number;
  /** Tooltip / bubble text. Default compact number. */
  formatValue?: (value: number) => string;
  /** Noun for screen readers: "applications". */
  unit?: string;
  /** Accessible name for the chart. */
  label: string;
  /** Plot height class. Default "h-44". */
  heightClass?: string;
  className?: string;
}

/** Pure: default highlight = last bar that isn't pending (or the last bar). */
export function defaultHighlight(data: PillBarDatum[]): number {
  for (let i = data.length - 1; i >= 0; i--) if (data[i].status !== "pending") return i;
  return data.length - 1;
}

/**
 * Rounded bars on one baseline (≤24px wide, 2px gaps). The current bar is the
 * accent with a value bubble; others are muted; pending/forecast bars are
 * hatched. Hover or focus any bar for its value.
 */
export default function PillBarChart({ data, highlightIndex, formatValue = compactNumber, unit = "", label, heightClass = "h-44", state, emptyMessage, errorMessage, onRetry, className }: PillBarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const resolved = resolveWidgetState(state, data.length > 0);
  if (resolved !== "ready") return <WidgetStatus state={resolved} skeleton="chart" emptyMessage={emptyMessage} errorMessage={errorMessage} onRetry={onRetry} className={className} />;

  const max = Math.max(1, ...data.map((d) => d.value));
  const hi = highlightIndex ?? defaultHighlight(data);
  return (
    <div className={className}>
      <ul aria-label={label} className={clsx("flex items-end gap-2", heightClass)}>
        {data.map((d, i) => {
          const active = i === hi;
          const show = hover === i || (hover === null && active);
          const text = `${formatValue(d.value)}${unit ? ` ${unit}` : ""}`;
          return (
            <li
              key={`${d.label}-${i}`}
              tabIndex={0}
              aria-label={`${d.label}: ${text}${d.status === "pending" ? " (pending)" : ""}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="group relative flex h-full flex-1 cursor-default flex-col items-center justify-end rounded-ub-md outline-none focus-visible:ring-2 focus-visible:ring-ub-border-focus"
            >
              {show && (
                <span aria-hidden="true" className="ub-tabular absolute z-10 -translate-y-full whitespace-nowrap rounded-ub-full bg-ub-tooltip px-2 py-0.5 text-ub-label-sm text-ub-text-on-action" style={{ bottom: `${(d.value / max) * 100}%` }}>
                  {text}
                </span>
              )}
              <span
                aria-hidden="true"
                className={clsx(
                  "w-full max-w-6 rounded-ub-full transition-[height,background-color] duration-ub-slow ease-ub-standard motion-reduce:transition-none",
                  d.status === "pending" ? "ub-chart-hatch" : active ? "bg-ub-chart-cat-1" : hover === i ? "bg-ub-chart-hatch" : "bg-ub-chart-muted",
                )}
                style={{ height: `${Math.max(6, (d.value / max) * 100)}%` }}
              />
            </li>
          );
        })}
      </ul>
      <div aria-hidden="true" className="mt-2 flex gap-2">
        {data.map((d, i) => (
          <span key={`${d.label}-${i}`} className={clsx("flex-1 truncate text-center text-ub-caption", i === hi ? "font-medium text-ub-text-primary" : "text-ub-text-tertiary")}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
