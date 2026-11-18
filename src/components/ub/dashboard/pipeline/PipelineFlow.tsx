"use client";

import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { focusRing } from "components/ub/recipes";
import StatTile from "components/ub/dashboard/cards/StatTile";
import { useMediaQuery } from "hooks/useMediaQuery";

export interface PipelineFlowStage {
  /** Your id for the stage, returned by onSelect. */
  id: string;
  label: string;
  count: number;
}

export interface PipelineFlowProps {
  /** In workflow order; the step number comes from the position. */
  stages: PipelineFlowStage[];
  /** Makes each stage a toggle button, e.g. to filter a table by stage. Pressing the selected stage clears it. */
  onSelect?: (id: string | null) => void;
  selectedId?: string | null;
  /** Makes each stage a link instead (e.g. the home page opening the filtered list). */
  getHref?: (stage: PipelineFlowStage) => string;
  /**
   * "auto": a list on phones and tablets, StatTile tiles (one per stage) from 1024px.
   * "list": always the list, for narrow cards (e.g. half-width on a dashboard).
   */
  layout?: "auto" | "list";
  /** Accessible name for the list. */
  label?: string;
  /** Noun for the count in screen-reader text. */
  unit?: string;
  className?: string;
}

// One tile per stage from 1024px; the workflow has five.
const COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-3 xl:grid-cols-6",
};

/**
 * Applications by stage, in workflow order. From 1024px each stage is a
 * StatTile (the same card as the home KPIs): stage name, count and a footer
 * with its share. On tablets, phones and narrow cards: a
 * vertical list with a share bar and the count on the end; never a squeezed
 * strip. No per-stage colours and no badges: the name and the count carry it.
 * With onSelect each stage toggles a filter; with getHref it opens a link.
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
  const wide = useMediaQuery("(min-width: 1024px)");
  const tiles = layout === "auto" && wide;
  const total = stages.reduce((sum, s) => sum + s.count, 0);

  const rows = stages.map((s) => {
    const share = total > 0 ? Math.round((s.count / total) * 100) : 0;
    return {
      s,
      share,
      selected: selectedId === s.id,
      empty: s.count === 0,
      name: `${s.label}: ${s.count.toLocaleString()} ${unit}, ${share}%`,
    };
  });

  if (tiles)
    return (
      <ol aria-label={label} data-layout="tiles" className={clsx("grid gap-3", COLS[stages.length] ?? "grid-cols-4", className)}>
        {rows.map(({ s, share, selected, empty, name }) => (
          <li key={s.id} className="min-w-0">
            <StatTile
              className="h-full"
              label={s.label}
              labelLines={2}
              value={<span className={empty ? "text-ub-text-tertiary" : undefined}>{s.count.toLocaleString()}</span>}
              footer={{ value: `${share}%`, text: `of ${unit}` }}
              href={getHref?.(s)}
              linkLabel={name}
              onClick={onSelect ? () => onSelect(selected ? null : s.id) : undefined}
              pressed={selected}
              ariaLabel={name}
            />
          </li>
        ))}
      </ol>
    );

  return (
    <ol aria-label={label} data-layout="list" className={clsx("grid gap-2", className)}>
      {rows.map(({ s, share, selected, empty, name }) => {
        const interactive = Boolean(onSelect || getHref);
        const body: ReactNode = (
          <>
            <span className="min-w-0 flex-1">
              <span title={s.label} className="block truncate text-ub-label-md text-ub-text-primary">
                {s.label}
              </span>
              {/* The share as a bar under the name, in the one brand colour. */}
              <span aria-hidden="true" className="mt-1.5 block h-1.5 overflow-hidden rounded-ub-full bg-ub-border">
                <span className="block h-full rounded-ub-full bg-ub-action-primary" style={{ width: `${share}%` }} />
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <span className={clsx("ub-tabular text-ub-heading-sm", empty ? "text-ub-text-tertiary" : "text-ub-text-primary")}>{s.count.toLocaleString()}</span>
              <span className="ub-tabular text-ub-caption text-ub-text-tertiary">{share}%</span>
            </span>
          </>
        );
        const cell = clsx(
          "flex h-full min-h-14 w-full min-w-0 items-center gap-3 rounded-ub-lg border px-3 py-2.5 text-start",
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
