"use client";

import clsx from "clsx";
import type { CSSProperties } from "react";
import { getStage } from "config/applicationStages";
import { focusRing, type TagTone } from "components/ub/recipes";
import Tag from "components/ub/data/Tag";

export interface PipelineFlowStage {
  /** Your id for the stage, returned by onSelect. */
  id: string;
  label: string;
  count: number;
  /** Stage tag id in config/applicationStages.ts; sets the colour. Unknown ids show neutral. */
  stageId?: string;
  /** Short call-out above the station, e.g. { label: "Your move", tone: "attention" }. */
  badge?: { label: string; tone: TagTone };
  /** Pulses the station: something here is waiting on the viewer. */
  attention?: boolean;
}

export interface PipelineFlowProps {
  stages: PipelineFlowStage[];
  /** Makes each station a toggle button, e.g. to filter a table by stage. */
  onSelect?: (id: string | null) => void;
  selectedId?: string | null;
  /** Accessible name for the group. */
  label?: string;
  className?: string;
}

const stageColor = (stageId?: string) => {
  const hue = stageId ? getStage(stageId)?.hue : undefined;
  if (!hue) return "var(--ub-text-tertiary)";
  return hue === "success" ? "var(--ub-success-500)" : `var(--ub-tag-${hue}-solid)`;
};

// Station diameter grows with the stage's share: 44px (tap target) to 64px.
const MIN = 44;
const MAX = 64;

/**
 * Applications by stage as a journey line toward payout. Each stage is a
 * station whose size follows its volume; the track between stations takes the
 * stage colour from config/applicationStages.ts and drifts toward the end.
 * With onSelect, pressing a station filters and pressing it again clears.
 */
export default function PipelineFlow({ stages, onSelect, selectedId = null, label = "Applications by stage", className }: PipelineFlowProps) {
  const total = stages.reduce((sum, s) => sum + s.count, 0);
  const peak = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div className={clsx("-mx-1 overflow-x-auto px-1 pb-1", className)}>
      <ol aria-label={label} className="grid min-w-[44rem]" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
        {stages.map((s, i) => {
          const color = stageColor(s.stageId);
          const prev = i > 0 ? stageColor(stages[i - 1].stageId) : null;
          const share = total > 0 ? Math.round((s.count / total) * 100) : 0;
          const size = Math.round(MIN + (MAX - MIN) * (s.count / peak));
          const selected = selectedId === s.id;
          const empty = s.count === 0;

          const nodeStyle: CSSProperties = {
            width: size,
            height: size,
            borderColor: color,
            boxShadow: selected ? `0 0 0 4px var(--ub-bg-surface), 0 0 0 7px ${color}` : undefined,
          };
          const node = (
            <>
              {s.attention && (
                <span aria-hidden="true" className="absolute -end-0.5 -top-0.5 flex h-3 w-3">
                  <span className="absolute inset-0 rounded-ub-full motion-safe:animate-ping" style={{ background: color, opacity: 0.6 }} />
                  <span className="relative h-3 w-3 rounded-ub-full border-2 border-ub-surface" style={{ background: color }} />
                </span>
              )}
              <span className={clsx("ub-tabular text-ub-label-lg font-semibold", empty ? "text-ub-text-tertiary" : "text-ub-text-primary")}>{s.count}</span>
            </>
          );
          const nodeClass = clsx(
            "relative z-10 flex items-center justify-center rounded-ub-full border-[3px] bg-ub-surface transition-[box-shadow,transform] duration-ub-base motion-reduce:transition-none",
            empty && "border-dashed",
          );

          return (
            <li key={s.id} className="flex min-w-0 flex-col items-center text-center">
              <span className="flex h-7 items-end pb-1.5">
                {s.badge && (
                  <Tag tone={s.badge.tone} size="sm">
                    {s.badge.label}
                  </Tag>
                )}
              </span>

              <span className="relative flex w-full items-center justify-center" style={{ height: MAX + 8 }}>
                {prev && (
                  <span aria-hidden="true" className="absolute start-0 top-1/2 h-1.5 w-1/2 -translate-y-1/2 overflow-hidden" style={{ background: prev }}>
                    <span className="ub-pipeline-flow absolute inset-0" />
                  </span>
                )}
                {i < stages.length - 1 && (
                  <span aria-hidden="true" className="absolute end-0 top-1/2 h-1.5 w-1/2 -translate-y-1/2 overflow-hidden" style={{ background: color }}>
                    <span className="ub-pipeline-flow absolute inset-0" />
                  </span>
                )}
                {onSelect ? (
                  <button
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${s.label}: ${s.count} (${share}%)${s.badge ? `, ${s.badge.label}` : ""}`}
                    onClick={() => onSelect(selected ? null : s.id)}
                    className={clsx(nodeClass, "hover:scale-105 motion-reduce:hover:scale-100", focusRing)}
                    style={nodeStyle}
                  >
                    {node}
                  </button>
                ) : (
                  <span className={nodeClass} style={nodeStyle}>
                    {node}
                  </span>
                )}
              </span>

              <span className={clsx("mt-2 line-clamp-2 px-1 text-ub-label-sm", selected ? "text-ub-text-primary" : "text-ub-text-secondary")}>{s.label}</span>
              <span className="ub-tabular mt-0.5 text-ub-caption text-ub-text-tertiary">{share}%</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
