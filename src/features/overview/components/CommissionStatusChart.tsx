"use client";
import { useId, useState } from "react";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import GroupedBarChart from "components/ub/dashboard/charts/GroupedBarChart";
import AreaLineChart from "components/ub/dashboard/charts/AreaLineChart";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import Combobox from "components/ub/forms/selection/Combobox";
import Tag from "components/ub/data/badges/Tag";
import { CHART_BG } from "components/ub/dashboard/types";
import type { OverviewResource } from "../model/types";

type View = "overview" | "universities" | "months";
const MONTH = new Intl.DateTimeFormat("en-MY", { month: "short", timeZone: "UTC" });
const STAGES = [
  { key: "expected" as const, label: "Expected", color: "cat-1" as const },
  { key: "ready" as const, label: "Ready for payout", color: "cat-2" as const },
  { key: "paid" as const, label: "Paid", color: "cat-3" as const },
];

/**
 * Where commission stands, in one currency at a time. Overview: the total, a
 * bar split by payout stage and one row per stage (count and amount); disputed
 * commissions are named, not counted. By university: Expected / Ready / Paid
 * per university. Paid by month: settled records only, so it is real history.
 */
export default function CommissionStatusChart({
  resource,
  onRetry,
}: {
  resource?: OverviewResource;
  onRetry: () => void;
}) {
  const [selection, setSelection] = useState("");
  const [view, setView] = useState<View>("overview");
  const prefix = useId();
  const all = resource?.data?.universityCommission || [];
  const currencies = Array.from(new Set(all.map((row) => row.currency))).sort();
  const currency = currencies.includes(selection) ? selection : currencies[0] || "";
  const rows = all.filter((row) => row.currency === currency);
  const money = (value: number) => `${currency} ${value.toLocaleString("en-MY", { maximumFractionDigits: 2 })}`;

  const stages = STAGES.map((stage) => ({
    ...stage,
    amount: rows.reduce((sum, row) => sum + row[stage.key].amount, 0),
    count: rows.reduce((sum, row) => sum + row[stage.key].records.length, 0),
    // A redacted or missing amount is never charted as zero or folded into a total.
    unknown: rows.some((row) => row[stage.key].unknown > 0),
  }));
  const anyUnknown = stages.some((s) => s.unknown);
  const total = stages.reduce((sum, s) => sum + s.amount, 0);
  const disputed = rows.reduce((sum, row) => sum + row.disputed, 0);

  // Top five universities by total; more would be unreadable as bars.
  const byUniversity = [...rows]
    .map((row) => ({ row, sum: row.expected.amount + row.ready.amount + row.paid.amount }))
    .sort((a, b) => b.sum - a.sum)
    .slice(0, 5)
    .map(({ row }) => ({ key: row.key, label: row.name, values: [row.expected.amount, row.ready.amount, row.paid.amount] }));
  const months = (resource?.data?.paidByMonth ?? [])
    .filter((m) => m.currency === currency)
    .map((m) => ({ key: m.month, label: MONTH.format(new Date(`${m.month}-01T00:00:00Z`)), value: m.amount }));

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
      controls={
        currencies.length ? (
          <Tabs<View>
            aria-label="Commission view"
            idPrefix={prefix}
            variant="segmented"
            size="sm"
            tabs={[
              { key: "overview", label: "Overview" },
              { key: "universities", label: "By university" },
              { key: "months", label: "Paid by month" },
            ]}
            active={view}
            onChange={setView}
          />
        ) : undefined
      }
      bodyProps={tabPanelProps(prefix, view)}
    >
      {view === "universities" ? (
        <GroupedBarChart
          label={`Commission per university in ${currency}`}
          series={STAGES.map((s) => ({ key: s.key, label: s.label, color: s.color }))}
          groups={byUniversity}
          formatValue={money}
        />
      ) : view === "months" ? (
        months.length ? (
          <AreaLineChart label={`Commission paid per month in ${currency}`} points={months} formatValue={money} />
        ) : (
          <p className="grid min-h-48 place-items-center text-center text-ub-body-sm text-ub-text-secondary">No commission has been paid in {currency} yet.</p>
        )
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-ub-caption text-ub-text-tertiary">Total tracked</p>
              <p className="ub-tabular text-ub-data-lg text-ub-text-primary">{anyUnknown ? "Not available" : money(total)}</p>
            </div>
            {disputed > 0 && (
              <Tag tone="danger" size="sm">
                {disputed} disputed, not included
              </Tag>
            )}
          </div>

          {/* The split as one bar; the rows below carry the same numbers in text. */}
          {!anyUnknown && total > 0 && (
            <div aria-hidden="true" className="flex h-3 w-full gap-0.5 overflow-hidden rounded-ub-full bg-ub-chart-track">
              {stages
                .filter((s) => s.amount > 0)
                .map((s) => (
                  <span key={s.key} data-stage={s.key} className={`h-full ${CHART_BG[s.color]}`} style={{ width: `${(s.amount / total) * 100}%` }} />
                ))}
            </div>
          )}

          <ul aria-label={`Commission amounts in ${currency}`} className="grid gap-1">
            {stages.map((s) => (
              <li
                key={s.key}
                aria-label={`${s.label}: ${s.unknown ? "Not available" : money(s.amount)}, ${s.count} ${s.count === 1 ? "commission" : "commissions"}`}
                className="flex min-h-11 items-center gap-3 rounded-ub-md px-2 py-1.5"
              >
                <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-ub-full ${CHART_BG[s.color]}`} />
                <span className="min-w-0 flex-1 truncate text-ub-body-sm">
                  <span className="text-ub-label-md text-ub-text-primary">{s.label}</span>
                  <span className="text-ub-text-tertiary">
                    {" "}
                    · {s.count} {s.count === 1 ? "commission" : "commissions"}
                  </span>
                </span>
                <span className="ub-tabular shrink-0 text-ub-label-md text-ub-text-primary">{s.unknown ? "Not available" : money(s.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardCard>
  );
}
