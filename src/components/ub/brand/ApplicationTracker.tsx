"use client";

import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import type { TrackerStepConfig } from "config/applicationStages";

// Application Tracker (brief §4.5), the hero component. Steps come from
// config (src/config/applicationStages.ts: STUDENT_PROFILE_STEPS,
// GLASS_BOX_STEPS) because the stage list is not confirmed (§11.1).

export type TrackerStepState = "complete" | "current" | "upcoming" | "attention" | "skipped";
export type TrackerOrientation = "auto" | "horizontal" | "vertical" | "responsive";

export interface TrackerStep {
  id: string;
  label: string;
  state: TrackerStepState;
  /** Shown under the label, e.g. "12 Jun 2026" (DD MMM YYYY). */
  date?: string;
  /** Short note under the label, e.g. "Passport copy needs replacing". Skipped steps show "Not required". */
  caption?: string;
}

export interface ApplicationTrackerProps {
  steps: TrackerStep[];
  /** Text after "Next step:" under the current step, e.g. "Upload the offer letter from Sunway University". */
  nextStep?: string;
  /**
   * auto: horizontal from 768px, vertical below (default). responsive: horizontal
   * from 768px, and below it a one-line summary ("Step 6 of 7 · Arrival") with a
   * segmented bar and a "Show all steps" toggle, so the tracker stays short on
   * phones. Or force horizontal / vertical.
   */
  orientation?: TrackerOrientation;
  /** Accessible name of the list. Default "Application progress". */
  label?: string;
  className?: string;
}

export const TRACKER_COPY = {
  listLabel: "Application progress",
  nextStepPrefix: "Next step:",
  skipped: "Not required",
  srComplete: "completed",
  srAttention: "needs attention",
  srUpcoming: "upcoming",
  allComplete: "All steps complete.",
  showSteps: "Show all steps",
  hideSteps: "Hide steps",
} as const;

/** "Step 6 of 7" for the step in focus (attention, else current, else last complete). */
export function trackerSummary(steps: TrackerStep[]): { index: number; total: number; step: TrackerStep | null; done: boolean } {
  const total = steps.length;
  const done = total > 0 && steps.every((s) => s.state === "complete" || s.state === "skipped");
  let index = steps.findIndex((s) => s.state === "attention");
  if (index < 0) index = steps.findIndex((s) => s.state === "current");
  if (index < 0) {
    steps.forEach((s, i) => {
      if (s.state === "complete") index = i;
    });
  }
  return { index, total, step: index >= 0 ? steps[index] : null, done };
}

const SEGMENT: Record<TrackerStepState, string> = {
  complete: "bg-ub-chart-1",
  current: "bg-ub-border-focus",
  upcoming: "bg-ub-border",
  attention: "bg-ub-danger-fill",
  skipped: "bg-ub-border-muted",
};

// Motion tokens in ms (brief §2.8): connector fill uses duration-ub-slow;
// the one-off pulse of the new current step runs for duration-deliberate.
const PULSE_MS = 480;
const EASE_STANDARD = "cubic-bezier(.2,0,0,1)";

/**
 * Builds tracker steps from a config preset: steps before `currentId` are
 * complete, `currentId` is current, the rest upcoming. `overrides` sets
 * attention/skipped states, dates and captions per step id.
 */
export function trackerStepsAt(preset: readonly TrackerStepConfig[], currentId: string | null, overrides: Record<string, Partial<Omit<TrackerStep, "id">>> = {}): TrackerStep[] {
  const at = currentId === null ? -1 : preset.findIndex((s) => s.id === currentId);
  return preset.map((s, i) => ({
    id: s.id,
    label: s.label,
    state: at < 0 ? "upcoming" : i < at ? "complete" : i === at ? "current" : "upcoming",
    ...overrides[s.id],
  }));
}

/** The sentence announced in the aria-live region after a status update. */
export function trackerAnnouncement(steps: TrackerStep[], nextStep?: string): string {
  const current = steps.find((s) => s.state === "current");
  const attention = steps.filter((s) => s.state === "attention");
  const parts: string[] = [];
  if (current) parts.push(`Current step: ${current.label}.`);
  attention.forEach((s) => parts.push(`${s.label} ${TRACKER_COPY.srAttention}.`));
  if (!current && !attention.length && steps.length && steps.every((s) => s.state === "complete" || s.state === "skipped")) parts.push(TRACKER_COPY.allComplete);
  if (current && nextStep) parts.push(`${TRACKER_COPY.nextStepPrefix} ${nextStep}.`);
  return parts.length ? `Application updated. ${parts.join(" ")}` : "";
}

// Literal class strings per orientation so Tailwind can see them.
const LAYOUT = {
  vertical: {
    list: "flex flex-col",
    item: "flex gap-3",
    rail: "flex flex-col items-center",
    track: "relative my-1 min-h-6 w-0.5 flex-1",
    fillEmpty: "h-0 w-full",
    text: "min-w-0 pb-6 pt-0.5",
    textLast: "min-w-0 pt-0.5",
  },
  horizontal: {
    list: "flex flex-row",
    item: "flex min-w-0 flex-1 flex-col gap-2 last:flex-none",
    rail: "flex flex-row items-center",
    track: "relative mx-2 h-0.5 flex-1",
    fillEmpty: "h-full w-0",
    text: "min-w-0 pe-4",
    textLast: "min-w-0",
  },
  auto: {
    list: "flex flex-col md:flex-row",
    item: "flex gap-3 md:min-w-0 md:flex-1 md:flex-col md:gap-2 md:last:flex-none",
    rail: "flex flex-col items-center md:flex-row",
    track: "relative my-1 min-h-6 w-0.5 flex-1 md:mx-2 md:my-0 md:h-0.5 md:min-h-0 md:w-auto",
    fillEmpty: "h-0 w-full md:h-full md:w-0",
    text: "min-w-0 pb-6 pt-0.5 md:pb-0 md:pe-4 md:pt-0",
    textLast: "min-w-0 pt-0.5 md:pt-0",
  },
} as const;

const NODE_BASE = "relative grid h-6 w-6 shrink-0 place-items-center rounded-ub-full";
const NODE: Record<TrackerStepState, string> = {
  complete: "bg-ub-action-primary text-ub-text-on-action",
  // shadow-ub-glow is `none` in light and the blue bloom in dark (brief §3.4).
  current: "border-2 border-ub-border-focus bg-ub-surface shadow-ub-glow",
  upcoming: "border border-ub-border-muted bg-ub-surface text-ub-label-sm text-ub-text-secondary ub-tabular",
  attention: "bg-ub-danger-fill text-ub-label-md font-bold text-ub-text-on-action",
  skipped: "border-ub-strong border-dashed border-ub-border-muted bg-ub-surface",
};
const LABEL: Record<TrackerStepState, string> = {
  complete: "text-ub-text-primary",
  current: "font-semibold text-ub-text-primary",
  upcoming: "text-ub-text-secondary",
  attention: "text-ub-text-primary",
  skipped: "text-ub-text-tertiary",
};
const SR_STATE: Partial<Record<TrackerStepState, string>> = {
  complete: TRACKER_COPY.srComplete,
  attention: TRACKER_COPY.srAttention,
  upcoming: TRACKER_COPY.srUpcoming,
};

function prefersReducedMotion() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Horizontal (≥768px) or vertical stepper for one application. Rendered as an
 * <ol> with aria-current="step" on the current step; status changes are
 * announced politely, the connector fills over 320ms and the new current step
 * pulses once (instant under prefers-reduced-motion).
 */
export default function ApplicationTracker({ steps, nextStep, orientation = "auto", label = TRACKER_COPY.listLabel, className }: ApplicationTrackerProps) {
  const nodeRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const signature = steps.map((s) => `${s.id}:${s.state}`).join("|");
  const prevSignature = useRef(signature);
  const currentId = steps.find((s) => s.state === "current")?.id;
  const prevCurrent = useRef(currentId);
  const [announcement, setAnnouncement] = useState("");

  // Announce status updates (not the initial render).
  useEffect(() => {
    if (prevSignature.current === signature) return;
    prevSignature.current = signature;
    setAnnouncement(trackerAnnouncement(steps, nextStep));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on a status change
  }, [signature]);

  // Pulse the newly current step once.
  useEffect(() => {
    if (prevCurrent.current === currentId) return;
    prevCurrent.current = currentId;
    if (!currentId || prefersReducedMotion()) return;
    // One node per rendered list (responsive mode renders two); pulse whichever is visible.
    Object.entries(nodeRefs.current).forEach(([key, node]) => {
      if (!key.endsWith(`:${currentId}`) || !node || typeof node.animate !== "function") return;
      node.animate([{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }], { duration: PULSE_MS, easing: EASE_STANDARD, iterations: 1 });
    });
  }, [currentId]);

  // A connector is filled once the step after it has been reached.
  let reached = -1;
  steps.forEach((s, i) => {
    if (s.state === "complete" || s.state === "current" || s.state === "attention") reached = i;
  });

  const renderList = (layout: keyof typeof LAYOUT, id?: string) => {
    const L = LAYOUT[layout];
    return (
      <ol id={id} aria-label={label} className={L.list}>
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          const filled = i + 1 <= reached;
          const sr = SR_STATE[step.state];
          const caption = step.state === "skipped" ? TRACKER_COPY.skipped : step.caption;
          return (
            <li key={step.id} aria-current={step.state === "current" ? "step" : undefined} data-state={step.state} className={L.item}>
              <div className={L.rail}>
                <span
                  ref={(el) => {
                    nodeRefs.current[`${layout}:${step.id}`] = el;
                  }}
                  aria-hidden="true"
                  className={clsx(NODE_BASE, NODE[step.state])}
                >
                  {step.state === "complete" && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  {step.state === "current" && <span className="h-2 w-2 rounded-ub-full bg-ub-border-focus" />}
                  {step.state === "upcoming" && i + 1}
                  {step.state === "attention" && "!"}
                </span>
                {!last && (
                  <span aria-hidden="true" className={clsx(L.track, "overflow-hidden rounded-ub-full bg-ub-border")}>
                    <span
                      data-filled={filled}
                      className={clsx(
                        "absolute start-0 top-0 rounded-ub-full bg-ub-chart-1 transition-[width,height] duration-ub-slow ease-ub-standard motion-reduce:transition-none",
                        filled ? "h-full w-full" : L.fillEmpty,
                      )}
                    />
                  </span>
                )}
              </div>
              <div className={last ? L.textLast : L.text}>
                <p className={clsx("text-ub-label-md", LABEL[step.state])}>
                  {step.label}
                  {sr && <span className="sr-only">{` (${sr})`}</span>}
                </p>
                {step.date && <p className="ub-tabular text-ub-caption text-ub-text-tertiary">{step.date}</p>}
                {caption && <p className={clsx("text-ub-caption", step.state === "attention" ? "text-ub-tone-danger-text" : "text-ub-text-tertiary")}>{caption}</p>}
                {step.state === "current" && nextStep && (
                  <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
                    <span className="font-medium text-ub-text-primary">{TRACKER_COPY.nextStepPrefix}</span> {nextStep}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    );
  };

  const summary = trackerSummary(steps);

  return (
    <div className={clsx("relative", className)}>
      {orientation === "responsive" ? (
        <>
          <div className="md:hidden">
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 text-ub-label-md text-ub-text-primary">
                {summary.done ? (
                  TRACKER_COPY.allComplete
                ) : summary.step ? (
                  <>
                    <span className="ub-tabular text-ub-text-secondary">
                      Step {summary.index + 1} of {summary.total}
                    </span>
                    <span aria-hidden="true" className="text-ub-text-tertiary"> · </span>
                    <span className={clsx("font-semibold", summary.step.state === "attention" && "text-ub-tone-danger-text")}>
                      {summary.step.label}
                      {summary.step.state === "attention" && <span className="sr-only">{` (${TRACKER_COPY.srAttention})`}</span>}
                    </span>
                  </>
                ) : (
                  <span className="text-ub-text-secondary">Not started</span>
                )}
              </p>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setExpanded((v) => !v)}
                className="-my-2 inline-flex min-h-10 shrink-0 items-center gap-1 rounded-ub-md px-1 text-ub-label-md text-ub-text-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ub-border-focus"
              >
                {expanded ? TRACKER_COPY.hideSteps : TRACKER_COPY.showSteps}
                <ChevronDown aria-hidden="true" className={clsx("h-4 w-4 transition-transform duration-ub-fast motion-reduce:transition-none", expanded && "rotate-180")} />
              </button>
            </div>
            <div aria-hidden="true" className="mt-3 flex gap-1">
              {steps.map((s) => (
                <span key={s.id} className={clsx("h-1.5 flex-1 rounded-ub-full", SEGMENT[s.state])} />
              ))}
            </div>
            {expanded && <div className="mt-5">{renderList("vertical", panelId)}</div>}
          </div>
          <div className="hidden md:block">{renderList("horizontal")}</div>
        </>
      ) : (
        renderList(orientation)
      )}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
