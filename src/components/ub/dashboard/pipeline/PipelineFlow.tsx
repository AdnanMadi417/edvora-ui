"use client";

import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { focusRing } from "components/ub/recipes";
import StatTile from "components/ub/dashboard/cards/StatTile";
import { useMediaQuery } from "hooks/useMediaQuery";
import { CHART_PALETTE, CHART_OTHER } from "config/chartPalette";
import DonutChart from "../charts/DonutChart";

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
 * with its share. On tablets, phones and narrow cards: the home pipeline
 * donut (stage colours, total in the hole) over a compact legend of name,
 * count and share.
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

  // Stages keep their workflow position's colour, as on the home donut.
  const colorOf = (index: number) => CHART_PALETTE[index] ?? CHART_OTHER;
  const interactive = Boolean(onSelect || getHref);
  return (
    <div data-layout="list" className={clsx("min-w-0", className)}>
      {/* The same donut as the home pipeline: one slice per stage, total in the hole. */}
      <DonutChart
        className="max-w-[11rem]"
        label={label}
        centerLabel={unit.charAt(0).toUpperCase() + unit.slice(1)}
        centerValue={total.toLocaleString()}
        segments={rows.map(({ s }, index) => ({ key: s.id, label: s.label, value: s.count, color: colorOf(index) }))}
      />
      <ol aria-label={label} className="mt-4 grid">
        {rows.map(({ s, share, selected, empty, name }, index) => {
          const body: ReactNode = (
            <>
              <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colorOf(index) }} />
              <span title={s.label} className="min-w-0 flex-1 truncate text-ub-body-sm text-ub-text-primary">
                {s.label}
              </span>
              <span className={clsx("ub-tabular shrink-0 text-ub-label-md", empty ? "text-ub-text-tertiary" : "text-ub-text-primary")}>
                {s.count.toLocaleString()}
              </span>
              <span className="ub-tabular w-10 shrink-0 text-end text-ub-caption text-ub-text-tertiary">{share}%</span>
            </>
          );
          const cell = clsx(
            "-mx-2 flex min-h-11 w-[calc(100%+1rem)] min-w-0 items-center gap-3 rounded-ub-md px-2 text-start",
            "transition-colors duration-ub-fast motion-reduce:transition-none",
            selected && "bg-ub-selected",
            interactive && !selected && "hover:bg-ub-surface-subtle",
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
    </div>
  );
}
