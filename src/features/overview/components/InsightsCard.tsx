"use client";

import { useEffect, useId, useRef, useState } from "react";
import CompositionCard from "components/ub/dashboard/cards/CompositionCard";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import RankedBars from "components/ub/dashboard/charts/RankedBars";
import CategoryColumnChart from "components/ub/dashboard/charts/CategoryColumnChart";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import { CalendarDays, Globe2, GraduationCap, Layers, Users } from "lucide-react";
import type { OverviewResource, OverviewRole } from "../model/types";

type InsightTab = "stage" | "level" | "trend" | "countries" | "advisors";
type Period = "daily" | "weekly" | "monthly";

const PERIODS: { key: Period; label: string; range: string }[] = [
  { key: "daily", label: "Daily", range: "last 14 days" },
  { key: "weekly", label: "Weekly", range: "last 12 weeks" },
  { key: "monthly", label: "Monthly", range: "last 12 months" },
];

// One quiet line under the tabs saying what the numbers count.
const CAPTIONS: Record<InsightTab, string> = {
  level: "Active applications by the program's study level.",
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
  const common = { title: "Insights", controls, onRetry, as: "h2" as const };
  const panel = (node: React.ReactNode) => <div {...tabPanelProps(id, tab)}>{node}</div>;

  if (tab === "level") {
    const res = resources.studyLevels;
    return panel(
      <CompositionCard
        {...common}
        unit="applications"
        centerLabel="With a study level"
        items={res?.data?.studyLevels?.levels ?? []}
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
    if (res?.state === "ready" && res.data?.unavailable) return panel(<DashboardCard {...common} state="empty" emptyMessage={NOT_YET.trend} />);
    const series = res?.data?.overTime?.[period] ?? [];
    const current = PERIODS.find((p) => p.key === period)!;
    return panel(
      <DashboardCard {...common} state={res?.state ?? "loading"} errorMessage={res?.error} skeleton="chart">
        <div className="mb-4 flex justify-end">
          <Tabs<Period> aria-label="Period" variant="segmented" size="sm" tabs={PERIODS} active={period} onChange={setPeriod} />
        </div>
        {series.some((b) => b.value) ? (
          <CategoryColumnChart
            data={series}
            unit="applications"
            label={`Active applications by date submitted, ${current.range}`}
            // The latest period that has applications, so the highlighted value is never a bare 0.
            highlightKey={[...series].reverse().find((b) => b.value > 0)?.key}
            compact={series.length > 12}
          />
        ) : (
          <p className="py-10 text-center text-ub-body-sm text-ub-text-secondary">No applications submitted in the {current.range}.</p>
        )}
      </DashboardCard>
    );
  }

  if (tab === "countries") {
    const res = resources.topCountries;
    if (res?.state === "ready" && res.data?.unavailable) return panel(<DashboardCard {...common} state="empty" emptyMessage={NOT_YET.countries} />);
    const countries = res?.data?.byCountry ?? [];
    return panel(
      <DashboardCard
        {...common}
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
        state={res?.state === "ready" && !items.length ? "empty" : res?.state ?? "loading"}
        errorMessage={res?.error}
        emptyMessage="No active applications yet."
        skeleton="list"
      >
        <RankedBars items={items} unit="applications" label="Top Advisors" top={10} restLabel={(n) => `Other Advisors (${n})`} />
      </DashboardCard>
    );
  }

  return panel(<DashboardCard {...common} state="empty" emptyMessage={NOT_YET[tab]} />);
}
