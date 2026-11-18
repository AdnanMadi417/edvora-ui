"use client";
import { useId, useState } from "react";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import CategoryColumnChart from "components/ub/dashboard/charts/CategoryColumnChart";
import GroupedBarChart from "components/ub/dashboard/charts/GroupedBarChart";
import AreaLineChart from "components/ub/dashboard/charts/AreaLineChart";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import Combobox from "components/ub/forms/selection/Combobox";
import type { OverviewResource } from "../model/types";
type View = "totals" | "universities" | "months";
const MONTH = new Intl.DateTimeFormat("en-MY", {
  month: "short",
  timeZone: "UTC",
});

/**
 * Commission in one currency at a time, three ways: totals by payout stage,
 * Expected / Ready / Paid per university, and paid per month (settled records
 * only, so it is real history, not an invented trend).
 */
export default function CommissionStatusChart({
  resource,
  onRetry,
}: {
  resource?: OverviewResource;
  onRetry: () => void;
}) {
  const [selection, setSelection] = useState("");
  const [view, setView] = useState<View>("totals");
  const prefix = useId();
  const all = resource?.data?.universityCommission || [];
  const currencies = Array.from(new Set(all.map((row) => row.currency))).sort();
  const currency = currencies.includes(selection)
    ? selection
    : currencies[0] || "";
  const rows = all.filter((row) => row.currency === currency);
  const stages = [
    { key: "expected" as const, label: "Expected" },
    { key: "ready" as const, label: "Ready for payout" },
    { key: "paid" as const, label: "Paid" },
  ];
  const data = stages.map((stage) => ({
    key: stage.key,
    label: stage.label,
    value: rows.reduce((sum, row) => sum + row[stage.key].amount, 0),
    unknown: rows.some((row) => row[stage.key].unknown > 0),
  }));
  const unknown = data.some((stage) => stage.unknown || stage.value < 0);
  const money = (value: number) =>
    `${currency} ${value.toLocaleString("en-MY", {
      maximumFractionDigits: 2,
    })}`;
  // Top five universities by total; the rest would be unreadable as bars.
  const byUniversity = [...rows]
    .map((row) => ({
      row,
      total: row.expected.amount + row.ready.amount + row.paid.amount,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map(({ row }) => ({
      key: row.key,
      label: row.name,
      values: [row.expected.amount, row.ready.amount, row.paid.amount],
    }));
  const months = (resource?.data?.paidByMonth ?? [])
    .filter((m) => m.currency === currency)
    .map((m) => ({
      key: m.month,
      label: MONTH.format(new Date(`${m.month}-01T00:00:00Z`)),
      value: m.amount,
    }));
  const state =
    resource?.state === "ready" && !rows.length
      ? "empty"
      : resource?.state || "loading";
  return (
    <DashboardCard
      title="Commission overview"
      subtitle="Current amounts by payout stage."
      as="h2"
      className="h-full"
      state={state}
      skeleton="chart"
      errorMessage={resource?.error}
      onRetry={onRetry}
      emptyMessage="Commission amounts will appear when applications reach this stage."
      bodyProps={tabPanelProps(prefix, view)}
      controls={
        currencies.length ? (
          <div className="flex flex-col gap-3">
            <Tabs<View>
              aria-label="Commission view"
              idPrefix={prefix}
              variant="segmented"
              size="sm"
              tabs={[
                { key: "totals", label: "Totals" },
                { key: "universities", label: "By university" },
                { key: "months", label: "Paid by month" },
              ]}
              active={view}
              onChange={setView}
            />
            <div className="max-w-48">
              <Combobox
                compact
                ariaLabel="Chart currency"
                options={currencies.map((value) => ({ value, label: value }))}
                value={currency}
                onChange={(value) => setSelection(value || "")}
              />
            </div>
          </div>
        ) : undefined
      }
      footer={
        <p className="text-ub-caption text-ub-text-tertiary">
          {currency ? `${currency} only. ` : ""}Current snapshot; disputed
          commissions are excluded.
        </p>
      }
    >
      {view === "universities" ? (
        <GroupedBarChart
          label={`Commission per university in ${currency}`}
          series={[
            { key: "expected", label: "Expected", color: "cat-1" },
            { key: "ready", label: "Ready for payout", color: "cat-2" },
            { key: "paid", label: "Paid", color: "cat-3" },
          ]}
          groups={byUniversity}
          formatValue={money}
        />
      ) : view === "months" ? (
        months.length ? (
          <AreaLineChart
            label={`Commission paid per month in ${currency}`}
            points={months}
            formatValue={money}
          />
        ) : (
          <p className="grid min-h-48 place-items-center text-center text-ub-body-sm text-ub-text-secondary">
            No commission has been paid in {currency} yet.
          </p>
        )
      ) : unknown ? (
        <div className="grid min-h-48 items-center gap-3">
          {data.map((stage) => (
            <div
              key={stage.key}
              className="flex items-center justify-between gap-3 border-b border-ub-border py-3 last:border-0"
            >
              <span className="text-ub-body-sm text-ub-text-secondary">
                {stage.label}
              </span>
              <span className="ub-tabular text-ub-label-md">
                {stage.unknown
                  ? "Not available"
                  : `${currency} ${stage.value.toLocaleString("en-MY")}`}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <CategoryColumnChart
          data={data}
          state={data.some((stage) => stage.value > 0) ? "ready" : "empty"}
          emptyMessage="No undisputed commission amounts in this currency yet."
          label={`Commission amounts in ${currency}`}
          formatValue={(value) =>
            value.toLocaleString("en-MY", { maximumFractionDigits: 2 })
          }
          unit={currency}
          heightClass="h-48"
        />
      )}
    </DashboardCard>
  );
}
