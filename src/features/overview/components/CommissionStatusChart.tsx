"use client";
import { useState } from "react";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import Combobox from "components/ub/forms/selection/Combobox";
import Tag from "components/ub/data/badges/Tag";
import CardLinkButton from "components/ub/dashboard/cards/CardLinkButton";
import { TextButton } from "components/ub/core/buttons/TextButton";
import { CHART_BG } from "components/ub/dashboard/types";
import RadialRingsChart from "components/ub/dashboard/charts/RadialRingsChart";
import type { OverviewResource } from "../model/types";

// Ring colours as CSS values, matching the CHART_BG swatches in the rows.
const RING = {
  "cat-1": "var(--ub-chart-cat-1)",
  "cat-2": "var(--ub-chart-cat-2)",
  "cat-3": "var(--ub-chart-cat-3)",
} as const;
// Same words as the Commission Tracker: "Expected" there means applications
// that haven't reached the commission stage, so it isn't used here.
const STAGES = [
  { key: "expected" as const, label: "With university", color: "cat-1" as const },
  { key: "ready" as const, label: "Ready for payout", advisorLabel: "Due to you", color: "cat-2" as const },
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
  audience = "staff",
  href,
}: {
  resource?: OverviewResource;
  onRetry: () => void;
  /** Advisors read "Due to you" where staff read "Ready for payout". */
  audience?: "advisor" | "staff";
  /** The full list: the Commission Tracker (Advisors) or the Finance queue (admin). */
  href?: string;
}) {
  const [selection, setSelection] = useState("");
  const all = resource?.data?.universityCommission || [];
  const currencies = Array.from(new Set(all.map((row) => row.currency))).sort();
  const currency = currencies.includes(selection) ? selection : currencies[0] || "";
  const rows = all.filter((row) => row.currency === currency);
  const money = (value: number) => `${currency} ${value.toLocaleString("en-MY", { maximumFractionDigits: 2 })}`;

  const stages = STAGES.map((stage) => ({
    ...stage,
    label: audience === "advisor" && "advisorLabel" in stage ? stage.advisorLabel : stage.label,
    amount: rows.reduce((sum, row) => sum + row[stage.key].amount, 0),
    count: rows.reduce((sum, row) => sum + row[stage.key].records.length, 0),
    unknown: rows.some((row) => row[stage.key].unknown > 0),
  }));
  const anyUnknown = stages.some((s) => s.unknown);
  const total = stages.reduce((sum, s) => sum + s.amount, 0);
  const disputed = rows.reduce((sum, row) => sum + row.disputed, 0);
  const counted = stages.reduce((sum, s) => sum + s.count, 0);
  // Money in other currencies is never added in; say it exists and let one press switch to it.
  const others = currencies
    .filter((c) => c !== currency)
    .map((c) => {
      const inC = all.filter((row) => row.currency === c);
      const amount = inC.reduce((sum, row) => sum + row.expected.amount + row.ready.amount + row.paid.amount, 0);
      const count = inC.reduce((sum, row) => sum + row.expected.records.length + row.ready.records.length + row.paid.records.length + row.disputed, 0);
      return { currency: c, amount, count };
    });
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
        <>
          {currencies.length > 1 && (
            <div className="w-28">
              <Combobox compact ariaLabel="Chart currency" options={currencies.map((value) => ({ value, label: value }))} value={currency} onChange={(value) => setSelection(value || "")} />
            </div>
          )}
          {href && <CardLinkButton href={href} label={audience === "advisor" ? "Open Commission Tracker" : "Open finance queue"} />}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Every commission in this currency is accounted for: the rows plus any disputed. */}
        <p className="flex flex-wrap items-center gap-2 text-ub-body-sm text-ub-text-secondary">
          <span className="ub-tabular">
            {counted + disputed} {counted + disputed === 1 ? "commission" : "commissions"}
          </span>
          {disputed > 0 && (
            <Tag tone="danger" size="sm">
              {disputed} disputed, not in the total
            </Tag>
          )}
        </p>
        <div className="grid items-center gap-5">
          {/* Each ring is a stage's share of the total; the total sits in the hole. */}
          {anyUnknown ? (
            <p className="grid aspect-square w-44 place-items-center rounded-ub-full border border-dashed border-ub-border text-center text-ub-body-sm text-ub-text-secondary">
              Total not available
            </p>
          ) : (
            <RadialRingsChart
              className="w-44"
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
        {others.map((o) => (
          <TextButton key={o.currency} size="sm" className="self-start [@media(pointer:coarse)]:min-h-11" onClick={() => setSelection(o.currency)}>
            {`Also ${o.currency} ${o.amount.toLocaleString("en-MY", { maximumFractionDigits: 2 })} across ${o.count} ${o.count === 1 ? "commission" : "commissions"}`}
          </TextButton>
        ))}
      </div>
    </DashboardCard>
  );
}
