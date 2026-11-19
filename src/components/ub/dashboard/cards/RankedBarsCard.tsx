import type { ReactNode } from "react";
import DashboardCard from "./DashboardCard";
import RankedBars, { type RankedBarsProps } from "../charts/RankedBars";
import type { WidgetState } from "../types";

export interface RankedBarsCardProps extends Omit<RankedBarsProps, "label" | "className"> {
  title: string;
  subtitle?: ReactNode;
  /** End-side header controls, e.g. a CardLinkButton. */
  actions?: ReactNode;
  /** Small print under the chart: data period, what Others contains, the source. */
  note?: ReactNode;
  state?: WidgetState;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  as?: "h2" | "h3" | "h4";
  className?: string;
}

/** A ranked breakdown in a dashboard card (title, ranked bars, optional source note). */
export default function RankedBarsCard({
  title,
  subtitle,
  actions,
  note,
  state = "ready",
  emptyMessage = "Nothing to show yet.",
  errorMessage,
  onRetry,
  as = "h2",
  className,
  ...bars
}: RankedBarsCardProps) {
  const empty = !bars.items.some((i) => i.value > 0);
  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      actions={actions}
      as={as}
      state={state === "ready" && empty ? "empty" : state}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      onRetry={onRetry}
      skeleton="list"
      className={className}
      footer={note ? <p className="text-ub-caption text-ub-text-tertiary">{note}</p> : undefined}
    >
      <RankedBars label={title} {...bars} />
    </DashboardCard>
  );
}
