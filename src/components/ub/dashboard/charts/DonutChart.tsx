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

// Ring from r=37 to r=47 in a 100×100 box. Each slice is a ring segment with
// RC-radius rounded corners (a filled path shrunk by RC, stroked RC×2 with round
// joins) and a GAP-wide surface gap of the same width from the inside to the outside.
const R_IN = 37;
const R_OUT = 47;
const RC = 2;
const GAP = 1.6;
const TAU = Math.PI * 2;

const point = (r: number, angle: number) => `${(50 + r * Math.sin(angle)).toFixed(3)} ${(50 - r * Math.cos(angle)).toFixed(3)}`;

/** A ring segment from a0 to a1 (radians, clockwise from the top) with rounded corners. */
function segmentPath(a0: number, a1: number) {
  const ro = R_OUT - RC;
  const ri = R_IN + RC;
  const inset = (r: number) => (GAP / 2 + RC) / r;
  // Keep at least a sliver so tiny slices still show as a rounded dot.
  const clamp = (start: number, end: number) => (end - start > 0.0005 ? [start, end] : [(start + end) / 2 - 0.00025, (start + end) / 2 + 0.00025]);
  const [o0, o1] = clamp(a0 + inset(ro), a1 - inset(ro));
  const [i0, i1] = clamp(a0 + inset(ri), a1 - inset(ri));
  const large = (end: number, start: number) => (end - start > Math.PI ? 1 : 0);
  return `M ${point(ro, o0)} A ${ro} ${ro} 0 ${large(o1, o0)} 1 ${point(ro, o1)} L ${point(ri, i1)} A ${ri} ${ri} 0 ${large(i1, i0)} 0 ${point(ri, i0)} Z`;
}

/** Full ring of slices with rounded corners and an even gap between them, starting at the top and going clockwise. */
export default function DonutChart({ segments, centerValue, centerLabel, label, className }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const visible = segments.filter((s) => s.value > 0);
  let start = 0;
  const arcs = visible.map((s) => {
    const share = s.value / total;
    const arc = { ...s, share: share * 100, d: visible.length > 1 ? segmentPath(start * TAU, (start + share) * TAU) : null };
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
            <path key={a.key} d={a.d} strokeWidth={RC * 2} strokeLinejoin="round" style={{ fill: a.color, stroke: a.color }}>
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
