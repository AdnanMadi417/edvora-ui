"use client";

import clsx from "clsx";
import Link from "next/link";
import { focusRing } from "components/ub/recipes";
import { SEGMENT_CLASS, SEGMENT_ROW_CLASS } from "../charts/segments";

/** Status tones say good / waiting / problem; categorical slots only name things. */
export type SegmentTone = "success" | "warning" | "danger" | "neutral" | "cat-1" | "cat-2";

const FILL: Record<SegmentTone, string> = {
  success: "bg-ub-tone-success-dot",
  warning: "bg-ub-tone-warning-dot",
  danger: "bg-ub-tone-danger-dot",
  neutral: "bg-ub-tone-neutral-dot",
  "cat-1": "bg-ub-chart-cat-1",
  "cat-2": "bg-ub-chart-cat-2",
};

export interface SegmentedBarPart {
  id: string;
  label: string;
  value: number;
  tone: SegmentTone;
  /** Opens the list filtered to this part. */
  href?: string;
}

export interface SegmentedBarRow {
  /** One dimension, e.g. "Verification". Its parts add up to the whole. */
  label: string;
  parts: SegmentedBarPart[];
}

export interface SegmentedBarsProps {
  rows: SegmentedBarRow[];
  /** Noun for counts in screen-reader text, e.g. "advisors". */
  unit: string;
  className?: string;
}

/**
 * One whole split several ways, one row per dimension (never two dimensions
 * in one chart): a bar whose parts add up to the whole, then each part's
 * name, count and share as a link to the filtered list.
 */
export default function SegmentedBars({ rows, unit, className }: SegmentedBarsProps) {
  return (
    <div className={clsx("grid gap-5", className)}>
      {rows.map((row) => {
        const total = row.parts.reduce((sum, p) => sum + p.value, 0);
        return (
          <section key={row.label} aria-label={row.label} className="min-w-0">
            <h3 className="text-ub-label-md text-ub-text-secondary">{row.label}</h3>
            <div aria-hidden="true" className={clsx("mt-2 h-2.5", SEGMENT_ROW_CLASS)}>
              {row.parts
                .filter((p) => p.value > 0)
                .map((p) => (
                  <span key={p.id} className={clsx(SEGMENT_CLASS, FILL[p.tone])} style={{ flexGrow: p.value, flexBasis: 0 }} />
                ))}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {row.parts.map((p) => {
                const share = total ? Math.round((p.value / total) * 100) : 0;
                const body = (
                  <>
                    <span aria-hidden="true" className={clsx("h-2.5 w-2.5 shrink-0 rounded-ub-full", FILL[p.tone])} />
                    <span className="text-ub-text-secondary">{p.label}</span>
                    <span className="ub-tabular text-ub-label-md text-ub-text-primary">{p.value.toLocaleString()}</span>
                    <span className="ub-tabular text-ub-caption text-ub-text-tertiary">{share}%</span>
                  </>
                );
                const cls = "inline-flex min-h-11 items-center gap-2 rounded-ub-md text-ub-body-sm";
                return (
                  <li key={p.id}>
                    {p.href ? (
                      <Link href={p.href} aria-label={`${row.label}, ${p.label}: ${p.value.toLocaleString()} ${unit}, ${share}%`} className={clsx(cls, "-mx-1 px-1 hover:bg-ub-surface-subtle", focusRing)}>
                        {body}
                      </Link>
                    ) : (
                      <span className={cls}>{body}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
