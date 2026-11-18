"use client";
import { useState } from "react";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import { TextButton } from "components/ub/core/buttons/TextButton";
import DashboardHeader from "components/ub/dashboard/shared/DashboardHeader";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import StatTile from "components/ub/dashboard/cards/StatTile";
import QuickActions from "components/ub/dashboard/lists/QuickActions";
import WidgetStatus from "components/ub/dashboard/shared/WidgetStatus";
import Alert from "components/ub/feedback/notifications/Alert";
import StickyActionBar from "components/ub/navigation/controls/StickyActionBar";
import OverviewVisual from "./OverviewVisual";
import OverviewItems from "./OverviewItems";
import CommissionStatusChart from "./CommissionStatusChart";
import AdvisorBreakdownCard from "./AdvisorBreakdownCard";
import { useRoleOverview } from "../hooks/useRoleOverview";
import { metricCaptions, metricIcons, metricLabels, overviewConfig } from "../model/overviewConfig";
import type { OverviewResource, OverviewRole } from "../model/types";

// Lists with nothing in them go away (the KPI above still says 0).
const HIDE_PANEL_WHEN_ZERO = new Set(["hold", "hiddenPrograms", "catalogueQuality", "commission"]);
// Lists the API can't filter: Home already holds every item, so they expand in place.
const EXPAND_IN_PLACE = new Set(["actionRequired", "catalogueQuality"]);
const ROWS = 3;
const KPI_COLS = ["", "lg:grid-cols-1", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-4"];

/**
 * Every role's home, one layout: header → banner → KPIs → main task list →
 * other lists → 1–2 charts → quick actions → activity. Desktop: KPIs across
 * the top, then work (2/3) beside context (1/3). Phones: one column, KPIs
 * 2×2 and the primary action in a sticky bar.
 */
export default function RoleOverview({ role }: { role: OverviewRole }) {
  const { context, plans, resources: loaded, refresh, waiting, denied } = useRoleOverview(role);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Suspended advisors come with the awaiting-review response, so no extra call.
  const reviewStats = loaded.reviews?.data?.advisorStats;
  const resources: Record<string, OverviewResource> = {
    ...loaded,
    suspended: {
      state: loaded.reviews?.state === "ready" && !reviewStats ? "error" : loaded.reviews?.state ?? "loading",
      data: reviewStats ? { total: reviewStats.inactive, items: [] } : undefined,
      error: loaded.reviews?.error,
    },
  };

  if (denied) return <WidgetStatus state="error" errorMessage="This overview is not available for your account." />;
  if (waiting) return <WidgetStatus state="loading" skeleton="list" />;

  const config = overviewConfig(context);
  const base = `/${role.replace(/_/g, "-")}`;
  const primary = config.actions[0];
  const today = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kuala_Lumpur" }).format(new Date());

  // Each KPI opens exactly the records it counts; the number matches that list.
  const metricHref = (id: string, fallback: string) =>
    ({
      actionRequired: "#panel-actionRequired",
      hold: `${base}/applications?lifecycle=hold`,
      reviews: `${base}/advisors?status=unverified`,
      suspended: `${base}/advisors?status=suspended`,
      registrations: `${base}/advisors?tab=pending-otps`,
      catalogueQuality: (resources.catalogueQuality?.data?.total ?? 0) > 0 ? "#panel-catalogueQuality" : fallback,
      hiddenPrograms: `${base}/knowledge-hub?is_hidden=true`,
    })[id] ?? fallback;
  const metricLabel = (id: string) =>
    id === "advisors" && role === "account_manager" ? "Your advisors" : id === "commission" && role === "partner" ? "Due to you" : metricLabels[id];

  const metrics = config.metrics.slice(0, 4);
  const kpis = metrics.map((id, index) => {
    const plan = plans.find((item) => item.id === (id === "suspended" ? "reviews" : id));
    if (!plan) return null;
    const resource = resources[id];
    return (
      <StatTile
        key={id}
        label={metricLabel(id)}
        value={resource?.data?.total.toLocaleString()}
        icon={metricIcons[id as keyof typeof metricIcons]}
        iconTone={id === "actionRequired" ? "warning" : id === "suspended" ? "danger" : id === "commission" ? "success" : "brand"}
        footer={metricCaptions[id] ? { text: metricCaptions[id] } : undefined}
        href={metricHref(id, plan.href)}
        linkLabel={`Open ${metricLabel(id).toLowerCase()}`}
        // An odd last tile takes the full row on phones instead of sitting alone.
        className={metrics.length % 2 === 1 && index === metrics.length - 1 ? "col-span-2 lg:col-span-1" : undefined}
        state={resource?.state === "error" ? "error" : resource?.state === "ready" ? "ready" : "loading"}
        errorMessage={resource?.error}
        onRetry={refresh}
      />
    );
  });

  const panel = (id: string) => {
    const plan = plans.find((item) => item.id === id);
    if (!plan) return null;
    const resource = resources[id];
    const total = resource?.data?.total ?? 0;
    if (HIDE_PANEL_WHEN_ZERO.has(id) && resource?.state === "ready" && total === 0) return null;
    const items = resource?.data?.items || [];
    const open = expanded[id];
    const shown = open ? items : items.slice(0, ROWS);
    const state = resource?.state === "ready" && !items.length ? "empty" : resource?.state || "loading";
    const viewAllHref = metricHref(id, plan.href).startsWith("#") ? plan.href : metricHref(id, plan.href);
    return (
      <div key={id} id={`panel-${id}`} className="min-w-0 scroll-mt-24">
        <DashboardCard
          title={plan.title}
          subtitle={plan.subtitle}
          as="h2"
          state={state}
          emptyMessage={plan.emptyMessage}
          errorMessage={resource?.error}
          onRetry={refresh}
          skeleton="list"
          footer={
            state === "ready" && items.length ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="ub-tabular text-ub-caption text-ub-text-tertiary">
                  Showing {shown.length} of {total.toLocaleString()}
                </p>
                {EXPAND_IN_PLACE.has(id) ? (
                  items.length > ROWS && (
                    <TextButton size="sm" className="[@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11" onClick={() => setExpanded((p) => ({ ...p, [id]: !p[id] }))}>
                      {open ? "Show fewer" : `Show all ${items.length}`}
                    </TextButton>
                  )
                ) : (
                  <TextButton size="sm" href={viewAllHref} aria-label={`View all: ${plan.title}`} className="[@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11">
                    View all
                  </TextButton>
                )}
              </div>
            ) : undefined
          }
        >
          <OverviewItems resourceId={id} title={plan.title} items={shown} />
        </DashboardCard>
      </div>
    );
  };

  // 1–2 charts per role, one dimension each.
  const showCommission = role === "admin" || (role === "partner" && context.canViewCommission);
  const charts = (
    <>
      <OverviewVisual role={role} plans={plans} resources={resources} onRetry={refresh} />
      {showCommission && (
        <CommissionStatusChart
          resource={resources.universityCommission}
          onRetry={refresh}
          audience={role === "partner" ? "advisor" : "staff"}
          href={role === "partner" ? "/partner/commission-tracker" : "/admin/finance-queue"}
        />
      )}
      {role === "reviewer" && <AdvisorBreakdownCard resource={resources.reviews} href={`${base}/advisors`} onRetry={refresh} />}
    </>
  );
  const quick = config.actions.slice(1).map(({ label, href, icon }) => ({ label, href, icon }));

  return (
    <div className="mx-auto flex w-full min-w-0 flex-col gap-5 pb-24 md:pb-8">
      <DashboardHeader
        title={config.title}
        subtitle={
          <>
            <span>{config.subtitle}</span>
            <span className="mt-1 block text-ub-caption text-ub-text-tertiary">{today}</span>
          </>
        }
        primaryAction={primary && <LinkBtn variant="primary" href={primary.href} label={primary.label} icon={null} className="hidden md:inline-flex" />}
      />
      {context.awaitingVerification && (
        <Alert tone="info" title="Your profile is awaiting review by Unibexs">
          You can explore programs now and start applications once your profile is verified.
        </Alert>
      )}
      <div className={`grid grid-cols-2 gap-3 ${KPI_COLS[metrics.length] ?? "lg:grid-cols-4"}`}>{kpis}</div>
      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-3">
        <section aria-label="Work" className="flex min-w-0 flex-col gap-5 lg:col-span-2">
          {config.panels.map(panel)}
        </section>
        <aside aria-label="Context" className="flex min-w-0 flex-col gap-5">
          {charts}
          {quick.length > 0 && (
            <DashboardCard title="Quick actions" as="h2">
              <QuickActions actions={quick} />
            </DashboardCard>
          )}
          {panel("updates")}
        </aside>
      </div>
      {primary && (
        <StickyActionBar aria-label="Primary action">
          <LinkBtn variant="primary" href={primary.href} label={primary.label} icon={null} className="w-full justify-center" />
        </StickyActionBar>
      )}
    </div>
  );
}
