import { ClipboardList } from "lucide-react";
import StatTile from "components/ub/dashboard/cards/StatTile";

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
      <StatTile
        label={scopeLabel}
        value={total.toLocaleString()}
        footer={{ text: "Across your pipeline" }}
        className="col-span-2 sm:col-span-1"
        icon={ClipboardList}
        state={state}
        errorMessage={error || undefined}
      />
      <StatTile
        label="Stages in use"
        value={stagesInUse.toLocaleString()}
        footer={{ text: "Stages with applications" }}
        state={state}
        errorMessage={error || undefined}
      />
      <StatTile
        label="In commission stage"
        value={commissionCount.toLocaleString()}
        footer={{ text: "Includes every status in that stage" }}
        iconTone="success"
        state={state}
        errorMessage={error || undefined}
      />
    </div>
  );
}
