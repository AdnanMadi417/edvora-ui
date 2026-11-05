import { ClipboardList } from "lucide-react";
import StatCard from "components/ub/dashboard/cards/StatCard";

export interface ApplicationStatisticsProps {
  total: number;
  stagesInUse: number;
  commissionCount: number;
  scopeLabel?: string;
  loading?: boolean;
  error?: string | null;
}

/** Role-scoped totals from the application list endpoints, never from the current page. */
export default function ApplicationStatistics({
  total,
  stagesInUse,
  commissionCount,
  scopeLabel = "Active applications",
  loading,
  error,
}: ApplicationStatisticsProps) {
  const state = loading ? "loading" : error ? "error" : "ready";
  return (
    <div
      aria-label="Application statistics"
      className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3"
    >
      <StatCard
        label={scopeLabel}
        value={total.toLocaleString()}
        caption="Across your pipeline"
        variant="highlighted"
        className="col-span-2 sm:col-span-1"
        icon={ClipboardList}
        state={state}
        errorMessage={error || undefined}
      />
      <StatCard
        label="Stages in use"
        value={stagesInUse.toLocaleString()}
        caption="Stages with applications"
        variant="default"
          state={state}
        errorMessage={error || undefined}
      />
      <StatCard
        label="In commission stage"
        value={commissionCount.toLocaleString()}
        caption="Includes every status in that stage"
        variant="default"
          iconTone="success"
        state={state}
        errorMessage={error || undefined}
      />
    </div>
  );
}
