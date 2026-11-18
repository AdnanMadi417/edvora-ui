"use client";
import { useState } from "react";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import DashboardHeader from "components/ub/dashboard/shared/DashboardHeader";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import StatTile from "components/ub/dashboard/cards/StatTile";
import CardLinkButton from "components/ub/dashboard/cards/CardLinkButton";
import WidgetStatus from "components/ub/dashboard/shared/WidgetStatus";
import Alert from "components/ub/feedback/notifications/Alert";
import OverviewVisual from "./OverviewVisual";
import OverviewItems from "./OverviewItems";
import CommissionStatusChart from "./CommissionStatusChart";
import AdvisorBreakdownCard from "./AdvisorBreakdownCard";
import { useRoleOverview } from "../hooks/useRoleOverview";
import {
  metricCaptions,
  metricIcons,
  metricLabels,
  overviewConfig,
} from "../model/overviewConfig";
import type { OverviewResource, OverviewRole } from "../model/types";
const HIDE_WHEN_ZERO = new Set(["hold", "hiddenPrograms", "unread"]);
// Lists with nothing in them go away; their tile still says 0.
const HIDE_PANEL_WHEN_ZERO = new Set(["catalogueQuality"]);
const GRID_COLS = [
  "",
  "xl:grid-cols-1",
  "xl:grid-cols-2",
  "xl:grid-cols-3",
  "xl:grid-cols-4",
];
export default function RoleOverview({ role }: { role: OverviewRole }) {
  const {
    context,
    plans,
    resources: loadedResources,
    refresh,
    waiting,
    denied,
  } = useRoleOverview(role);
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>(
    {}
  );
  const pipeline = loadedResources.pipeline;
  const offerStage = pipeline?.data?.distribution?.find(
    (stage) => stage.stageId === "offer-received"
  );
  const resources: Record<string, OverviewResource> = {
    ...loadedResources,
    offers: {
      state: pipeline?.state || "loading",
      data:
        pipeline?.state === "ready"
          ? { total: offerStage?.value || 0, items: [] }
          : undefined,
      error: pipeline?.error,
    },
  };

  if (denied)
    return (
      <WidgetStatus
        state="error"
        errorMessage="This overview is not available for your account."
      />
    );
  if (waiting) return <WidgetStatus state="loading" skeleton="list" />;
  const config = overviewConfig(context);
  const visible = (id: string) =>
    !(
      HIDE_WHEN_ZERO.has(id) &&
      resources[id]?.state === "ready" &&
      resources[id].data?.total === 0
    );
  const metrics = config.metrics
    .filter(
      (id) =>
        visible(id) &&
        !(id === "offers" && pipeline?.state === "ready" && !offerStage)
    )
    .slice(0, 4);
  const panel = (id: string) => {
    const plan = plans.find((item) => item.id === id);
    if (!plan || !visible(id)) return null;
    if (HIDE_PANEL_WHEN_ZERO.has(id) && resources[id]?.state === "ready" && resources[id].data?.total === 0) return null;
    const resource = resources[id],
      items = resource?.data?.items || [];
    const displayedItems = expandedPanels[id] ? items : items.slice(0, 3);
    const state =
      resource?.state === "ready" && !items.length
        ? "empty"
        : resource?.state || "loading";
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
          actions={
            <CardLinkButton
              href={plan.href}
              label={`View all: ${plan.title}`}
            />
          }
          footer={
            state === "ready" && items.length
              ? // No "Showing x of y": the count is the KPI above.
                items.length > 3 && (
                  <div className="flex justify-end">
                    {
                      <button
                        type="button"
                        className="min-h-11 text-ub-label-sm text-ub-text-link hover:underline"
                        onClick={() =>
                          setExpandedPanels((previous) => ({
                            ...previous,
                            [id]: !previous[id],
                          }))
                        }
                      >
                        {expandedPanels[id] ? "Show fewer" : "Show more"}
                      </button>
                    }
                  </div>
                )
              : undefined
          }
        >
          <OverviewItems
            resourceId={id}
            title={plan.title}
            items={displayedItems}
          />
        </DashboardCard>
      </div>
    );
  };
  const secondary = config.panels.slice(1).filter(visible);

  const canSeeUniversityCommission =
    role === "admin" || (role === "partner" && context.canViewCommission);
  const today = new Intl.DateTimeFormat("en-MY", {
    dateStyle: "full",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date());
  // Each tile opens exactly the records it counts.
  const metricHref = (id: string, fallback: string) =>
    id === "actionRequired"
      ? "#panel-actionRequired"
      : id === "hold"
      ? `/${role.replace(/_/g, "-")}/applications?lifecycle=hold`
      : id === "reviews"
      ? `/${role.replace(/_/g, "-")}/advisors?status=unverified`
      : id === "catalogueQuality" && (resources.catalogueQuality?.data?.total ?? 0) > 0
      ? "#panel-catalogueQuality"
      : fallback;
  const metricCards = metrics.map((id, index) => {
    const plan = plans.find(
      (item) => item.id === (id === "offers" ? "pipeline" : id)
    );
    const resource = resources[id];
    if (!plan) return null;
    return (
      <StatTile
        key={id}
        label={
          id === "advisors" && role === "account_manager"
            ? "Your advisors"
            : metricLabels[id]
        }
        value={resource?.data?.total.toLocaleString()}
        icon={metricIcons[id as keyof typeof metricIcons]}
        iconTone={
          id === "actionRequired"
            ? "warning"
            : id === "commission"
            ? "success"
            : "brand"
        }
        // No history from the API yet, so no change pill: the caption says what the number counts.
        footer={metricCaptions[id] ? { text: metricCaptions[id] } : undefined}
        href={metricHref(id, plan.href)}
        linkLabel={`Open ${plan.title}`}
        // An odd last tile takes the full row on phones instead of sitting alone.
        className={
          metrics.length % 2 === 1 && index === metrics.length - 1
            ? "col-span-2 xl:col-span-1"
            : undefined
        }
        state={
          resource?.state === "error"
            ? "error"
            : resource?.state === "ready"
            ? "ready"
            : "loading"
        }
        errorMessage={resource?.error}
        onRetry={refresh}
      />
    );
  });
  return (
    <div className="mx-auto flex w-full min-w-0 flex-col gap-5 pb-8">
      <DashboardHeader
        title={config.title}
        subtitle={
          <>
            <span>{config.subtitle}</span>
            <span className="mt-1 block text-ub-caption text-ub-text-tertiary">
              {today}
            </span>
          </>
        }
        primaryAction={
          config.actions[0] && (
            <LinkBtn
              variant="primary"
              href={config.actions[0].href}
              label={config.actions[0].label}
              icon={null}
            />
          )
        }
      />
      {context.awaitingVerification && (
        <Alert tone="info" title="Your profile is awaiting review by Unibexs">
          You can explore programs now and start applications once your profile is verified.
        </Alert>
      )}
      <div
        className={`grid gap-3 ${metrics.length > 1 ? "grid-cols-2" : ""} ${
          GRID_COLS[metrics.length] || "xl:grid-cols-4"
        }`}
      >
        {metricCards}
      </div>
      <div className="grid min-w-0 items-start gap-5 min-[1600px]:grid-cols-[minmax(0,1fr)_300px]">
        <section
          aria-label="Dashboard reports and tasks"
          className="flex min-w-0 flex-col gap-5"
        >
          <div
            className={`order-2 grid min-w-0 items-stretch gap-4 md:order-1 ${
              // Two columns only with two or more cards (the reviewer has no pipeline card).
              Number(role !== "reviewer") +
                Number(canSeeUniversityCommission) +
                Number(role === "admin" || role === "reviewer") >
              1
                ? "lg:grid-cols-2"
                : ""
            }`}
          >
            <OverviewVisual
              role={role}
              plans={plans}
              resources={resources}
              onRetry={refresh}
            />
            {canSeeUniversityCommission && (
              <CommissionStatusChart
                resource={resources.universityCommission}
                onRetry={refresh}
                audience={role === "partner" ? "advisor" : "staff"}
                href={
                  role === "partner"
                    ? "/partner/commission-tracker"
                    : "/admin/finance-queue"
                }
              />
            )}
            {(role === "admin" || role === "reviewer") && (
              <AdvisorBreakdownCard
                resource={resources.reviews}
                href={`/${role}/advisors`}
                onRetry={refresh}
              />
            )}
          </div>
          <div className="order-1 min-w-0 md:order-2">
            {panel(config.panels[0])}
          </div>
          {!!secondary.length && (
            <div className="order-4 grid min-w-0 items-start gap-4 lg:grid-cols-2">
              {secondary.map(panel)}
            </div>
          )}
        </section>
        <aside
          aria-label="Recent activity"
          className="grid min-w-0 items-start gap-4"
        >
          {panel("updates")}
        </aside>
      </div>
    </div>
  );
}
