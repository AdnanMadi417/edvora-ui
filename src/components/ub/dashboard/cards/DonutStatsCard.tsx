"use client";

import { useId, useState, type ReactNode } from "react";
import clsx from "clsx";
import Link from "next/link";
import { focusRing } from "components/ub/recipes";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import DashboardCard from "./DashboardCard";
import DonutChart, { DONUT_COLORS, DONUT_OTHER_COLOR, type DonutSegment } from "../charts/DonutChart";
import type { WidgetState } from "../types";

export interface DonutStatsItem {
  key: string;
  label: string;
  value: number;
  /** Opens the list behind this slice (e.g. applications filtered to the stage). */
  href?: string;
}

export interface DonutStatsView {
  /** Tab key. */
  id: string;
  /** Tab text; the view's total is shown beside it. */
  label: string;
  /** Small text in the donut's hole, above the total. */
  centerLabel: string;
  items: DonutStatsItem[];
  /** Keep the given order (e.g. workflow stages) instead of largest first. */
  keepOrder?: boolean;
}

export interface DonutStatsCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** One or more ways to split the same total; two or more show as tabs. */
  views: DonutStatsView[];
  /** End-side header controls, e.g. a CardLinkButton. */
  actions?: ReactNode;
  state?: WidgetState;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  /** Formats values and totals (default: 1,234). */
  formatValue?: (value: number) => string;
  /** Slices shown before the rest fold into "Other" (max 5: the validated colour slots). */
  maxSlices?: number;
  as?: "h2" | "h3" | "h4";
  className?: string;
}

const num = (value: number) => value.toLocaleString();

/** Largest first, capped at `max`, the rest folded into one "Other" slice. */
export function foldSlices(items: DonutStatsItem[], max = 5, keepOrder = false): (DonutStatsItem & { color: string })[] {
  const sorted = keepOrder ? items.filter((i) => i.value > 0) : [...items].filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
  const cap = Math.min(max, DONUT_COLORS.length);
  const head = sorted.length > cap ? sorted.slice(0, cap - 1) : sorted;
  const rest = sorted.slice(head.length);
  const shown: (DonutStatsItem & { color: string })[] = head.map((item, i) => ({ ...item, color: DONUT_COLORS[i] as string }));
  if (rest.length)
    shown.push({ key: "__other", label: `Other (${rest.length})`, value: rest.reduce((sum, i) => sum + i.value, 0), color: DONUT_OTHER_COLOR });
  return shown;
}

/**
 * A total split into parts: tabs for each way of splitting it, a donut with the
 * total in the hole, and a legend (swatch, name, share, value) whose rows link
 * to the list behind each part. Colours are fixed categorical slots, never
 * cycled; past five parts the rest fold into "Other".
 */
export default function DonutStatsCard({
  title,
  subtitle,
  views,
  actions,
  state = "ready",
  emptyMessage = "Nothing to show yet.",
  errorMessage,
  onRetry,
  formatValue = num,
  maxSlices = 5,
  as = "h2",
  className,
}: DonutStatsCardProps) {
  const prefix = useId();
  const [activeId, setActiveId] = useState(views[0]?.id ?? "");
  const view = views.find((v) => v.id === activeId) ?? views[0];
  const total = (v: DonutStatsView) => v.items.reduce((sum, i) => sum + Math.max(0, i.value), 0);
  const slices = view ? foldSlices(view.items, maxSlices, view.keepOrder) : [];
  const viewTotal = view ? total(view) : 0;
  const cardState: WidgetState = state === "ready" && viewTotal === 0 ? "empty" : state;

  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      actions={actions}
      as={as}
      className={clsx("h-full", className)}
      state={cardState}
      skeleton="chart"
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      onRetry={onRetry}
      controls={
        views.length > 1 ? (
          <Tabs
            aria-label="Split by"
            idPrefix={prefix}
            fullWidth
            tabs={views.map((v) => ({ key: v.id, label: state === "ready" ? `${v.label} · ${formatValue(total(v))}` : v.label }))}
            active={view?.id ?? ""}
            onChange={setActiveId}
          />
        ) : undefined
      }
      bodyProps={views.length > 1 && view ? tabPanelProps(prefix, view.id) : undefined}
    >
      {view && (
        <div className="grid items-center gap-5">
          <DonutChart
            className="w-44"
            segments={slices.map((s): DonutSegment => ({ key: s.key, label: s.label, value: s.value, color: s.color }))}
            centerLabel={view.centerLabel}
            centerValue={formatValue(viewTotal)}
            label={`${view.centerLabel} by ${view.label.toLowerCase()}`}
          />
          <ul aria-label={`${view.label}, ${formatValue(viewTotal)} in total`} className="grid min-w-0 gap-1">
            {slices.map((s) => {
              const share = viewTotal > 0 ? Math.round((s.value / viewTotal) * 100) : 0;
              const row = (
                <>
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="min-w-0 flex-1 truncate text-ub-body-sm" title={s.label}>
                    <span className="text-ub-label-md text-ub-text-primary">{s.label}</span>
                    <span className="text-ub-text-tertiary"> · {share}%</span>
                  </span>
                  <span className="ub-tabular shrink-0 text-ub-label-md text-ub-text-primary">{formatValue(s.value)}</span>
                </>
              );
              const rowClass = "flex min-h-11 items-center gap-3 rounded-ub-md px-2 py-1.5";
              return (
                <li key={s.key} className="min-w-0">
                  {s.href ? (
                    <Link href={s.href} aria-label={`${s.label}: ${formatValue(s.value)}, ${share}%`} className={clsx(rowClass, "hover:bg-ub-surface-subtle", focusRing)}>
                      {row}
                    </Link>
                  ) : (
                    <span className={rowClass}>{row}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </DashboardCard>
  );
}
