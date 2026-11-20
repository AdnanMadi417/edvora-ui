"use client";

import { useId, useMemo, useState } from "react";
import { CircleCheck, CircleSlash, UserPlus, Users } from "lucide-react";
import DashboardHeader from "components/ub/dashboard/shared/DashboardHeader";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import StatTile from "components/ub/dashboard/cards/StatTile";
import CompositionCard from "components/ub/dashboard/cards/CompositionCard";
import AreaLineChart from "components/ub/dashboard/charts/AreaLineChart";
import DeltaPill from "components/ub/dashboard/shared/DeltaPill";
import PeopleList, { PeopleListItem } from "components/ub/dashboard/lists/PeopleList";
import ListFooter from "components/ub/dashboard/lists/ListFooter";
import WidgetStatus from "components/ub/dashboard/shared/WidgetStatus";
import Tabs from "components/ub/navigation/controls/Tabs";
import Combobox from "components/ub/forms/selection/Combobox";
import { useAdvisorInsights } from "./useAdvisorInsights";
import {
  INSIGHT_PERIODS,
  TYPE_LABEL,
  countBy,
  followUps,
  growth,
  kpis,
  performance,
  regionOf,
  type GrowthGrain,
  type InsightPeriod,
} from "./insightsModel";

type DistributionTab = "nationality" | "country" | "region" | "type";
type PerformanceTab = "applications" | "enrolled";

const BASE = "/admin/advisors";
const FOLLOW_UP_ROWS = 5;
const GRAINS: { key: GrowthGrain; label: string; previous: string; range: string }[] = [
  { key: "weekly", label: "Weekly", previous: "vs the week before", range: "last 12 weeks" },
  { key: "monthly", label: "Monthly", previous: "vs the month before", range: "last 12 months" },
  { key: "quarterly", label: "Quarterly", previous: "vs the quarter before", range: "last 8 quarters" },
];
const FOLLOW_UP_TONE = { Suspended: "danger", "No applications": "warning", "No recent login": "neutral" } as const;

/**
 * Advisor insights (admin): who the Advisors are, where they are, how the
 * network grows, who performs, and who needs a follow-up. Every number is
 * counted from the Advisor and application lists, so the cards agree.
 */
export default function AdvisorInsightsPage() {
  const { advisors, applications, state, error, retry } = useAdvisorInsights();
  const periodId = useId();
  const [period, setPeriod] = useState<InsightPeriod>("90d");
  const [distribution, setDistribution] = useState<DistributionTab>("nationality");
  const [grain, setGrain] = useState<GrowthGrain>("monthly");
  const [perf, setPerf] = useState<PerformanceTab>("applications");
  const [showAll, setShowAll] = useState(false);

  const k = useMemo(() => kpis(advisors, period), [advisors, period]);
  const perfData = useMemo(() => performance(advisors, applications), [advisors, applications]);
  const follow = useMemo(() => followUps(advisors, perfData.counts), [advisors, perfData]);
  const series = useMemo(() => growth(advisors, grain), [advisors, grain]);
  const periodLabel = INSIGHT_PERIODS.find((p) => p.key === period)!.label.toLowerCase();
  const tileState = state === "error" ? "error" : state;

  const slices = useMemo(() => {
    switch (distribution) {
      case "nationality":
        return countBy(advisors, (a) => a.nationality);
      case "country":
        return countBy(advisors, (a) => a.country);
      case "region":
        return countBy(advisors, (a) => regionOf(a.country));
      default:
        return countBy(advisors, (a) => TYPE_LABEL[a.type] ?? a.type).map((s) => ({
          ...s,
          href: `${BASE}?type=${s.label === "Company" ? "company" : "individual"}`,
        }));
    }
  }, [advisors, distribution]);
  const manyParts = distribution === "nationality" || distribution === "country";
  const partNoun = distribution === "nationality" ? "nationalities" : "countries";

  const last = series[series.length - 1]?.value ?? 0;
  const before = series[series.length - 2]?.value ?? 0;
  const growthDelta = before > 0 ? Math.round(((last - before) / before) * 1000) / 10 : null;
  const grainInfo = GRAINS.find((g) => g.key === grain)!;
  const newDelta = k.newBefore ? Math.round(((k.newInPeriod - k.newBefore) / k.newBefore) * 1000) / 10 : null;

  const perfItems = (perf === "applications" ? perfData.applications : perfData.enrolled).map((s) => ({
    ...s,
    href: `${BASE}/${encodeURIComponent(s.key)}`,
  }));
  const shownFollow = showAll ? follow : follow.slice(0, FOLLOW_UP_ROWS);

  if (state === "error") return <WidgetStatus state="error" errorMessage={error ?? undefined} onRetry={retry} />;

  return (
    <div className="mx-auto flex w-full min-w-0 flex-col gap-5 pb-8">
      <DashboardHeader
        title="Advisor insights"
        subtitle="Who your Advisors are, where they are, how the network grows and who needs a follow-up."
        secondaryActions={
          <div className="w-44">
            <Combobox
              compact
              id={periodId}
              ariaLabel="Period for new Advisors"
              value={period}
              onChange={(next) => setPeriod(next as InsightPeriod)}
              options={INSIGHT_PERIODS.map((p) => ({ value: p.key, label: p.label }))}
            />
          </div>
        }
      />

      {/* 1. Overview */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Total Advisors" value={k.total.toLocaleString()} icon={Users} footer={{ text: "Registered" }} href={BASE} state={tileState} />
        <StatTile
          label="New Advisors"
          value={k.newInPeriod.toLocaleString()}
          icon={UserPlus}
          iconTone="success"
          delta={newDelta !== null ? { value: newDelta, comparedTo: "vs the period before" } : undefined}
          footer={{ text: periodLabel === "all time" ? "All time" : `Joined in the ${periodLabel}` }}
          state={tileState}
        />
        <StatTile label="Active" value={k.active.toLocaleString()} icon={CircleCheck} iconTone="success" footer={{ text: "Can sign in and apply" }} href={`${BASE}?status=active`} state={tileState} />
        <StatTile label="Suspended" value={k.inactive.toLocaleString()} icon={CircleSlash} iconTone="danger" footer={{ text: "Can't sign in" }} href={`${BASE}?status=suspended`} state={tileState} />
      </div>

      {/* 2. Distribution */}
      <CompositionCard
        title="Where Advisors are"
        as="h2"
        controls={
          <Tabs<DistributionTab>
            aria-label="Distribution"
            variant="underline"
            inset={false}
            tabs={[
              { key: "nationality", label: "Nationality" },
              { key: "country", label: "Country" },
              { key: "region", label: "Region" },
              { key: "type", label: "Type" },
            ]}
            active={distribution}
            onChange={setDistribution}
          />
        }
        bodyClassName="ub-fade-up"
        unit="Advisors"
        centerLabel={distribution === "type" ? "By type" : distribution === "region" ? "By region" : distribution === "country" ? "By country of residence" : "By nationality"}
        items={slices}
        // Every tab is the donut; nationality and country show the top five and one Others slice.
        layout="donut"
        top={manyParts ? 5 : undefined}
        restLabel={(n) => `Others (${n} ${partNoun})`}
        state={state}
        onRetry={retry}
        emptyMessage="No Advisors yet."
      />

      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-2">
        {/* 3. Growth */}
        <DashboardCard title="Advisor growth" subtitle={`New Advisors by the date they registered, ${grainInfo.range}.`} as="h2" state={state} onRetry={retry} skeleton="chart">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Tabs<GrowthGrain> aria-label="Growth period" variant="segmented" size="sm" tabs={GRAINS} active={grain} onChange={setGrain} />
            {growthDelta !== null && <DeltaPill value={growthDelta} comparedTo={grainInfo.previous} />}
          </div>
          {series.some((s) => s.value) ? (
            <AreaLineChart
              curve="linear"
              markers
              wholeNumbers
              points={series}
              label={`New Advisors, ${grainInfo.range}`}
              formatValue={(v) => `${v} new ${v === 1 ? "Advisor" : "Advisors"}`}
            />
          ) : (
            <p className="py-10 text-center text-ub-body-sm text-ub-text-secondary">No new Advisors in the {grainInfo.range}.</p>
          )}
        </DashboardCard>

        {/* 4. Performance */}
        <CompositionCard
          title="Top Advisors"
          as="h2"
          controls={
            <Tabs<PerformanceTab>
              aria-label="Performance"
              variant="underline"
              inset={false}
              tabs={[
                { key: "applications", label: "Applications" },
                { key: "enrolled", label: "Enrolled students" },
              ]}
              active={perf}
              onChange={setPerf}
            />
          }
          bodyClassName="ub-fade-up"
          unit={perf === "applications" ? "applications" : "enrolled students"}
          centerLabel={perf === "applications" ? "Applications by Advisor" : "Enrolled students by Advisor"}
          items={perfItems}
          layout="ranked"
          top={10}
          restLabel={(n) => `Other Advisors (${n})`}
          state={state}
          onRetry={retry}
          emptyMessage={perf === "applications" ? "No applications yet." : "No students have reached enrolment yet."}
        />
      </div>

      {/* 5. Follow-up */}
      <DashboardCard
        title="Advisors to follow up"
        subtitle="Suspended, no applications yet, or no sign-in for 60 days. Advisors awaiting review are on Home."
        as="h2"
        state={state === "ready" && !follow.length ? "empty" : state}
        emptyMessage="Every verified Advisor is active, applying and signing in."
        onRetry={retry}
        skeleton="list"
        footer={
          follow.length > 0 && (
            <ListFooter shown={shownFollow.length} total={follow.length} label="Advisors to follow up" expanded={showAll} onToggle={() => setShowAll((v) => !v)} />
          )
        }
      >
        <PeopleList label="Advisors to follow up" count={shownFollow.length}>
          {shownFollow.map(({ advisor, reason, days }) => (
            <PeopleListItem
              key={advisor.id}
              name={advisor.name}
              work={[TYPE_LABEL[advisor.type] ?? advisor.type, advisor.country].filter(Boolean).join(" · ")}
              status={reason}
              statusLabel={reason}
              statusTone={FOLLOW_UP_TONE[reason]}
              waitingDays={days}
              href={`${BASE}/${encodeURIComponent(advisor.id)}`}
              hrefLabel="Open Advisor"
            />
          ))}
        </PeopleList>
      </DashboardCard>
    </div>
  );
}
