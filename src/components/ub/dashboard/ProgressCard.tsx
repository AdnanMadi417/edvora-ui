import type { ReactNode } from "react";
import ProgressBar, { type ProgressTone } from "components/ub/feedback/ProgressBar";
import DashboardCard from "./DashboardCard";
import type { WidgetStateProps } from "./types";

export interface ProgressCardProps extends Omit<WidgetStateProps, "emptyMessage"> {
  title: string;
  /** Steps done. */
  done: number;
  /** Total steps. */
  total: number;
  /** What a step is, e.g. "documents verified". */
  stepLabel?: string;
  description?: ReactNode;
  /** Header control, e.g. a CardLinkButton. */
  action?: ReactNode;
  /** Defaults to success when complete, brand otherwise. */
  tone?: ProgressTone;
  className?: string;
}

/** Title, progress bar and "3 of 5 steps" count (tabular), e.g. onboarding or document checks. */
export default function ProgressCard({ title, done, total, stepLabel = "steps", description, action, tone, state = "ready", errorMessage, onRetry, className }: ProgressCardProps) {
  const complete = total > 0 && done >= total;
  return (
    <DashboardCard title={title} actions={action} state={state} skeleton="lines" errorMessage={errorMessage} onRetry={onRetry} className={className}>
      <ProgressBar value={Math.min(done, total)} max={Math.max(total, 1)} label={<span className="ub-tabular text-ub-text-secondary">{done} of {total} {stepLabel}</span>} valueText={`${done} of ${total} ${stepLabel}`} tone={tone ?? (complete ? "success" : "brand")} />
      {description && <p className="mt-3 text-ub-body-sm text-ub-text-secondary">{description}</p>}
    </DashboardCard>
  );
}
