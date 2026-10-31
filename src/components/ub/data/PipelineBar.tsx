"use client";

import clsx from "clsx";
import { APPLICATION_STAGES, type ApplicationStage } from "config/applicationStages";
import { focusRing } from "components/ub/recipes";
import StageTag from "./StageTag";

export interface PipelineBarProps {
  /** Number of applications per stage id; stages with 0 or missing counts are left out. */
  counts: Partial<Record<string, number>>;
  /** Accessible name for the bar. */
  label?: string;
  /** Legend under the bar. Default true. */
  showLegend?: boolean;
  /** Makes legend items buttons, e.g. to filter the Application Tracker by stage. */
  onStageSelect?: (stageId: string) => void;
  /** Currently filtered stage (legend item shows as pressed). */
  selectedStageId?: string | null;
  className?: string;
}

const stageColor = (stage: ApplicationStage) => (stage.hue === "success" ? "var(--ub-success-500)" : `var(--ub-tag-${stage.hue}-solid)`);

/**
 * Stacked bar of applications by stage, in stage colors from the config (brief §6).
 * Use it on Advisor home ("Pipeline"), team-owner dashboards and the top of the
 * Application Tracker. The legend always carries text and counts, so color is
 * never the only signal.
 */
export default function PipelineBar({ counts, label = "Applications by stage", showLegend = true, onStageSelect, selectedStageId = null, className }: PipelineBarProps) {
  const stages = APPLICATION_STAGES.filter((s) => (counts[s.id] ?? 0) > 0);
  const total = stages.reduce((sum, s) => sum + (counts[s.id] ?? 0), 0);
  const summary = stages.map((s) => `${s.label} ${counts[s.id]}`).join(", ");

  return (
    <div className={className}>
      <div role="img" aria-label={total ? `${label}: ${total} total. ${summary}` : `${label}: none yet`} className="flex h-3 overflow-hidden rounded-ub-full bg-ub-disabled">
        {stages.map((s) => (
          <span key={s.id} className="h-full" style={{ width: `${((counts[s.id] ?? 0) / total) * 100}%`, background: stageColor(s) }} />
        ))}
      </div>
      {showLegend && stages.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {stages.map((s) => {
            const content = (
              <span className="inline-flex items-center gap-1">
                <StageTag stageId={s.id} size="sm" />
                <span className="ub-tabular text-ub-label-sm text-ub-text-secondary">{counts[s.id]}</span>
              </span>
            );
            return (
              <li key={s.id}>
                {onStageSelect ? (
                  <button
                    type="button"
                    aria-pressed={selectedStageId === s.id}
                    onClick={() => onStageSelect(s.id)}
                    className={clsx("rounded-ub-md p-0.5 transition-colors duration-ub-fast hover:bg-ub-surface-subtle", selectedStageId === s.id && "bg-ub-selected", focusRing)}
                  >
                    {content}
                  </button>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
