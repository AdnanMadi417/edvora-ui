"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import PipelineBar from "components/ub/data/PipelineBar";
import Button from "components/ub/core/Button";
import { resolveStage } from "features/applications/stages";

interface Stage {
  id: string;
  name: string;
}

interface PipelineCardProps {
  stages: Stage[];
  stageCounts: Record<string, number>;
  /** Kept for callers; the bar legend shows counts only. */
  stageActionRequired: Record<string, boolean>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  totalCount: number;
  totalActionRequired: number;
  onViewCommission: () => void;
  title?: string;
  subtitle?: string;
}

// Backend stage → stage tag id via features/applications/stages.ts, so the bar
// and legend take their colours from config/applicationStages.ts.
const stageTagId = (stage: Stage) => resolveStage({ stageCode: (stage as Stage & { code?: string }).code })?.stageId;

export default function PipelineCard({
  stages,
  stageCounts,
  selectedId,
  onSelect,
  totalCount,
  totalActionRequired,
  onViewCommission,
  title = "Your Pipeline",
  subtitle,
}: PipelineCardProps) {
  const counts: Record<string, number> = {};
  const backendIdFor: Record<string, string> = {};
  stages.forEach((stage) => {
    const tagId = stageTagId(stage);
    if (!tagId) return;
    counts[tagId] = (counts[tagId] ?? 0) + (stageCounts[stage.id] ?? 0);
    backendIdFor[tagId] ??= stage.id;
  });
  const selectedTag = stages.find((s) => s.id === selectedId);
  const selectedStageId = selectedTag ? stageTagId(selectedTag) ?? null : null;

  return (
    <section aria-labelledby="pipeline-title">
      <div className="mb-4">
        <h3 id="pipeline-title" className="text-ub-heading-sm text-ub-text-primary">{title}</h3>
        <p className="mt-0.5 truncate text-ub-body-sm text-ub-text-secondary">
          {subtitle ?? `${totalCount} active application${totalCount !== 1 ? "s" : ""} — move students right to unlock commission`}
        </p>
      </div>

      <PipelineBar
        counts={counts}
        label="Applications by stage"
        selectedStageId={selectedStageId}
        onStageSelect={(tagId) => onSelect(tagId === selectedStageId ? null : backendIdFor[tagId] ?? null)}
      />

      <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-ub-border pt-4 sm:flex-row sm:items-center">
        <p className="text-ub-body-sm text-ub-text-secondary">
          {totalActionRequired > 0 ? (
            <>
              <span className="font-semibold text-ub-tone-warning-text">{totalActionRequired} application{totalActionRequired !== 1 ? "s" : ""}</span>
              {" "}are waiting on you — clear them to push more students toward payout.
            </>
          ) : (
            <span className="text-ub-tone-success-text">All caught up — no actions required right now.</span>
          )}
        </p>
        <Button variant="secondary" onClick={onViewCommission} text="View commission ready" icon={<ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />} className="shrink-0" />
      </div>
    </section>
  );
}
