import { type ReactNode } from "react";
import DashboardStatCard from "components/ub/dashboard/cards/StatCard";
import { formatDelta as formatDeltaValue } from "components/ub/dashboard/shared/DeltaPill";

export interface StatCardDelta {
  /** Signed change, e.g. 12 or -3.5. Zero renders as neutral. */
  value: number;
  /** Appended to the number. Default "%". */
  unit?: string;
  /** Which direction is good news. Default "up" (set "down" for e.g. overdue documents). */
  goodWhen?: "up" | "down";
}

export interface StatCardProps {
  label: string;
  /** Kept for older callers; the one StatCard shows icons through `variant="icon"` only. */
  icon?: ReactNode;
  /** Pre-formatted value, e.g. "RM4,200" or "128". */
  value: ReactNode;
  delta?: StatCardDelta;
  /** Read with the delta, e.g. "vs last intake". */
  context?: string;
  /** Optional trend, oldest first: drawn as mini bars. */
  sparkline?: number[];
  sparklineLabel?: string;
  loading?: boolean;
  className?: string;
}

/** "+12%", "−3%", "0%". Uses a true minus sign. */
export function formatDelta({ value, unit = "%" }: StatCardDelta): string {
  return formatDeltaValue(value, unit);
}

/**
 * Older data-kit StatCard API, now drawn by the one dashboard StatCard so every
 * stat card in the portal looks and behaves the same. New code imports
 * `StatCard` from components/ub/dashboard.
 */
export default function StatCard({ label, value, delta, context, sparkline, sparklineLabel, loading, className }: StatCardProps) {
  return (
    <DashboardStatCard
      label={label}
      value={value}
      delta={delta ? { value: delta.value, unit: delta.unit, goodWhen: delta.goodWhen, comparedTo: context } : undefined}
      caption={!delta ? context : undefined}
      variant={sparkline?.length ? "bars" : "default"}
      bars={sparkline}
      barsLabel={sparklineLabel}
      state={loading ? "loading" : "ready"}
      className={className}
    />
  );
}
