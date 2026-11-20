"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Building2, Hourglass } from "lucide-react";
import StatTile from "components/ub/dashboard/cards/StatTile";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import CompositionCard from "components/ub/dashboard/cards/CompositionCard";
import AreaLineChart from "components/ub/dashboard/charts/AreaLineChart";
import ActivityFeed from "components/ub/dashboard/lists/ActivityFeed";
import Tabs from "components/ub/navigation/controls/Tabs";
import { formatCommissionAmount } from "features/applications/shared/commissionTypes";
import { useFinanceInsights } from "./useFinanceInsights";
import { byState, byUniversity, currencies, latestActivity, paidOverTime, totals } from "./financeInsightsModel";

type Grain = "monthly" | "quarterly";
type Split = "state" | "university";

// No change pill: the current month or quarter is still in progress, so it can't be compared fairly.
const GRAINS: { key: Grain; label: string; range: string }[] = [
  { key: "monthly", label: "Monthly", range: "last 12 months" },
  { key: "quarterly", label: "Quarterly", range: "last 8 quarters" },
];

const ACTIVITY_VERB = {
  pay_in: "Received",
  payout: "Paid",
  dispute: "Dispute opened on",
  arrival: "Arrival confirmed for",
} as const;

/**
 * Commission at a glance for finance, above the queue: four totals, money
 * paid to Advisors over time, the latest activity, and where commission sits.
 * One currency at a time; nothing is converted.
 */
export default function FinanceInsights() {
  const { items, state, error, retry } = useFinanceInsights();
  const options = useMemo(() => currencies(items), [items]);
  const [picked, setPicked] = useState<string | null>(null);
  const currency = picked && options.includes(picked) ? picked : options[0] ?? "MYR";
  const [grain, setGrain] = useState<Grain>("monthly");
  const [split, setSplit] = useState<Split>("state");

  const money = (value: number) => formatCommissionAmount(value, currency);
  const t = useMemo(() => totals(items, currency), [items, currency]);
  const series = useMemo(() => paidOverTime(items, currency, grain), [items, currency, grain]);
  const activity = useMemo(() => latestActivity(items), [items]);
  const slices = useMemo(() => (split === "state" ? byState(items, currency) : byUniversity(items, currency)), [items, currency, split]);
  const grainInfo = GRAINS.find((g) => g.key === grain)!;
  const tileState = state === "error" ? "error" : state;

  return (
    <section aria-label="Commission insights" className="space-y-4">
      {/* Currency first: every figure below is in this one currency. */}
      {options.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-ub-body-sm text-ub-text-secondary">Amounts are never converted: pick a currency.</p>
          <Tabs<string>
            aria-label="Currency"
            variant="segmented"
            size="sm"
            tabs={options.map((c) => ({ key: c, label: c }))}
            active={currency}
            onChange={setPicked}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Received" value={money(t.received)} icon={ArrowDownLeft} iconTone="success" footer={{ text: "From universities" }} state={tileState} errorMessage={error ?? undefined} onRetry={retry} />
        <StatTile label="Paid" value={money(t.paid)} icon={ArrowUpRight} footer={{ text: "To Advisors" }} state={tileState} errorMessage={error ?? undefined} onRetry={retry} />
        <StatTile label="Owed to Advisors" value={money(t.owed)} icon={Hourglass} iconTone="warning" footer={{ text: "Received, not paid yet" }} state={tileState} errorMessage={error ?? undefined} onRetry={retry} />
        <StatTile label="With universities" value={money(t.withUniversities)} icon={Building2} footer={{ text: t.disputed ? `${t.disputed} disputed, not included` : "Not received yet" }} state={tileState} errorMessage={error ?? undefined} onRetry={retry} />
      </div>

      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-3">
        <DashboardCard
          className="lg:col-span-2"
          title="Paid to Advisors"
          subtitle={`By the date each payout was made, ${grainInfo.range}.`}
          as="h2"
          state={state}
          errorMessage={error ?? undefined}
          onRetry={retry}
          skeleton="chart"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Tabs<Grain> aria-label="Paid period" variant="segmented" size="sm" tabs={GRAINS} active={grain} onChange={setGrain} />
          </div>
          {series.some((s) => s.value) ? (
            <AreaLineChart curve="linear" markers points={series} label={`Paid to Advisors in ${currency}, ${grainInfo.range}`} formatValue={money} />
          ) : (
            <p className="py-10 text-center text-ub-body-sm text-ub-text-secondary">No payouts in {currency} in the {grainInfo.range}.</p>
          )}
        </DashboardCard>

        <DashboardCard
          title="Latest activity"
          subtitle="The newest event on each application."
          as="h2"
          state={state === "ready" && !activity.length ? "empty" : state}
          emptyMessage="No pay-ins or payouts yet."
          errorMessage={error ?? undefined}
          onRetry={retry}
          skeleton="list"
        >
          <ActivityFeed
            label="Latest commission activity"
            items={activity.map((row) => ({
              id: row.id,
              title:
                row.kind === "pay_in" || row.kind === "payout"
                  ? `${ACTIVITY_VERB[row.kind]} ${row.amount != null ? formatCommissionAmount(row.amount, row.currency) : ""} ${
                      row.kind === "pay_in" ? `from ${row.university}` : `to ${row.advisor ?? "the Advisor"}`
                    }`
                  : `${ACTIVITY_VERB[row.kind]} ${row.reference}`,
              nextStep: `${row.reference} · ${row.student}`,
              at: row.at,
              href: `/admin/applications/${row.applicationId}`,
            }))}
          />
        </DashboardCard>
      </div>

      <CompositionCard
        title="Where commission sits"
        as="h2"
        controls={
          <Tabs<Split>
            aria-label="Split commission by"
            variant="underline"
            inset={false}
            tabs={[
              { key: "state", label: "By status" },
              { key: "university", label: "By university" },
            ]}
            active={split}
            onChange={setSplit}
          />
        }
        bodyClassName="ub-fade-up"
        unit={currency}
        centerLabel={`Agreed commission, ${currency}`}
        items={slices}
        layout="donut"
        keepOrder={split === "state"}
        top={split === "university" ? 5 : undefined}
        restLabel={(n) => `Others (${n} ${n === 1 ? "university" : "universities"})`}
        formatValue={money}
        state={state}
        errorMessage={error ?? undefined}
        onRetry={retry}
        emptyMessage={`No commission in ${currency} yet.`}
      />
    </section>
  );
}
