"use client";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import CardLinkButton from "components/ub/dashboard/cards/CardLinkButton";
import SegmentedBars from "components/ub/dashboard/lists/SegmentedBars";
import type { OverviewResource } from "../model/types";

/**
 * All advisors split three ways, one row each: verification, account status
 * and type. Each value opens Advisors filtered to it. Counts come with the
 * "awaiting review" request, so no extra call.
 */
export default function AdvisorBreakdownCard({ resource, href, onRetry }: { resource?: OverviewResource; href: string; onRetry: () => void }) {
  const stats = resource?.data?.advisorStats;
  const total = stats ? stats.active + stats.inactive : 0;
  const state = resource?.state === "ready" ? (stats ? (total ? "ready" : "empty") : "error") : resource?.state ?? "loading";
  const to = (status: string) => `${href}?status=${status}`;
  return (
    <DashboardCard
      title="Advisors"
      subtitle={stats ? `${total.toLocaleString()} advisors, by verification, account status and type.` : "By verification, account status and type."}
      as="h2"
      className="h-full"
      state={state}
      skeleton="lines"
      emptyMessage="No advisors yet."
      errorMessage={resource?.error ?? "Advisor counts aren't available."}
      onRetry={onRetry}
      actions={<CardLinkButton href={href} label="Open advisors" />}
    >
      {stats && (
        <SegmentedBars
          unit="advisors"
          rows={[
            {
              label: "Verification",
              parts: [
                { id: "verified", label: "Verified", value: stats.verified, tone: "success" },
                { id: "unverified", label: "Awaiting review", value: stats.unverified, tone: "warning", href: to("unverified") },
              ],
            },
            {
              label: "Account",
              parts: [
                { id: "active", label: "Active", value: stats.active, tone: "success", href: to("active") },
                { id: "suspended", label: "Suspended", value: stats.inactive, tone: "danger", href: to("suspended") },
              ],
            },
            {
              label: "Type",
              parts: [
                { id: "company", label: "Company", value: stats.agency, tone: "cat-1", href: to("company") },
                { id: "individual", label: "Individual", value: stats.individual, tone: "cat-2", href: to("individual") },
              ],
            },
          ]}
        />
      )}
    </DashboardCard>
  );
}
