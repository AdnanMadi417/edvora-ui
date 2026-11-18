"use client";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import CardLinkButton from "components/ub/dashboard/cards/CardLinkButton";
import RadialStatsCard from "components/ub/dashboard/cards/RadialStatsCard";
import type { OverviewResource } from "../model/types";

/**
 * How many advisors there are and how they split (active / suspended,
 * company / individual) as rings. Each row opens the Advisors list filtered
 * to that group. Counts come with the "awaiting review" request, so no extra call.
 */
export default function AdvisorRingsCard({ resource, href, onRetry }: { resource?: OverviewResource; href: string; onRetry: () => void }) {
  const stats = resource?.data?.advisorStats;
  const total = stats ? stats.active + stats.inactive : 0;
  const state = resource?.state === "ready" ? (stats ? (total ? "ready" : "empty") : "error") : resource?.state ?? "loading";
  return (
    <DashboardCard
      title="Advisors"
      subtitle="All advisors, by status and type."
      as="h2"
      className="h-full"
      state={state}
      skeleton="chart"
      emptyMessage="No advisors yet."
      errorMessage={resource?.error ?? "Advisor counts aren't available."}
      onRetry={onRetry}
      actions={<CardLinkButton href={href} label="Open advisors" />}
    >
      {stats && (
        <RadialStatsCard
          framed={false}
          total={total}
          totalLabel="advisors"
          getHref={(item) => `${href}?status=${encodeURIComponent(item.id)}`}
          items={[
            { id: "active", label: "Active", value: stats.active },
            { id: "inactive", label: "Suspended", value: stats.inactive },
            { id: "agency", label: "Company", value: stats.agency },
            { id: "individual", label: "Individual", value: stats.individual },
          ]}
        />
      )}
    </DashboardCard>
  );
}
