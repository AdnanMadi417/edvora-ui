"use client";

import { ClipboardCheck, ClipboardList, FileCheck2, MailCheck, PlaneLanding, Wallet } from "lucide-react";
import WidgetStatus from "components/ub/dashboard/shared/WidgetStatus";
import { focusRing } from "components/ub/recipes";
import { stageCodeOf } from "features/applications/stages";

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

const STAGE_ICONS = {
  APPLICATION_REVIEW: ClipboardCheck,
  OFFER_LETTER: MailCheck,
  VISA_PROCESSING: FileCheck2,
  STUDENT_ARRIVAL_ENROLLMENT: PlaneLanding,
  PARTNER_COMMISSION_INVOICING: Wallet,
};

export default function PipelineCard({
  stages,
  stageCounts,
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
        <div
          role="group"
          aria-label="Filter applications by stage"
          tabIndex={0}
          className={`-m-1 grid auto-cols-[128px] grid-flow-col snap-x snap-mandatory gap-2 md:gap-3 overflow-x-auto overscroll-x-contain scroll-px-1 p-1 md:m-0 md:auto-cols-auto md:grid-flow-row md:grid-cols-3 md:overflow-visible md:p-0 md:snap-none xl:grid-cols-5 ${focusRing}`}
        >
          {stages.map((stage) => {
            const active = selectedId === stage.id;
            const count = stageCounts[stage.id] || 0;
            const code = stageCodeOf(stage);
            const Icon = STAGE_ICONS[code as keyof typeof STAGE_ICONS] ?? ClipboardList;
            return (
              <button
                key={stage.id}
                type="button"
                aria-pressed={active}
                aria-label={`${stage.name}: ${count.toLocaleString()} applications`}
                onClick={() => onSelect(active ? null : stage.id)}
                className={`flex min-w-0 snap-start flex-col rounded-ub-lg border p-2.5 text-start md:p-3 transition-colors duration-200 motion-reduce:transition-none ${focusRing} ${active
                  ? "border-ub-border-focus bg-ub-selected ring-1 ring-inset ring-ub-border-focus"
                  : "border-ub-border bg-ub-surface hover:border-ub-border-hover hover:bg-ub-surface-subtle"
                }`}
              >
                <span className="mb-1 flex w-full flex-wrap items-start justify-between gap-1 md:mb-2 md:gap-2">
                  <span className="grid h-6 w-6 shrink-0 md:h-8 md:w-8 place-items-center rounded-ub-md bg-ub-tone-brand-bg text-ub-tone-brand-text">
                    <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
                  </span>
                </span>
                <span className="ub-tabular text-ub-heading-md text-ub-text-primary md:text-ub-heading-xl">
                  {count.toLocaleString()}
                </span>
                <span title={stage.name} className="mt-0.5 line-clamp-2 min-h-8 w-full break-words text-ub-label-sm text-ub-text-secondary md:line-clamp-none md:min-h-0">
                  {stage.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
