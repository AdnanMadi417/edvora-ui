"use client";
import { useState } from "react";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import Combobox from "components/ub/forms/selection/Combobox";
import Tag from "components/ub/data/badges/Tag";
import { CHART_BG } from "components/ub/dashboard/types";
import RadialRingsChart from "components/ub/dashboard/charts/RadialRingsChart";
import type { OverviewResource } from "../model/types";

// Ring colours as CSS values, matching the CHART_BG swatches in the rows.
const RING = {
  "cat-1": "var(--ub-chart-cat-1)",
  "cat-2": "var(--ub-chart-cat-2)",
  "cat-3": "var(--ub-chart-cat-3)",
} as const;
const STAGES = [
  { key: "expected" as const, label: "Expected", color: "cat-1" as const },
  { key: "ready" as const, label: "Ready for payout", color: "cat-2" as const },
  { key: "paid" as const, label: "Paid", color: "cat-3" as const },
];

/**
 * Where commission stands, in one currency at a time: one ring per payout
 * stage (its share of the total), the total in the hole, and one row per stage
 * (count, share, amount). Disputed commissions are named, not counted; a
 * missing amount is never charted as zero or folded into a total.
 */
export default function CommissionStatusChart({
  resource,
  onRetry,
}: {
  resource?: OverviewResource;
  onRetry: () => void;
}) {
  const [selection, setSelection] = useState("");
  const all = resource?.data?.universityCommission || [];
  const currencies = Array.from(new Set(all.map((row) => row.currency))).sort();
  const currency = currencies.includes(selection) ? selection : currencies[0] || "";
  const rows = all.filter((row) => row.currency === currency);
  const money = (value: number) => `${currency} ${value.toLocaleString("en-MY", { maximumFractionDigits: 2 })}`;

  const stages = STAGES.map((stage) => ({
    ...stage,
    amount: rows.reduce((sum, row) => sum + row[stage.key].amount, 0),
    count: rows.reduce((sum, row) => sum + row[stage.key].records.length, 0),
    unknown: rows.some((row) => row[stage.key].unknown > 0),
  }));
  const anyUnknown = stages.some((s) => s.unknown);
  const total = stages.reduce((sum, s) => sum + s.amount, 0);
  const disputed = rows.reduce((sum, row) => sum + row.disputed, 0);
  const state = resource?.state === "ready" && !rows.length ? "empty" : resource?.state || "loading";

  return (
    <DashboardCard
      title="Commission overview"
      subtitle={currency ? `Where your commission stands, in ${currency}.` : "Where your commission stands."}
      as="h2"
      className="h-full"
      state={state}
      skeleton="chart"
      errorMessage={resource?.error}
      onRetry={onRetry}
      emptyMessage="Commission amounts will appear when applications reach this stage."
      actions={
        currencies.length > 1 ? (
          <div className="w-28">
            <Combobox compact ariaLabel="Chart currency" options={currencies.map((value) => ({ value, label: value }))} value={currency} onChange={(value) => setSelection(value || "")} />
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        {disputed > 0 && (
          <Tag tone="danger" size="sm" className="self-start">
            {disputed} disputed, not included
          </Tag>
        )}
        <div className="grid items-center gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6">
          {/* Each ring is a stage's share of the total; the total sits in the hole. */}
          {anyUnknown ? (
            <p className="grid aspect-square w-44 place-items-center rounded-ub-full border border-dashed border-ub-border text-center text-ub-body-sm text-ub-text-secondary">
              Total not available
            </p>
          ) : (
            <RadialRingsChart
              className="w-44 sm:w-48"
              rings={stages.map((s) => ({ key: s.key, label: s.label, value: s.amount, color: RING[s.color] }))}
              total={total}
              centerValue={<span className="text-ub-heading-sm">{money(total)}</span>}
              centerLabel="tracked"
              label={`Commission by payout stage in ${currency}`}
            />
          )}
          <ul aria-label={`Commission amounts in ${currency}`} className="grid gap-1">
            {stages.map((s) => {
              const share = !anyUnknown && total > 0 ? Math.round((s.amount / total) * 100) : null;
              return (
                <li
                  key={s.key}
                  aria-label={`${s.label}: ${s.unknown ? "Not available" : money(s.amount)}, ${s.count} ${s.count === 1 ? "commission" : "commissions"}`}
                  className="flex min-h-11 items-center gap-3 rounded-ub-md px-2 py-1.5"
                >
                  <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-ub-full ${CHART_BG[s.color]}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-ub-label-md text-ub-text-primary">{s.label}</span>
                    <span className="block truncate text-ub-caption text-ub-text-tertiary">
                      {s.count} {s.count === 1 ? "commission" : "commissions"}
                      {share != null ? ` · ${share}%` : ""}
                    </span>
                  </span>
                  <span className="ub-tabular shrink-0 text-ub-label-md text-ub-text-primary">{s.unknown ? "Not available" : money(s.amount)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </DashboardCard>
  );
}
