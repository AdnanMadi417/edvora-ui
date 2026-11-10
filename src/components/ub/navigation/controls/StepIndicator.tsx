"use client";

import clsx from "clsx";
import { Check } from "lucide-react";
import { focusRing } from "components/ub/recipes";

export interface StepIndicatorStep {
  id: string;
  label: string;
  /** One line under the label from 768px, e.g. "Passport and programme". */
  description?: string;
}

export interface StepIndicatorProps {
  steps: StepIndicatorStep[];
  /** The step on screen. */
  currentId: string;
  /** Steps already done (shown with a check). */
  completedIds?: string[];
  /** Makes reachable steps clickable: completed ones and the current one. */
  onStepClick?: (id: string) => void;
  /** Accessible name. Default "Form steps". */
  "aria-label"?: string;
  className?: string;
}

/** Pure: a step can be opened when it's done, current, or follows a done step. */
export function canOpenStep(steps: StepIndicatorStep[], id: string, currentId: string, completedIds: string[]): boolean {
  if (id === currentId || completedIds.includes(id)) return true;
  const i = steps.findIndex((s) => s.id === id);
  return i > 0 && completedIds.includes(steps[i - 1].id);
}

/**
 * Progress through a multi-step form (brief §4.5 pattern, §9): numbered
 * steps with a connector from 768px; below it a compact "Step 2 of 4" line
 * with a segmented bar. aria-current="step" marks the current step;
 * completed steps are announced as completed.
 */
export default function StepIndicator({ steps, currentId, completedIds = [], onStepClick, "aria-label": ariaLabel = "Form steps", className }: StepIndicatorProps) {
  const compact = steps.length > 4;
  const currentIndex = Math.max(0, steps.findIndex((s) => s.id === currentId));
  const current = steps[currentIndex];

  return (
    <nav aria-label={ariaLabel} className={className}>
      {/* Mobile: compact summary */}
      <div className="md:hidden">
        <p className="ub-tabular text-ub-label-sm text-ub-text-tertiary">
          Step {currentIndex + 1} of {steps.length}
        </p>
        <p className="text-ub-label-lg text-ub-text-primary">{current?.label}</p>
        <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }} aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.id} className={clsx("h-1.5 rounded-ub-full transition-colors duration-ub-slow ease-ub-standard motion-reduce:transition-none", i < currentIndex || completedIds.includes(s.id) ? "bg-ub-action-primary" : i === currentIndex ? "bg-ub-border-focus" : "bg-ub-border")} />
          ))}
        </div>
      </div>

      {/* From 768px: full step list */}
      <ol className="hidden md:flex">
        {steps.map((s, i) => {
          const done = completedIds.includes(s.id) && s.id !== currentId;
          const isCurrent = s.id === currentId;
          const open = !!onStepClick && canOpenStep(steps, s.id, currentId, completedIds);
          const last = i === steps.length - 1;
          const marker = (
            <span
              aria-hidden="true"
              className={clsx(
                "ub-tabular grid shrink-0 place-items-center rounded-ub-full border text-ub-label-md transition-[background-color,border-color,color,box-shadow] duration-ub-slow ease-ub-standard motion-reduce:transition-none",
                compact ? "h-7 w-7" : "h-8 w-8",
                done && "border-transparent bg-ub-action-primary text-ub-action-primary-text",
                isCurrent && "border-2 border-ub-border-focus bg-ub-surface text-ub-text-link shadow-ub-glow",
                !done && !isCurrent && "border-ub-border-muted bg-ub-surface text-ub-text-secondary",
              )}
            >
              {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
            </span>
          );
          const text = (
            <span className="min-w-0 text-start">
              <span className={clsx("block truncate", compact ? "text-ub-label-sm" : "text-ub-label-md", isCurrent ? "text-ub-text-primary" : done ? "text-ub-text-primary" : "text-ub-text-secondary")}>
                {s.label}
                {done && <span className="sr-only"> (completed)</span>}
              </span>
              {s.description && !compact && <span className="block truncate text-ub-caption text-ub-text-tertiary">{s.description}</span>}
            </span>
          );
          return (
            <li key={s.id} aria-current={isCurrent ? "step" : undefined} className={clsx("flex min-w-0 items-center", !last && "flex-1")}>
              {open && !isCurrent ? (
                <button type="button" onClick={() => onStepClick?.(s.id)} className={clsx("flex min-w-0 items-center rounded-ub-md p-1 hover:bg-ub-action-ghost-hover", compact ? "gap-2" : "gap-3", focusRing)}>
                  {marker}
                  {text}
                </button>
              ) : (
                <span className={clsx("flex min-w-0 items-center p-1", compact ? "gap-2" : "gap-3")}>
                  {marker}
                  {text}
                </span>
              )}
              {!last && <span aria-hidden="true" className={clsx("h-0.5 flex-1 rounded-ub-full transition-colors duration-ub-slow ease-ub-standard motion-reduce:transition-none", compact ? "mx-2 min-w-2" : "mx-3 min-w-6", done ? "bg-ub-action-primary" : "bg-ub-border")} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
