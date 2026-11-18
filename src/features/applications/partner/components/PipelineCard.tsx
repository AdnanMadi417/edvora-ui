"use client";

import WidgetStatus from "components/ub/dashboard/shared/WidgetStatus";
import PipelineFlow from "components/ub/dashboard/pipeline/PipelineFlow";
import { getApiStageTagId } from "config/applicationStages";
import { stageLabel } from "config/statusLabels";

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
  /** Legacy inputs retained for callers; the pipeline has no summary header or footer. */
  totalActionRequired?: number;
  onViewCommission?: () => void;
  title?: string;
  subtitle?: string;
  scopeLabel?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const isCommissionStage = (stage: PipelineStage) =>
  stage.code === "PARTNER_COMMISSION_INVOICING" || /commission/i.test(stage.name);

export default function PipelineCard({
  stages,
  stageCounts,
  stageActionRequired,
  selectedId,
  onSelect,
  loading,
  error,
  onRetry,
}: PipelineCardProps) {
  return (
    <section aria-label="Application pipeline" className="min-w-0">
      {loading ? (
        <WidgetStatus state="loading" skeleton="chart" />
      ) : error ? (
        <WidgetStatus state="error" errorMessage={error} onRetry={onRetry} />
      ) : stages.length === 0 ? (
        <WidgetStatus state="empty" emptyMessage="Application stages are not available yet." />
      ) : (
        <div role="group" aria-label="Filter applications by stage">
          <PipelineFlow
            label="Applications by stage"
            stages={stages.map((stage) => ({
              id: stage.id,
              label: stageLabel(stage.code ?? stage.name),
              count: stageCounts[stage.id] || 0,
              stageId: getApiStageTagId(stage),
              attention: Boolean(stageActionRequired[stage.id]),
            }))}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </div>
      )}
    </section>
  );
}
