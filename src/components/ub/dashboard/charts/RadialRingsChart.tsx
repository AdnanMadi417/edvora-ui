"use client";

import clsx from "clsx";
import { ringSegmentPath, ringSegmentStroke } from "./segments";
import type { ReactNode } from "react";

export interface RadialRing {
  key: string;
  label: string;
  value: number;
  /** A CSS colour, normally from DONUT_COLORS (fixed order, never cycled). */
  color: string;
}

export interface RadialRingsChartProps {
  /** Outermost first. Each ring shows value ÷ total. */
  rings: RadialRing[];
  /** The whole each ring is a share of (drawn in the hole). */
  total: number;
  centerValue?: ReactNode;
  centerLabel?: ReactNode;
  /** Accessible summary. */
  label: string;
  /** Ring whose arc is emphasised (others dim), e.g. the selected filter. */
  activeKey?: string | null;
  className?: string;
}

const STROKE = 5;
const GAP = 3;

/**
 * Concentric rings, one per measure, each filled to its share of one total
 * (e.g. advisors: active, suspended, company, individual out of all advisors).
 * Arcs start at the top and run clockwise (mirrored in RTL) on a faint track;
 * the total sits in the hole. Text labels and values belong in a legend.
 */
export default function RadialRingsChart({ rings, total, centerValue, centerLabel, label, activeKey = null, className }: RadialRingsChartProps) {
  const outer = 50 - STROKE / 2;
  const summary = `${label}: ${rings.map((r) => `${r.label} ${r.value.toLocaleString()} of ${total.toLocaleString()}`).join(", ")}`;
  return (
    <div className={clsx("relative mx-auto aspect-square w-full max-w-[13rem]", className)}>
      <svg viewBox="0 0 100 100" role="img" aria-label={summary} className="h-full w-full rtl:-scale-x-100">
        {rings.map((ring, i) => {
          const r = outer - i * (STROKE + GAP);
          if (r <= STROKE) return null;
          const share = total > 0 ? Math.min(1, Math.max(0, ring.value / total)) : 0;
          const dim = activeKey != null && activeKey !== ring.key;
          const rIn = r - STROKE / 2;
          const rOut = r + STROKE / 2;
          const end = share * Math.PI * 2;
          const title = <title>{`${ring.label}: ${ring.value.toLocaleString()} of ${total.toLocaleString()}`}</title>;
          return (
            <g key={ring.key} className={clsx("transition-opacity duration-ub-fast motion-reduce:transition-none", dim && "opacity-30")}>
              {share >= 1 ? (
                <circle cx="50" cy="50" r={r} fill="none" strokeWidth={STROKE} style={{ stroke: ring.color }}>
                  {title}
                </circle>
              ) : (
                <>
                  {/* Filled share, then the rest of the track, each a rounded piece with a gap between. */}
                  {share > 0 && (
                    <path d={ringSegmentPath({ rIn, rOut, a0: 0, a1: end })} {...ringSegmentStroke} style={{ fill: ring.color, stroke: ring.color }}>
                      {title}
                    </path>
                  )}
                  {share > 0 ? (
                    <path d={ringSegmentPath({ rIn, rOut, a0: end, a1: Math.PI * 2 })} {...ringSegmentStroke} className="fill-ub-chart-track stroke-ub-chart-track" />
                  ) : (
                    <circle cx="50" cy="50" r={r} fill="none" strokeWidth={STROKE} className="stroke-ub-chart-track" />
                  )}
                </>
              )}
            </g>
          );
        })}
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerValue != null && <span className="ub-tabular text-ub-heading-lg text-ub-text-primary">{centerValue}</span>}
        {centerLabel && <span className="max-w-[45%] text-ub-caption text-ub-text-tertiary">{centerLabel}</span>}
      </div>
    </div>
  );
}
