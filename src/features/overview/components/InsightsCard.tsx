"use client";

import { useEffect, useId, useRef, useState } from "react";
import CompositionCard from "components/ub/dashboard/cards/CompositionCard";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import RankedBars from "components/ub/dashboard/charts/RankedBars";
import CategoryColumnChart from "components/ub/dashboard/charts/CategoryColumnChart";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import type { OverviewResource, OverviewRole } from "../model/types";

type InsightTab = "level" | "stage" | "monthly" | "countries" | "advisors";

const SUBTITLES: Record<InsightTab, string> = {
  level: "Active applications by the program's study level.",
  stage: "Active applications by their current stage, in workflow order.",
  monthly: "Active applications by the month they were submitted, last 12 months.",
  countries: "Where active applicants come from.",
  advisors: "Advisors with the most active applications.",
};

// Shown when the API doesn't send the field a chart needs (the mock API does, for testing).
const NOT_YET: Partial<Record<InsightTab, string>> = {
  monthly: "This chart needs the date each application was submitted, which the applications list doesn't include yet.",
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
  const tabs: { key: InsightTab; label: string }[] = [
    { key: "level", label: "Study level" },
    { key: "stage", label: "Stage" },
    { key: "monthly", label: "Monthly" },
    { key: "countries", label: "Top countries" },
    ...(role === "partner" ? [] : [{ key: "advisors" as const, label: "Top Advisors" }]),
  ];
  const [tab, setTab] = useState<InsightTab>("level");
  // Each view is its own card, so the tab bar re-renders: keep focus on the chosen tab.
  const switched = useRef(false);
  useEffect(() => {
    if (switched.current) document.getElementById(`${id}-tab-${tab}`)?.focus();
  }, [id, tab]);
  const choose = (next: InsightTab) => {
    switched.current = true;
    setTab(next);
  };
  const controls = (
    <Tabs<InsightTab> aria-label="Insights" idPrefix={id} variant="segmented" size="sm" tabs={tabs} active={tab} onChange={choose} />
  );
  const common = { title: "Insights", subtitle: SUBTITLES[tab], controls, onRetry, as: "h2" as const };
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

  if (tab === "monthly") {
    const res = resources.monthly;
    if (res?.state === "ready" && res.data?.unavailable) return panel(<DashboardCard {...common} state="empty" emptyMessage={NOT_YET.monthly} />);
    const months = res?.data?.byMonth ?? [];
    return panel(
      <DashboardCard
        {...common}
        state={res?.state === "ready" && !months.some((m) => m.value) ? "empty" : res?.state ?? "loading"}
        errorMessage={res?.error}
        emptyMessage="No applications submitted in the last 12 months."
        skeleton="chart"
      >
        <CategoryColumnChart data={months} unit="applications" label="Active applications by month submitted, last 12 months" highlightKey={months[months.length - 1]?.key} />
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
