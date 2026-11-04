import ApplicationTracker, { TRACKER_COPY, trackerStepsAt, type TrackerStep } from "components/ub/brand/ApplicationTracker";
import SectionCard, { type SectionCardState } from "components/ub/data/cards/SectionCard";
import { APPLICATION_TRACKER_STEPS, type ResolvedStage } from "features/applications/stages";

/**
 * Pure: tracker steps for a resolved stage. Steps before the current one are
 * complete; "done" completes them all; attention marks the current step.
 */
export function trackerStepsFor(resolved: ResolvedStage | null): TrackerStep[] {
  if (!resolved) return trackerStepsAt(APPLICATION_TRACKER_STEPS, null);
  if (resolved.stepId === "done") return APPLICATION_TRACKER_STEPS.map((s) => ({ id: s.id, label: s.label, state: "complete" }));
  return trackerStepsAt(APPLICATION_TRACKER_STEPS, resolved.stepId, resolved.attention ? { [resolved.stepId]: { state: "attention" } } : {});
}

export interface ApplicationTrackerCardProps {
  /** From resolveStage() in features/applications/stages.ts. */
  stage: ResolvedStage | null;
  /** The viewer's next action, shown as "Next step: …" (announced politely on change). */
  nextStep?: string | null;
  /** Backend status name, shown as the caption under the heading. */
  statusName?: string | null;
  state?: SectionCardState;
  onRetry?: () => void;
  className?: string;
}

/** Progress card (brief §6): horizontal tracker from md, vertical below, with the next step. */
export default function ApplicationTrackerCard({ stage, nextStep, statusName, state = "ready", onRetry, className }: ApplicationTrackerCardProps) {
  return (
    <SectionCard
      title="Application progress"
      description={statusName ?? undefined}
      state={state}
      loadingRows={2}
      errorMessage="Progress couldn't load."
      onRetry={onRetry}
      className={className}
    >
      <ApplicationTracker steps={trackerStepsFor(stage)} orientation="auto" />
      {/* Its own line (not under the current step) so it also shows on attention and completed states. */}
      <p aria-live="polite" className="mt-6 rounded-ub-md bg-ub-surface-subtle px-4 py-3 text-ub-body-sm text-ub-text-secondary">
        {nextStep ? (
          <>
            <span className="font-medium text-ub-text-primary">{TRACKER_COPY.nextStepPrefix}</span> {nextStep}
          </>
        ) : (
          TRACKER_COPY.allComplete
        )}
      </p>
    </SectionCard>
  );
}
