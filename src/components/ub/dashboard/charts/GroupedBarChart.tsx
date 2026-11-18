"use client";

import clsx from "clsx";
import { useState } from "react";
import ChartLegend from "./ChartLegend";
import { niceTicks } from "./chartScale";
import { compactNumber, type ChartColor } from "../types";

export interface GroupedBarSeries {
  key: string;
  label: string;
  /** Validated categorical slot, in fixed order: cat-1, cat-2, cat-3. */
  color: Exclude<ChartColor, "muted" | "hatch">;
}

export interface GroupedBarGroup {
  key: string;
  label: string;
  /** One value per series, in series order. */
  values: number[];
}

export interface GroupedBarChartProps {
  series: GroupedBarSeries[];
  groups: GroupedBarGroup[];
  /** Accessible name; also the hidden table's caption. */
  label: string;
  formatValue?: (value: number) => string;
  /** Plot height (the axis labels sit below it). */
  heightClass?: string;
  className?: string;
}

const W = 600;
const H = 220;
const LEFT = 40;
const BOTTOM = 0;
const BAR = 10;
const BAR_GAP = 2;
/** Full class names so Tailwind's JIT sees them. */
const FILL: Record<GroupedBarSeries["color"], string> = {
  "cat-1": "fill-ub-chart-cat-1",
  "cat-2": "fill-ub-chart-cat-2",
  "cat-3": "fill-ub-chart-cat-3",
};

/**
 * Up to three series side by side per group (e.g. Expected vs Paid per
 * university). Thin bars with rounded data ends on one baseline, a 2px gap
 * between bars, recessive gridlines, one axis, a legend above. Hover or focus
 * a bar for its value; a hidden table carries the same numbers.
 */
export default function GroupedBarChart({
  series,
  groups,
  label,
  formatValue = (v) => v.toLocaleString(),
  heightClass = "h-56",
  className,
}: GroupedBarChartProps) {
  const [hover, setHover] = useState<{ g: number; s: number } | null>(null);
  const max = Math.max(0, ...groups.flatMap((g) => g.values));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] || 1;
  const plotW = W - LEFT;
  const slot = plotW / Math.max(1, groups.length);
  const groupW = series.length * BAR + (series.length - 1) * BAR_GAP;
  const y = (v: number) => H - BOTTOM - (v / top) * (H - BOTTOM - 8);
  const active = hover ? { group: groups[hover.g], s: series[hover.s], value: groups[hover.g].values[hover.s] } : null;

  return (
    <figure className={clsx("min-w-0", className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="ub-tabular min-h-5 text-ub-caption text-ub-text-secondary">
          {active ? `${active.group.label} · ${active.s.label}: ${formatValue(active.value)}` : ""}
        </p>
        <ChartLegend items={series.map((s) => ({ label: s.label, color: s.color }))} />
      </div>
      <div className={clsx("relative w-full", heightClass)}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" className="h-full w-full overflow-visible">
          {ticks.map((t) => (
            <line key={t} x1={LEFT} x2={W} y1={y(t)} y2={y(t)} className="stroke-ub-chart-grid" strokeWidth={1} vectorEffect="non-scaling-stroke" strokeDasharray={t === 0 ? undefined : "4 4"} />
          ))}
          {groups.map((g, gi) =>
            g.values.map((v, si) => {
              const x = LEFT + gi * slot + (slot - groupW) / 2 + si * (BAR + BAR_GAP);
              const h = Math.max(0, y(0) - y(v));
              const dim = hover && !(hover.g === gi && hover.s === si);
              return (
                <rect
                  key={`${g.key}-${series[si]?.key}`}
                  x={x}
                  y={y(v)}
                  width={BAR}
                  height={h}
                  rx={Math.min(4, h / 2)}
                  className={clsx(FILL[series[si]?.color ?? "cat-1"], "transition-opacity duration-ub-fast motion-reduce:transition-none", dim && "opacity-40")}
                />
              );
            })
          )}
        </svg>
        {/* Axis labels as HTML so they stay crisp at any width. */}
        {ticks.map((t) => (
          <span key={t} aria-hidden="true" className="ub-tabular absolute start-0 -translate-y-1/2 text-ub-caption text-ub-text-tertiary" style={{ top: `${(y(t) / H) * 100}%` }}>
            {compactNumber(t)}
          </span>
        ))}
        {/* Hit targets bigger than the bars: one per bar, full height of its column. */}
        <div className="absolute inset-y-0 end-0 flex" style={{ insetInlineStart: `${(LEFT / W) * 100}%` }}>
          {groups.map((g, gi) => (
            <div key={g.key} className="flex flex-1 justify-center">
              {series.map((s, si) => (
                <button
                  key={s.key}
                  type="button"
                  aria-label={`${g.label}, ${s.label}: ${formatValue(g.values[si] ?? 0)}`}
                  onMouseEnter={() => setHover({ g: gi, s: si })}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover({ g: gi, s: si })}
                  onBlur={() => setHover(null)}
                  className="h-full w-4 rounded-ub-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex" style={{ paddingInlineStart: `${(LEFT / W) * 100}%` }}>
        {groups.map((g) => (
          <span key={g.key} title={g.label} className="min-w-0 flex-1 truncate px-1 text-center text-ub-caption text-ub-text-secondary">
            {g.label}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Group</th>
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.key}>
              <th scope="row">{g.label}</th>
              {g.values.map((v, i) => (
                <td key={series[i]?.key ?? i}>{formatValue(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
