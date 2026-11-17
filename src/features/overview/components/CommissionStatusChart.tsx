"use client";
import { useState } from "react";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import CategoryColumnChart from "components/ub/dashboard/charts/CategoryColumnChart";
import Combobox from "components/ub/forms/selection/Combobox";
import type { OverviewResource } from "../model/types";
/** A current-state comparison, not an invented earnings history. */
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
      controls={
        currencies.length ? (
          <div className="max-w-48">
            <Combobox
              compact
              ariaLabel="Chart currency"
              options={currencies.map((value) => ({ value, label: value }))}
              value={currency}
              onChange={(value) => setSelection(value || "")}
            />
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
      {unknown ? (
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
