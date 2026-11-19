"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { CHART_OTHER, CHART_PALETTE } from "config/chartPalette";
import { ringSegmentPath, ringSegmentStroke } from "./segments";

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

// Ring from r=37 to r=47 in a 100×100 box; slices use the shared segment style (segments.ts).
const R_IN = 37;
const R_OUT = 47;
const TAU = Math.PI * 2;

/** Full ring of slices with rounded corners and an even gap between them, starting at the top and going clockwise. */
export default function DonutChart({ segments, centerValue, centerLabel, label, className }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const visible = segments.filter((s) => s.value > 0);
  let start = 0;
  const arcs = visible.map((s) => {
    const share = s.value / total;
    const arc = { ...s, share: share * 100, d: visible.length > 1 ? ringSegmentPath({ rIn: R_IN, rOut: R_OUT, a0: start * TAU, a1: (start + share) * TAU }) : null };
    start += share;
    return arc;
  });
  const summary = `${label}: ${visible.map((s) => `${s.label} ${s.value.toLocaleString()} (${Math.round((s.value / total) * 100)}%)`).join(", ")}`;
  const ring = (R_IN + R_OUT) / 2;

  return (
    <div className={clsx("relative mx-auto aspect-square w-full max-w-[11rem]", className)}>
      <svg viewBox="0 0 100 100" role="img" aria-label={total > 0 ? summary : `${label}: none`} className="h-full w-full rtl:-scale-x-100">
        {/* The track only shows when there's nothing to draw; slices sit on the surface. */}
        {!arcs.length && <circle cx="50" cy="50" r={ring} fill="none" strokeWidth={R_OUT - R_IN} className="stroke-ub-chart-track" />}
        {arcs.map((a) =>
          a.d ? (
            <path key={a.key} d={a.d} {...ringSegmentStroke} style={{ fill: a.color, stroke: a.color }}>
              <title>{`${a.label}: ${a.value.toLocaleString()} (${Math.round(a.share)}%)`}</title>
            </path>
          ) : (
            <circle key={a.key} cx="50" cy="50" r={ring} fill="none" strokeWidth={R_OUT - R_IN} style={{ stroke: a.color }}>
              <title>{`${a.label}: ${a.value.toLocaleString()} (100%)`}</title>
            </circle>
          )
        )}
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerLabel && <span className="max-w-[60%] text-ub-caption text-ub-text-tertiary">{centerLabel}</span>}
        {centerValue != null && <span className="ub-tabular text-ub-heading-lg text-ub-text-primary">{centerValue}</span>}
      </div>
    </div>
  );
}
