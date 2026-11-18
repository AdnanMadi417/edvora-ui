"use client";

import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { getStage } from "config/applicationStages";
import { focusRing, type TagTone } from "components/ub/recipes";
import Tag from "components/ub/data/badges/Tag";

export interface PipelineFlowStage {
  /** Your id for the stage, returned by onSelect. */
  id: string;
  label: string;
  count: number;
  /** Stage tag id in config/applicationStages.ts; sets the colour. Unknown ids show neutral. */
  stageId?: string;
  /** Short call-out on the stage, e.g. { label: "Action needed", tone: "attention" }. */
  badge?: { label: string; tone: TagTone };
  /** Something in this stage is waiting on the viewer: adds an "Action needed" badge when no badge is given. */
  attention?: boolean;
}

export interface PipelineFlowProps {
  stages: PipelineFlowStage[];
  /** Makes each stage a toggle button, e.g. to filter a table by stage. Pressing the selected stage clears it. */
  onSelect?: (id: string | null) => void;
  selectedId?: string | null;
  /** Makes each stage a link instead (e.g. the home page opening the filtered list). */
  getHref?: (stage: PipelineFlowStage) => string;
  /**
   * "auto": a list on phones, one column per stage from 1024px up.
   * "list": always the list, for narrow cards (e.g. half-width on a dashboard).
   */
  layout?: "auto" | "list";
  /** Accessible name for the list. */
  label?: string;
  /** Noun for the count in screen-reader text. */
  unit?: string;
  className?: string;
}

const stageColor = (stageId?: string) => {
  const hue = stageId ? getStage(stageId)?.hue : undefined;
  if (!hue) return "var(--ub-text-tertiary)";
  return hue === "success" ? "var(--ub-success-500)" : `var(--ub-tag-${hue}-solid)`;
};

// One column per stage from 1024px up (tablets get the list); the workflow has five.
const COLS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-3 xl:grid-cols-6",
};

/**
 * Applications by stage, in workflow order. Columns: one per stage with a
 * coloured track, the stage name, the count and its share. List (phones and
 * narrow cards): name and share bar, count on the end; never a squeezed strip.
 * Colours come from config/applicationStages.ts; stages waiting on the viewer
 * carry an "Action needed" badge. With onSelect each stage toggles a filter;
 * with getHref it opens a link.
 */
export default function PipelineFlow({
  stages,
  onSelect,
  selectedId = null,
  getHref,
  layout = "auto",
  label = "Applications by stage",
  unit = "applications",
  className,
}: PipelineFlowProps) {
  const total = stages.reduce((sum, s) => sum + s.count, 0);
  const cols = layout === "auto";

  return (
    <ol aria-label={label} data-layout={layout} className={clsx("grid gap-2", cols && ["lg:gap-3", COLS[stages.length] ?? "lg:grid-cols-4"], className)}>
      {stages.map((s, i) => {
        const color = stageColor(s.stageId);
        const share = total > 0 ? Math.round((s.count / total) * 100) : 0;
        const selected = selectedId === s.id;
        const empty = s.count === 0;
        const badge = s.badge ?? (s.attention ? { label: "Action needed", tone: "attention" as TagTone } : undefined);
        const interactive = Boolean(onSelect || getHref);
        const name = `${s.label}: ${s.count.toLocaleString()} ${unit}, ${share}%${badge ? `, ${badge.label}` : ""}`;

        const body: ReactNode = (
          <>
            {/* Marker: the step number in a ring of the stage colour; in columns a track runs from it. */}
            <span aria-hidden="true" className={clsx("flex shrink-0 items-center", cols && "lg:w-full")}>
              <span
                className={clsx(
                  "ub-tabular grid h-7 w-7 shrink-0 place-items-center rounded-ub-full border-[3px] bg-ub-surface text-ub-label-sm",
                  empty ? "border-dashed text-ub-text-tertiary" : "text-ub-text-primary"
                )}
                style={{ borderColor: color }}
              >
                {i + 1}
              </span>
              {cols && <span className="ms-2 hidden h-1 flex-1 rounded-ub-full lg:block" style={{ background: color, opacity: empty ? 0.35 : 1 }} />}
            </span>

            <span className={clsx("min-w-0 flex-1", cols && "lg:flex-none")}>
              <span
                title={s.label}
                className={clsx("block truncate text-ub-label-md text-ub-text-primary", cols && "lg:line-clamp-2 lg:whitespace-normal lg:break-words")}
              >
                {s.label}
              </span>
              {/* List: the share as a bar under the name, with the badge beside it so the name keeps the full width. */}
              <span className={clsx("mt-1.5 flex items-center gap-2", cols && "lg:hidden")}>
                <span aria-hidden="true" className="block h-1.5 min-w-0 flex-1 overflow-hidden rounded-ub-full bg-ub-border">
                  <span className="block h-full rounded-ub-full" style={{ width: `${share}%`, background: color }} />
                </span>
                {badge && (
                  <Tag tone={badge.tone} size="sm">
                    {badge.label}
                  </Tag>
                )}
              </span>
            </span>

            {/* Count, share and badge: on the end side in the list, under the name in columns. */}
            <span className={clsx("flex shrink-0 flex-col items-end gap-1", cols && "lg:mt-auto lg:items-stretch lg:gap-2")}>
              <span className={clsx("ub-tabular text-ub-heading-sm", cols && "lg:text-ub-heading-lg", empty ? "text-ub-text-tertiary" : "text-ub-text-primary")}>
                {s.count.toLocaleString()}
              </span>
              <span className={clsx("flex min-w-0 flex-wrap items-center gap-2", cols && "lg:justify-between")}>
                {/* Columns only: the badge in the bottom row (the list shows it under the name). */}
                {badge && cols && (
                  <Tag tone={badge.tone} size="sm" className="hidden lg:order-2 lg:inline-flex">
                    {badge.label}
                  </Tag>
                )}
                <span className={clsx("ub-tabular text-ub-caption text-ub-text-tertiary", cols && "lg:order-1")}>{share}%</span>
              </span>
            </span>
          </>
        );

        const cell = clsx(
          "flex h-full min-h-14 w-full min-w-0 items-center gap-3 rounded-ub-lg border px-3 py-2.5 text-start",
          cols && "lg:flex-col lg:items-stretch lg:gap-3 lg:p-4",
          "transition-colors duration-ub-base motion-reduce:transition-none",
          selected ? "border-ub-border-focus bg-ub-selected ring-1 ring-inset ring-ub-border-focus" : "border-ub-border bg-ub-surface",
          interactive && !selected && "hover:border-ub-border-hover hover:bg-ub-surface-subtle",
          interactive && focusRing
        );

        return (
          <li key={s.id} className="min-w-0">
            {getHref ? (
              <Link href={getHref(s)} aria-label={name} className={cell}>
                {body}
              </Link>
            ) : onSelect ? (
              <button type="button" aria-pressed={selected} aria-label={name} onClick={() => onSelect(selected ? null : s.id)} className={cell}>
                {body}
              </button>
            ) : (
              <div role="group" aria-label={name} className={cell}>
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
