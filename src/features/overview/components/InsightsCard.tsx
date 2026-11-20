"use client";

import { useEffect, useId, useRef, useState } from "react";
import CompositionCard from "components/ub/dashboard/cards/CompositionCard";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import RankedBars from "components/ub/dashboard/charts/RankedBars";
import AreaLineChart from "components/ub/dashboard/charts/AreaLineChart";
import DeltaPill from "components/ub/dashboard/shared/DeltaPill";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import { BookOpen, CalendarDays, Globe2, GraduationCap, Layers, Users } from "lucide-react";
import type { OverviewResource, OverviewRole } from "../model/types";

type InsightTab = "stage" | "level" | "field" | "trend" | "countries" | "advisors";
type Period = "daily" | "weekly" | "monthly";

const PERIODS: { key: Period; label: string; range: string; previous: string }[] = [
  { key: "daily", label: "Daily", range: "last 14 days", previous: "vs the day before" },
  { key: "weekly", label: "Weekly", range: "last 12 weeks", previous: "vs the week before" },
  { key: "monthly", label: "Monthly", range: "last 12 months", previous: "vs the month before" },
];

// One quiet line under the tabs saying what the numbers count.
const CAPTIONS: Record<InsightTab, string> = {
  level: "Active applications by the program's study level.",
  field: "Active applications by the program's field of study: the top five, then the rest.",
  stage: "Active applications by their current stage, in workflow order.",
  trend: "Active applications by the date they were submitted.",
  countries: "Where active applicants come from.",
  advisors: "Advisors with the most active applications.",
};

// Shown when the API doesn't send the field a chart needs (the mock API does, for testing).
const NOT_YET: Partial<Record<InsightTab, string>> = {
  trend: "This chart needs the date each application was submitted, which the applications list doesn't include yet.",
  countries: "This chart needs each student's country, which the applications list doesn't include yet.",
};

/**
 * One full-width card on the home: different views of the active
 * applications, one tab each (study level, stage, month, country, Advisor).
 * Staff see Top Advisors; Advisors don't. The stage tab replaces the
 * separate pipeline card, so stages show once.
 */
export default function InsightsCard({
  role,
  base,
  resources,
  onRetry,
}: {
  role: OverviewRole;
  /** Role path, e.g. "/admin", for stage and Advisor links. */
  base: string;
  resources: Record<string, OverviewResource>;
  onRetry: () => void;
}) {
  const id = useId();
  const tabs = [
    { key: "stage" as const, label: "Stage", icon: Layers },
    { key: "level" as const, label: "Study level", icon: GraduationCap },
    { key: "field" as const, label: "Field of study", icon: BookOpen },
    { key: "trend" as const, label: "Over time", icon: CalendarDays },
    { key: "countries" as const, label: "Top countries", icon: Globe2 },
    ...(role === "partner" ? [] : [{ key: "advisors" as const, label: "Top Advisors", icon: Users }]),
  ];
  const [tab, setTab] = useState<InsightTab>("stage");
  const [period, setPeriod] = useState<Period>("monthly");
  // Each view is its own card, so the tab bar re-renders: keep focus on the chosen tab.
  const switched = useRef(false);
  useEffect(() => {
    if (switched.current) document.getElementById(`${id}-tab-${tab}`)?.focus();
  }, [id, tab]);
  const choose = (next: InsightTab) => {
    switched.current = true;
    setTab(next);
  };
  // Title, then an underlined tab strip (as on the application page), then one caption line.
  const controls = (
    <>
      <Tabs<InsightTab> aria-label="Insights" idPrefix={id} variant="underline" inset={false} tabs={tabs} active={tab} onChange={choose} />
      <p className="mt-3 text-ub-caption text-ub-text-tertiary">{CAPTIONS[tab]}</p>
    </>
  );
  // Only the body settles in on a tab change; title and tabs stay still.
  const common = { title: "Insights", controls, onRetry, as: "h2" as const };
  const body = { className: "ub-fade-up" };
  const panel = (node: React.ReactNode) => <div {...tabPanelProps(id, tab)}>{node}</div>;

  if (tab === "level") {
    const res = resources.studyLevels;
    return panel(
      <CompositionCard
        {...common}
        bodyClassName={body.className}
        unit="applications"
        centerLabel="With a study level"
        items={res?.data?.studyLevels?.levels ?? []}
        state={res?.state ?? "loading"}
        errorMessage={res?.error}
        emptyMessage="No active applications yet."
      />
    );
  }

  if (tab === "field") {
    // Same data request as Study level: the program list gives both.
    const res = resources.studyLevels;
    return panel(
      <CompositionCard
        {...common}
        bodyClassName={body.className}
        // The same donut as Stage: the top five fields, then Others.
        top={5}
        restLabel={(n) => `Others (${n} ${n === 1 ? "field" : "fields"})`}
        unit="applications"
        centerLabel="With a field"
        items={res?.data?.byField ?? []}
        state={res?.state ?? "loading"}
        errorMessage={res?.error}
        emptyMessage="No active applications yet."
      />
    );
  }

  if (tab === "stage") {
    const res = resources.pipeline;
    return panel(
      <CompositionCard
        {...common}
        bodyClassName={body.className}
        unit="applications"
        centerLabel="Active applications"
        keepOrder
        items={(res?.data?.distribution ?? []).map((stage) => ({
          key: stage.key,
          label: stage.label,
          value: stage.value,
          href: `${base}/applications?stage=${encodeURIComponent(stage.key)}`,
        }))}
        state={res?.state ?? "loading"}
        errorMessage={res?.error}
        emptyMessage="No active applications yet."
      />
    );
  }

  if (tab === "trend") {
    const res = resources.overTime;
    if (res?.state === "ready" && res.data?.unavailable) return panel(<DashboardCard {...common} bodyProps={body} state="empty" emptyMessage={NOT_YET.trend} />);
    const series = res?.data?.overTime?.[period] ?? [];
    const current = PERIODS.find((p) => p.key === period)!;
    // Latest period vs the one before it; none when the one before was 0 (no meaningful %).
    const last = series[series.length - 1]?.value ?? 0;
    const before = series[series.length - 2]?.value ?? 0;
    const delta = before > 0 ? Math.round(((last - before) / before) * 1000) / 10 : null;
    return panel(
      <DashboardCard {...common} bodyProps={body} state={res?.state ?? "loading"} errorMessage={res?.error} skeleton="chart">
        {/* Period on the start, the change vs the period before on the end. */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Tabs<Period> aria-label="Period" variant="segmented" size="sm" tabs={PERIODS} active={period} onChange={setPeriod} />
          {delta !== null && <DeltaPill value={delta} comparedTo={current.previous} />}
        </div>
        {series.some((b) => b.value) ? (
          <AreaLineChart
            curve="linear"
            markers
            wholeNumbers
            points={series}
            label={`Active applications by date submitted, ${current.range}`}
            formatValue={(v) => `${v.toLocaleString()} ${v === 1 ? "application" : "applications"}`}
          />
        ) : (
          <p className="py-10 text-center text-ub-body-sm text-ub-text-secondary">No applications submitted in the {current.range}.</p>
        )}
      </DashboardCard>
    );
  }

  if (tab === "countries") {
    const res = resources.topCountries;
    if (res?.state === "ready" && res.data?.unavailable) return panel(<DashboardCard {...common} bodyProps={body} state="empty" emptyMessage={NOT_YET.countries} />);
    const countries = res?.data?.byCountry ?? [];
    return panel(
      <DashboardCard
        {...common}
        bodyProps={body}
        state={res?.state === "ready" && !countries.length ? "empty" : res?.state ?? "loading"}
        errorMessage={res?.error}
        emptyMessage="No active applications yet."
        skeleton="list"
      >
        <RankedBars items={countries} unit="applications" label="Top countries" top={10} restLabel={(n) => `Other countries (${n})`} />
      </DashboardCard>
    );
  }

  if (tab === "advisors") {
    const res = resources.topAdvisors;
    const items = (res?.data?.byAdvisor ?? []).map((advisor) => ({
      ...advisor,
      href: `${base}/advisors/${encodeURIComponent(advisor.key)}`,
    }));
    return panel(
      <DashboardCard
        {...common}
        bodyProps={body}
        state={res?.state === "ready" && !items.length ? "empty" : res?.state ?? "loading"}
        errorMessage={res?.error}
        emptyMessage="No active applications yet."
        skeleton="list"
      >
        <RankedBars items={items} unit="applications" label="Top Advisors" top={10} restLabel={(n) => `Other Advisors (${n})`} />
      </DashboardCard>
    );
  }

  return panel(<DashboardCard {...common} bodyProps={body} state="empty" emptyMessage={NOT_YET[tab]} />);
}
