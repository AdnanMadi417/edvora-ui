"use client";

import { useId } from "react";
import { ArrowUpRight, Layers, RotateCcw } from "lucide-react";
import Button from "components/ub/core/buttons/Button";
import PipelineBar from "components/ub/dashboard/pipeline/PipelineBar";
import WidgetStatus from "components/ub/dashboard/shared/WidgetStatus";
import { focusRing } from "components/ub/recipes";
import ApplicationStatistics from "features/applications/components/ApplicationStatistics";
import { resolveStage, stageCodeOf } from "features/applications/stages";

export interface PipelineStage {
  id: string;
  name: string;
  code?: string;
}
export interface PipelineCardProps {
  stages: PipelineStage[];
  stageCounts: Record<string, number>;
  stageActionRequired: Record<string, boolean>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  totalCount: number;
  /** Legacy stage-level attention estimate; not used as an application statistic. */
  totalActionRequired?: number;
  onViewCommission: () => void;
  title?: string;
  subtitle?: string;
  scopeLabel?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const isCommissionStage = (stage: PipelineStage) =>
  stage.code === "PARTNER_COMMISSION_INVOICING" ||
  /commission/i.test(stage.name);

export default function PipelineCard({
  stages,
  stageCounts,
  stageActionRequired,
  selectedId,
  onSelect,
  totalCount,
  onViewCommission,
  title = "Your pipeline",
  subtitle,
  scopeLabel = "Active applications",
  loading,
  error,
  onRetry,
}: PipelineCardProps) {
  const titleId = useId();
  const commissionCount = stages
    .filter(isCommissionStage)
    .reduce((sum, stage) => sum + (stageCounts[stage.id] || 0), 0);
  const stagesInUse = stages.filter(
    (stage) => (stageCounts[stage.id] || 0) > 0
  ).length;
  const chartCounts: Record<string, number> = {};
  for (const stage of stages) {
    const key = resolveStage({ stageCode: stageCodeOf(stage) })?.stageId;
    if (key)
      chartCounts[key] = (chartCounts[key] || 0) + (stageCounts[stage.id] || 0);
  }
  const selected = stages.find((stage) => stage.id === selectedId);
  const hasCommission = stages.some(isCommissionStage);
  return (
    <section aria-labelledby={titleId} className="min-w-0 space-y-4">
      <ApplicationStatistics
        total={totalCount}
        stagesInUse={stagesInUse}
        commissionCount={commissionCount}
        scopeLabel={scopeLabel}
        loading={loading}
        error={error}
      />
      <div className="overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface shadow-ub-xs">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ub-border p-4 sm:p-5">
          <div className="min-w-0">
            <h3
              id={titleId}
              className="text-ub-heading-md text-ub-text-primary"
            >
              {title}
            </h3>
            <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
              {subtitle ||
                "See where applications stand. Select a stage to focus the list below."}
            </p>
          </div>
          {selectedId && (
            <Button
              size="sm"
              variant="secondary"
              text="All stages"
              icon={<RotateCcw className="h-4 w-4" />}
              onClick={() => onSelect(null)}
            />
          )}
        </div>
        <div className="min-w-0 space-y-5 p-4 sm:p-5">
          {loading ? (
            <WidgetStatus state="loading" skeleton="chart" />
          ) : error ? (
            <WidgetStatus
              state="error"
              errorMessage={error}
              onRetry={onRetry}
            />
          ) : stages.length === 0 ? (
            <WidgetStatus
              state="empty"
              emptyMessage="Application stages are not available yet."
            />
          ) : (
            <>
              {Object.keys(chartCounts).length > 0 && (
                <PipelineBar
                  counts={chartCounts}
                  showLegend={false}
                  label={`${scopeLabel} by stage`}
                />
              )}
              <div
                role="group"
                aria-label="Filter applications by stage"
                className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6"
              >
                {stages.map((stage) => {
                  const count = stageCounts[stage.id] || 0;
                  const active = selectedId === stage.id;
                        const share = totalCount
                    ? Math.round((count / totalCount) * 100)
                    : 0;
                  return (
                    <button
                      type="button"
                      key={stage.id}
                      aria-pressed={active}
                      onClick={() => onSelect(active ? null : stage.id)}
                      className={`flex min-w-0 flex-col items-start gap-3 rounded-ub-md border p-3 text-start transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none ${focusRing} ${
                        active
                          ? "border-ub-border-focus bg-ub-selected shadow-ub-xs"
                          : "border-ub-border bg-ub-surface-subtle hover:border-ub-border-hover hover:bg-ub-action-ghost-hover"
                      }`}
                    >
                      <div className="flex w-full flex-wrap items-center justify-between gap-2">
                        <span className="ub-tabular min-w-0 max-w-full break-words text-ub-heading-md text-ub-text-primary sm:text-ub-heading-xl-mobile">
                          {count.toLocaleString()}
                        </span>
                        <span className="ub-tabular text-ub-label-sm text-ub-text-tertiary">
                          {share}%
                        </span>
                      </div>
                      <span className="min-h-[2.8em] w-full min-w-0 max-w-full break-words text-ub-label-md text-ub-text-primary">
                        {stage.name}
                      </span>
                      <div className="flex w-full min-w-0 flex-wrap gap-1">
                        {stageActionRequired[stage.id] &&
                          !isCommissionStage(stage) && (
                            <span className="min-w-0 max-w-full break-words text-ub-label-sm text-ub-tone-warning-text">Action flagged</span>
                          )}
                        {isCommissionStage(stage) && (
                          <span className="min-w-0 max-w-full break-words text-ub-label-sm text-ub-tone-success-text">Commission</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col gap-3 border-t border-ub-border bg-ub-surface-subtle p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p
            role="status"
            className="flex min-w-0 items-center gap-2 text-ub-body-sm text-ub-text-secondary"
          >
            <Layers className="h-4 w-4 shrink-0" aria-hidden="true" />
            {selected ? `Showing ${selected.name}` : "Showing all stages"}
          </p>
          {hasCommission && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onViewCommission}
              text="View commission stage"
              disabled={loading || !!error}
              icon={<ArrowUpRight className="h-4 w-4" />}
              className="shrink-0"
            />
          )}
        </div>
      </div>
    </section>
  );
}
