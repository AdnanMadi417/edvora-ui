"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { CHART_OTHER, CHART_PALETTE } from "config/chartPalette";

export interface DonutSegment {
  key: string;
  label: string;
  value: number;
  /** A CSS colour, normally from DONUT_COLORS. */
  color: string;
}

/** The chart palette (config/chartPalette.ts), kept under its old names for existing callers. */
export const DONUT_COLORS = CHART_PALETTE;
export const DONUT_OTHER_COLOR = CHART_OTHER;

export interface DonutChartProps {
  segments: DonutSegment[];
  /** Big text in the hole, e.g. the total. */
  centerValue?: ReactNode;
  /** Small text above it, e.g. "Active applications". */
  centerLabel?: ReactNode;
  /** Accessible summary of the chart. */
  label: string;
  className?: string;
}

// pathLength is 100, so a gap of 1.2 is ~2px on a 160px ring.
const GAP = 1.2;

/** Full ring of slices with a 2px surface gap between them, starting at the top and going clockwise. */
export default function DonutChart({ segments, centerValue, centerLabel, label, className }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const visible = segments.filter((s) => s.value > 0);
  let start = 0;
  const arcs = visible.map((s) => {
    const share = (s.value / total) * 100;
    const length = Math.max(0, share - (visible.length > 1 ? GAP : 0));
    const arc = { ...s, share, dash: `${length} ${100 - length}`, offset: -start };
    start += share;
    return arc;
  });
  const summary = `${label}: ${visible.map((s) => `${s.label} ${s.value.toLocaleString()} (${Math.round((s.value / total) * 100)}%)`).join(", ")}`;

  return (
    <div className={clsx("relative mx-auto aspect-square w-full max-w-[11rem]", className)}>
      <svg viewBox="0 0 100 100" role="img" aria-label={total > 0 ? summary : `${label}: none`} className="h-full w-full rtl:-scale-x-100">
        <g transform="rotate(-90 50 50)">
        <circle cx="50" cy="50" r="40" fill="none" strokeWidth="14" className="stroke-ub-chart-track" pathLength={100} />
        {arcs.map((a) => (
          <circle
            key={a.key}
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="14"
            pathLength={100}
            strokeDasharray={a.dash}
            strokeDashoffset={a.offset}
            style={{ stroke: a.color }}
          >
            <title>{`${a.label}: ${a.value.toLocaleString()} (${Math.round(a.share)}%)`}</title>
          </circle>
        ))}
        </g>
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerLabel && <span className="max-w-[60%] text-ub-caption text-ub-text-tertiary">{centerLabel}</span>}
        {centerValue != null && <span className="ub-tabular text-ub-heading-lg text-ub-text-primary">{centerValue}</span>}
      </div>
    </div>
  );
}
