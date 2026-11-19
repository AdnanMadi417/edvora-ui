import type { ReactNode } from "react";
import clsx from "clsx";
import WidgetStatus, { resolveWidgetState } from "../shared/WidgetStatus";
import { CHART_FILL, CHART_STROKE, type ChartColor, type WidgetStateProps } from "../types";
import { ringSegmentPath, ringSegmentStroke } from "./segments";

export interface GaugeSegment {
  label: string;
  /** Percentage of the whole (segments should sum to ≤ 100). */
  value: number;
  color: Exclude<ChartColor, "hatch">;
}

export interface GaugeChartProps extends WidgetStateProps {
  /** One value (0–100) on a track, or segments (stacked around the arc). */
  value?: number;
  segments?: GaugeSegment[];
  /** Big centre text. Default the value as a percentage. */
  centerLabel?: ReactNode;
  /** Small line under it, e.g. "placed this intake". */
  centerCaption?: ReactNode;
  /** Accessible summary, e.g. "Placement rate". */
  label: string;
  className?: string;
}

const GAP = 1; // surface gap between segments, in pathLength units (of 100)

/** Pure: dash pattern + offset per segment along a 0–100 arc, with a gap between neighbours. */
export function gaugeDashes(segments: { value: number }[]): { dash: string; offset: number }[] {
  let start = 0;
  return segments.map((s, i) => {
    const len = Math.max(0, Math.min(100 - start, s.value) - (i < segments.length - 1 && s.value > GAP ? GAP : 0));
    const out = { dash: `${len} ${100 - len}`, offset: -start };
    start += s.value;
    return out;
  });
}

// Half ring from 9 o'clock to 3 o'clock, r=37–47, in the shared segment style.
const R_IN = 37;
const R_OUT = 47;
const angle = (percent: number) => -Math.PI / 2 + (Math.min(100, Math.max(0, percent)) / 100) * Math.PI;

/**
 * Half-donut gauge for a percentage or a split (placed / in progress / lost),
 * with a centre label. Fills from the start side (mirrored in RTL).
 */
export default function GaugeChart({ value, segments, centerLabel, centerCaption, label, state, emptyMessage, errorMessage, onRetry, className }: GaugeChartProps) {
  const segs: GaugeSegment[] = segments ?? (typeof value === "number" ? [{ label, value: Math.max(0, Math.min(100, value)), color: "cat-1" }] : []);
  const resolved = resolveWidgetState(state, segs.length > 0);
  if (resolved !== "ready") return <WidgetStatus state={resolved} skeleton="stat" emptyMessage={emptyMessage} errorMessage={errorMessage} onRetry={onRetry} className={className} />;
  const summary = segments ? `${label}: ${segs.map((s) => `${s.label} ${s.value}%`).join(", ")}` : `${label}: ${segs[0].value}%`;
  return (
    <div className={clsx("relative mx-auto w-full max-w-72", className)}>
      <svg role="img" aria-label={summary} viewBox="0 0 100 54" className="w-full overflow-visible rtl:-scale-x-100">
        {(() => {
          let start = 0;
          const pieces = segs
            .filter((seg) => seg.value > 0)
            .map((seg) => {
              const piece = { seg, from: start, to: Math.min(100, start + seg.value) };
              start = piece.to;
              return piece;
            });
          return (
            <>
              {pieces.map(({ seg, from, to }, i) => (
                <path
                  key={seg.label}
                  d={ringSegmentPath({ rIn: R_IN, rOut: R_OUT, a0: angle(from), a1: angle(to), gapStart: i === 0 ? 0 : undefined, gapEnd: to >= 100 ? 0 : undefined })}
                  {...ringSegmentStroke}
                  className={clsx(CHART_FILL[seg.color], CHART_STROKE[seg.color])}
                />
              ))}
              {start < 100 && (
                <path
                  d={ringSegmentPath({ rIn: R_IN, rOut: R_OUT, a0: angle(start), a1: angle(100), gapStart: start === 0 ? 0 : undefined, gapEnd: 0 })}
                  {...ringSegmentStroke}
                  className="fill-ub-chart-track stroke-ub-chart-track"
                />
              )}
            </>
          );
        })()}
      </svg>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 text-center">
        <p className="ub-tabular text-ub-data-lg text-ub-text-primary">{centerLabel ?? `${segs[0].value}%`}</p>
        {centerCaption && <p className="text-ub-caption text-ub-text-tertiary">{centerCaption}</p>}
      </div>
    </div>
  );
}
