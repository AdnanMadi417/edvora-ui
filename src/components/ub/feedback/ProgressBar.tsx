"use client";

import React, { ReactNode, useId } from "react";
import clsx from "clsx";
import { progressFill, progressTrack } from "components/ub/recipes";

export type ProgressTone = "brand" | "success" | "warning" | "danger";

const TONE_FILL: Record<ProgressTone, string> = {
  brand: "bg-ub-chart-1",
  success: "bg-ub-success-600",
  warning: "bg-ub-warning-500",
  danger: "bg-ub-danger-600",
};

// progressFill carries the brand fill; swap it so only one bg-* class applies.
const fillFor = (tone: ProgressTone) => progressFill.replace("bg-ub-chart-1", TONE_FILL[tone]);

// Indeterminate slide. Scoped keyframes (no global CSS edits); off under reduced motion.
const INDETERMINATE_CSS = `
@keyframes ub-progress-slide { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
@keyframes ub-progress-slide-rtl { from { transform: translateX(100%); } to { transform: translateX(-250%); } }
.ub-progress-indeterminate { animation: ub-progress-slide 1.4s cubic-bezier(.2,0,0,1) infinite; }
[dir="rtl"] .ub-progress-indeterminate { animation-name: ub-progress-slide-rtl; }
@media (prefers-reduced-motion: reduce) { .ub-progress-indeterminate, [dir="rtl"] .ub-progress-indeterminate { animation: none; } }
`;

export interface ProgressBarProps {
  value?: number;
  max?: number;
  /** Visible label above the bar. Without it, pass `aria-label`. */
  label?: ReactNode;
  "aria-label"?: string;
  /** Show the value text beside the label (default true). */
  showValue?: boolean;
  /** Custom value text, e.g. "3 of 5 steps". Defaults to a rounded percentage. Also used as aria-valuetext. */
  valueText?: string;
  tone?: ProgressTone;
  /** Unknown progress: a sliding segment (static under reduced motion). */
  indeterminate?: boolean;
  className?: string;
}

/**
 * Progress bar (brief §4.7): 8px pill track with a tone fill, optional label
 * and value text (tabular). role="progressbar" with aria-valuenow/min/max.
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  "aria-label": ariaLabel,
  showValue = true,
  valueText,
  tone = "brand",
  indeterminate = false,
  className,
}: ProgressBarProps) {
  const labelId = useId();
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);
  const text = valueText ?? `${percent}%`;

  return (
    <div className={clsx("w-full", className)}>
      {(label || (showValue && !indeterminate)) && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          {label && (
            <span id={labelId} className="text-ub-label-md text-ub-text-primary">
              {label}
            </span>
          )}
          {showValue && !indeterminate && <span className="ub-tabular ms-auto text-ub-body-sm text-ub-text-secondary">{text}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : safeMax}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuetext={indeterminate ? undefined : text}
        aria-busy={indeterminate || undefined}
        className={progressTrack}
      >
        {indeterminate ? (
          <>
            <style>{INDETERMINATE_CSS}</style>
            <div className={clsx("ub-progress-indeterminate h-full w-2/5 rounded-ub-full", TONE_FILL[tone])} />
          </>
        ) : (
          <div className={fillFor(tone)} style={{ width: `${percent}%` }} />
        )}
      </div>
    </div>
  );
}
