"use client";

import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { focusRing } from "components/ub/recipes";
import Skeleton from "components/ub/feedback/states/Skeleton";
import RadialRingsChart from "../charts/RadialRingsChart";
import { DONUT_COLORS } from "../charts/DonutChart";

export interface RadialStatsItem {
  /** Returned by onSelect; null for an "all" item. */
  id: string;
  label: string;
  value: number;
}

export interface RadialStatsCardProps {
  /** Optional when the card sits inside a DashboardCard that has its own title. */
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Outermost ring first; at most five (the checked colour slots). */
  items: RadialStatsItem[];
  /** The whole every item is a share of; shown in the hole. */
  total: number;
  /** Word under the total, e.g. "advisors". */
  totalLabel: string;
  /** Makes each legend row a filter toggle (press again to clear). */
  onSelect?: (id: string | null) => void;
  /** Makes each legend row a link instead, e.g. the list filtered to that group. */
  getHref?: (item: RadialStatsItem) => string;
  selectedId?: string | null;
  loading?: boolean;
  as?: "h2" | "h3";
  /** false inside a section that already has a border (no border or padding of its own). */
  framed?: boolean;
  className?: string;
}

/**
 * Several measures of one whole as concentric rings (e.g. advisors: active,
 * suspended, company, individual), the total in the hole, and a legend whose
 * rows give each count and share and can filter the list below.
 */
export default function RadialStatsCard({
  title,
  subtitle,
  items,
  total,
  totalLabel,
  onSelect,
  getHref,
  selectedId = null,
  loading = false,
  as: Heading = "h2",
  framed = true,
  className,
}: RadialStatsCardProps) {
  const rings = items.slice(0, DONUT_COLORS.length).map((item, i) => ({ ...item, key: item.id, color: DONUT_COLORS[i] as string }));
  return (
    <section aria-busy={loading || undefined} className={clsx(framed && "rounded-ub-lg border border-ub-border bg-ub-surface p-4 md:p-5", className)}>
      {title && <Heading className="text-ub-heading-sm text-ub-text-primary">{title}</Heading>}
      {subtitle && <p className="mt-0.5 text-ub-body-sm text-ub-text-secondary">{subtitle}</p>}
      <div className={clsx("grid items-center gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8", title && "mt-4")}>
        {loading ? (
          <Skeleton className="mx-auto aspect-square w-48 !rounded-ub-full sm:w-52" />
        ) : (
          <RadialRingsChart
            className="w-48 sm:w-52"
            rings={rings}
            total={total}
            centerValue={total.toLocaleString()}
            centerLabel={totalLabel}
            label={`${typeof title === "string" ? title : totalLabel}`}
            activeKey={selectedId}
          />
        )}
        <ul aria-label={typeof title === "string" ? title : totalLabel} className="grid gap-2">
          {rings.map((ring) => {
            const share = total > 0 ? Math.round((ring.value / total) * 100) : 0;
            const pressed = selectedId === ring.id;
            const body = (
              <>
                <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-ub-full" style={{ background: ring.color }} />
                <span className="min-w-0 flex-1 truncate text-ub-label-md text-ub-text-secondary">{ring.label}</span>
                <span className="ub-tabular shrink-0 text-ub-label-lg text-ub-text-primary">{loading ? "—" : ring.value.toLocaleString()}</span>
                <span className="ub-tabular w-10 shrink-0 text-end text-ub-caption text-ub-text-tertiary">{loading ? "" : `${share}%`}</span>
              </>
            );
            const row = "flex min-h-11 w-full items-center gap-3 rounded-ub-md border px-3 py-2 text-start";
            return (
              <li key={ring.id} className="min-w-0">
                {getHref ? (
                  <Link
                    href={getHref(ring)}
                    aria-label={`${ring.label}: ${ring.value.toLocaleString()}, ${share}% of ${totalLabel}`}
                    className={clsx(row, "border-ub-border transition-colors duration-ub-fast hover:border-ub-border-hover hover:bg-ub-surface-subtle motion-reduce:transition-none", focusRing)}
                  >
                    {body}
                  </Link>
                ) : onSelect ? (
                  <button
                    type="button"
                    aria-pressed={pressed}
                    aria-label={`${ring.label}: ${ring.value.toLocaleString()}, ${share}% of ${totalLabel}`}
                    disabled={loading}
                    onClick={() => onSelect(pressed ? null : ring.id)}
                    className={clsx(
                      row,
                      "transition-colors duration-ub-fast motion-reduce:transition-none",
                      pressed ? "border-ub-border-focus bg-ub-selected ring-1 ring-inset ring-ub-border-focus" : "border-ub-border hover:border-ub-border-hover hover:bg-ub-surface-subtle",
                      focusRing
                    )}
                  >
                    {body}
                  </button>
                ) : (
                  <span className={clsx(row, "border-ub-border")}>{body}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
