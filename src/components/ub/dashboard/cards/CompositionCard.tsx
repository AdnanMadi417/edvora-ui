"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import clsx from "clsx";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { focusRing } from "components/ub/recipes";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import DashboardCard from "./DashboardCard";
import DonutChart from "../charts/DonutChart";
import ReconciliationBars, {
  type ReconciliationRow,
} from "../charts/ReconciliationBars";
import RankedBars from "../charts/RankedBars";
import { foldSlices, type DonutStatsItem } from "./DonutStatsCard";
import type { WidgetState } from "../types";
import { CHART_OTHER, CHART_PALETTE_EXTENDED } from "config/chartPalette";

export interface CompositionSummary {
  /** The headline number, e.g. 2426. */
  value: number;
  /** e.g. "Total students". */
  label: string;
  /** How the number is made, e.g. "925 + 930 + 571". */
  detail?: ReactNode;
  icon?: LucideIcon;
}

export interface CompositionCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** The parts of the whole, e.g. students by study level. */
  items: DonutStatsItem[];
  /** Small text in the hole, under the total, e.g. "Classified students". */
  centerLabel: string;
  /** Optional headline beside the chart (e.g. the official total, when some records have no level). */
  summary?: CompositionSummary;
  /** Optional per-period bars under the chart: parts add up to each period's total. */
  reconciliation?: {
    title: string;
    /** e.g. "Classified + level not recorded = official total". */
    note?: string;
    /** One set of periods, e.g. years… */
    rows?: ReconciliationRow[];
    /** …or several, picked with tabs, e.g. each year's months (opens on the last). */
    groups?: { id: string; label: string; rows: ReconciliationRow[] }[];
    /** Name of the part that should match the donut, e.g. "classified"; a dev warning fires when the sums differ. */
    matchesDonut?: string;
  };
  /** Noun for screen readers, e.g. "students". */
  unit: string;
  /** Keep the given order instead of largest first. */
  keepOrder?: boolean;
  /** Every part gets its own slice and legend row, up to 7 (the colour slots); only past that do the smallest fold into Other. */
  maxSlices?: number;
  /**
   * donut: ring + legend (up to 7 parts). ranked: one bar per part, largest
   * first, every part listed (countries, fields of study). Default: donut up
   * to 7 parts, ranked past that.
   */
  layout?: "donut" | "ranked";
  /** Decimals on shares (default 1: 55.3%). */
  percentDigits?: number;
  /** Legend columns beside the donut: 2 for full-width pages, 1 in narrower columns (e.g. home). */
  legendColumns?: 1 | 2;
  /** Ranked layout: exactly the top N parts, then the rest in one "Others" row (default: every part). */
  top?: number;
  /** Label for that row, e.g. (n) => `Other fields (${n})`. */
  restLabel?: (count: number) => string;
  formatValue?: (value: number) => string;
  actions?: ReactNode;
  /** Under the title, e.g. tabs that switch what the card shows. */
  controls?: ReactNode;
  /** Extra classes on the card body, e.g. an entrance animation. */
  bodyClassName?: string;
  state?: WidgetState;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  as?: "h2" | "h3" | "h4";
  className?: string;
}

const num = (value: number) => value.toLocaleString();

/**
 * A whole split into parts, with how it reconciles to the official total:
 * donut (total in the hole) · optional headline · legend (dot, name, share,
 * link) · optional per-period bars (e.g. classified + not recorded = total).
 * Up to 7 parts: a donut, each part with its own colour. Past 7 it switches
 * to ranked bars (one colour, largest first) so every part is still listed.
 */
export default function CompositionCard({
  title,
  subtitle,
  items,
  centerLabel,
  summary,
  reconciliation,
  unit,
  keepOrder = false,
  maxSlices = CHART_PALETTE_EXTENDED.length,
  layout,
  percentDigits = 1,
  legendColumns = 2,
  top,
  restLabel,
  formatValue = num,
  actions,
  controls,
  bodyClassName,
  state = "ready",
  emptyMessage = "Nothing to show yet.",
  errorMessage,
  onRetry,
  as = "h2",
  className,
}: CompositionCardProps) {
  const prefix = useId();
  const groups = useMemo(
    () =>
      reconciliation?.groups ??
      (reconciliation?.rows
        ? [{ id: "all", label: "All", rows: reconciliation.rows }]
        : []),
    [reconciliation?.groups, reconciliation?.rows]
  );
  const matchKey = reconciliation?.matchesDonut;
  const [groupId, setGroupId] = useState(groups[groups.length - 1]?.id ?? "");
  const group =
    groups.find((g) => g.id === groupId) ?? groups[groups.length - 1];
  const total = items.reduce((sum, i) => sum + Math.max(0, i.value), 0);
  // With `top`: exactly the top N parts, then one grey Others part (no sub-list under it).
  const positive = items.filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
  const topFold = top !== undefined && positive.length > top;
  const rest = topFold ? positive.slice(top) : [];
  const chartItems = topFold
    ? [
        ...positive.slice(0, top),
        {
          key: "__rest",
          label: restLabel?.(rest.length) ?? `Others (${rest.length})`,
          value: rest.reduce((sum, i) => sum + i.value, 0),
        },
      ]
    : items;
  const slices = foldSlices(
    chartItems,
    maxSlices,
    keepOrder || topFold,
    CHART_PALETTE_EXTENDED
  ).map((s) => (s.key === "__rest" ? { ...s, color: CHART_OTHER } : s));
  const shown = new Set(slices.map((s) => s.key));
  const folded = chartItems
    .filter((i) => i.value > 0 && !shown.has(i.key))
    .sort((a, b) => b.value - a.value);
  const ranked =
    (layout ??
      (chartItems.filter((i) => i.value > 0).length > CHART_PALETTE_EXTENDED.length
        ? "ranked"
        : "donut")) === "ranked";
  const pct = (value: number) =>
    `${
      total
        ? ((value / total) * 100).toFixed(percentDigits)
        : (0).toFixed(percentDigits)
    }%`;

  // The donut and the bars count the same records.
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !matchKey || state !== "ready")
      return;
    const key = matchKey.toLowerCase();
    const sum = groups
      .flatMap((g) => g.rows)
      .reduce(
        (s, r) =>
          s +
          (r.parts.find(
            (p) => p.key.toLowerCase() === key || p.label.toLowerCase() === key
          )?.value ?? 0),
        0
      );
    if (sum !== total)
      console.warn(
        `[CompositionCard] parts total ${total} ≠ ${key} across periods ${sum}`
      );
  }, [groups, matchKey, total, state]);

  const row = (item: DonutStatsItem, color: string | null, sub = false) => {
    const body = (
      <>
        <span
          aria-hidden="true"
          className={clsx(
            "shrink-0 rounded-full",
            sub ? "h-1.5 w-1.5 bg-ub-text-tertiary" : "h-2.5 w-2.5"
          )}
          style={color ? { background: color } : undefined}
        />
        <span
          className={clsx(
            "min-w-0 flex-1 truncate",
            sub
              ? "text-ub-body-sm text-ub-text-secondary"
              : "text-ub-label-md text-ub-text-primary"
          )}
          title={item.label}
        >
          {item.label}
        </span>
        <span className="ub-tabular shrink-0 text-ub-caption text-ub-text-tertiary">
          {formatValue(item.value)}
        </span>
        <span
          className={clsx(
            "ub-tabular w-14 shrink-0 text-end",
            sub
              ? "text-ub-body-sm text-ub-text-secondary"
              : "text-ub-label-md text-ub-text-primary"
          )}
        >
          {pct(item.value)}
        </span>
      </>
    );
    const cls = clsx("flex min-h-11 items-center gap-2.5", sub && "ps-5");
    return (
      <li key={item.key} className="break-inside-avoid">
        {item.href ? (
          <Link
            href={item.href}
            aria-label={`${item.label}: ${formatValue(
              item.value
            )} ${unit}, ${pct(item.value)}`}
            className={clsx(
              cls,
              "-mx-2 rounded-ub-md px-2 hover:bg-ub-surface-subtle",
              sub && "ps-7",
              focusRing
            )}
          >
            {body}
          </Link>
        ) : (
          <div className={cls}>{body}</div>
        )}
      </li>
    );
  };

  const Icon = summary?.icon;
  const headline = summary ? (
    <div className="flex items-center gap-4 rounded-ub-md border-s-4 border-ub-action-primary bg-ub-surface-subtle px-4 py-3">
      {Icon && (
        <Icon
          aria-hidden="true"
          className="h-8 w-8 shrink-0 text-ub-action-primary"
        />
      )}
      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span className="ub-tabular text-ub-heading-lg text-ub-text-primary">
            {formatValue(summary.value)}
          </span>
          <span className="text-ub-label-md text-ub-text-primary">
            {summary.label}
          </span>
        </p>
        {summary.detail && (
          <p className="ub-tabular mt-0.5 text-ub-caption text-ub-text-tertiary">
            {summary.detail}
          </p>
        )}
      </div>
    </div>
  ) : null;
  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      actions={actions}
      controls={controls}
      bodyProps={bodyClassName ? { className: bodyClassName } : undefined}
      as={as}
      state={state === "ready" && total === 0 ? "empty" : state}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      onRetry={onRetry}
      skeleton="chart"
      className={className}
    >
      {ranked ? (
        <div className="flex min-w-0 flex-col gap-5">
          {headline}
          <RankedBars
            items={items}
            unit={unit}
            label={centerLabel}
            top={Number.POSITIVE_INFINITY}
            fold={top}
            restLabel={restLabel}
            percentDigits={percentDigits}
            formatValue={formatValue}
          />
        </div>
      ) : (
        <div className="grid min-w-0 items-center gap-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
          <DonutChart
            segments={slices.map((s) => ({
              key: s.key,
              label: s.label,
              value: s.value,
              color: s.color,
            }))}
            centerValue={formatValue(total)}
            centerLabel={centerLabel}
            label={`${centerLabel}, ${formatValue(total)} ${unit}`}
            className="max-w-[15rem]"
          />
          <div className="flex min-w-0 flex-col gap-5">
            {headline}
            <ul
              aria-label={`${centerLabel}, ${formatValue(total)} ${unit}`}
              className={legendColumns === 2 ? "gap-x-8 sm:columns-2" : undefined}
            >
              {slices.map((s) =>
                s.key === "__other" ? (
                  <li key={s.key} className="break-inside-avoid">
                    <ul
                      aria-label={`Other: ${folded
                        .map((f) => f.label)
                        .join(", ")}`}
                    >
                      {row({ ...s, label: "Other" }, s.color)}
                      {folded.map((f) => row(f, null, true))}
                    </ul>
                  </li>
                ) : (
                  row(s, s.color)
                )
              )}
            </ul>
          </div>
        </div>
      )}
      {reconciliation && group && (
        <div className="mt-6 border-t border-ub-border pt-5">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-ub-label-lg text-ub-text-primary">
              {reconciliation.title}
            </h3>
            {reconciliation.note && (
              <p className="text-ub-caption text-ub-text-tertiary">
                {reconciliation.note}
              </p>
            )}
          </div>
          {groups.length > 1 && (
            <Tabs
              aria-label={reconciliation.title}
              idPrefix={prefix}
              variant="segmented"
              size="sm"
              className="mb-4"
              tabs={groups.map((g) => ({
                key: g.id,
                label: `${g.label} · ${formatValue(
                  g.rows.reduce((s, r) => s + r.total, 0)
                )}`,
              }))}
              active={group.id}
              onChange={setGroupId}
            />
          )}
          <div {...(groups.length > 1 ? tabPanelProps(prefix, group.id) : {})}>
            <ReconciliationBars
              rows={group.rows}
              unit={unit}
              formatValue={formatValue}
            />
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
