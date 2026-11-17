"use client";
import { useState } from "react";
import Link from "next/link";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import DashboardHeader from "components/ub/dashboard/shared/DashboardHeader";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import StatCard from "components/ub/dashboard/cards/StatCard";
import CardLinkButton from "components/ub/dashboard/cards/CardLinkButton";
import WidgetStatus from "components/ub/dashboard/shared/WidgetStatus";
import { focusRing } from "components/ub/recipes";
import OverviewVisual from "./OverviewVisual";
import OverviewItems from "./OverviewItems";
import CommissionStatusChart from "./CommissionStatusChart";
import { useRoleOverview } from "../hooks/useRoleOverview";
import { metricLabels, overviewConfig } from "../model/overviewConfig";
import type { OverviewResource, OverviewRole } from "../model/types";
const HIDE_WHEN_ZERO = new Set(["hold", "hiddenPrograms", "unread"]);
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
    const resource = resources[id],
      items = resource?.data?.items || [];
    const displayedItems = expandedPanels[id] ? items : items.slice(0, 3);
    const state =
      resource?.state === "ready" && !items.length
        ? "empty"
        : resource?.state || "loading";
    return (
      <DashboardCard
        key={id}
        title={plan.title}
        subtitle={plan.subtitle}
        as="h2"
        state={state}
        emptyMessage={plan.emptyMessage}
        errorMessage={resource?.error}
        onRetry={refresh}
        skeleton="list"
        actions={
          <CardLinkButton href={plan.href} label={`View all: ${plan.title}`} />
        }
        footer={
          state === "ready" && items.length ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-ub-caption text-ub-text-tertiary">
                Showing {displayedItems.length} of{" "}
                {resource?.data?.total.toLocaleString()}
              </p>
              {items.length > 3 && (
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
              )}
            </div>
          ) : undefined
        }
      >
        <OverviewItems
          resourceId={id}
          title={plan.title}
          items={displayedItems}
        />
      </DashboardCard>
    );
  };
  const secondary = config.panels.slice(1).filter(visible);
  const shortcuts = config.actions.slice(1);
  if (context.agencyAdmin)
    shortcuts.sort(
      (a, b) =>
        Number(b.href.endsWith("/team-members")) -
        Number(a.href.endsWith("/team-members"))
    );

  const canSeeUniversityCommission =
    role === "admin" || (role === "partner" && context.canViewCommission);
  const today = new Intl.DateTimeFormat("en-MY", {
    dateStyle: "full",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date());
  const metricCards = metrics.map((id) => {
    const plan = plans.find(
      (item) => item.id === (id === "offers" ? "pipeline" : id)
    );
    const resource = resources[id];
    if (!plan) return null;
    return (
      <StatCard
        key={id}
        className="relative !gap-2 !pe-14 md:!pe-16 [&_.text-ub-data-lg]:text-2xl md:[&_.text-ub-data-lg]:text-3xl"
        label={
          id === "advisors" && role === "account_manager"
            ? "Your advisors"
            : metricLabels[id]
        }
        value={resource?.data?.total.toLocaleString()}
        variant="default"
        state={resource?.state || "loading"}
        errorMessage={resource?.error}
        onRetry={refresh}
        action={
          <CardLinkButton
            href={plan.href}
            label={`Open ${plan.title}`}
            className="absolute end-3 top-1/2 -translate-y-1/2 !rounded-ub-md !border-0 !bg-ub-tone-brand-bg !text-ub-tone-brand-text md:end-4"
          />
        }
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
              canSeeUniversityCommission ? "lg:grid-cols-2" : ""
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
          aria-label="Dashboard activity and shortcuts"
          className="grid min-w-0 items-start gap-4 lg:grid-cols-2 min-[1600px]:grid-cols-1"
        >
          <DashboardCard title="Shortcuts" as="h2">
            <nav
              aria-label="Dashboard shortcuts"
              className="flex flex-col divide-y divide-ub-border"
            >
              {shortcuts.slice(0, 3).map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex min-w-0 items-start gap-3 rounded-ub-sm py-3 first:pt-0 last:pb-0 hover:text-ub-text-link ${focusRing}`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-ub-md bg-ub-tone-brand-bg">
                    <action.icon
                      aria-hidden="true"
                      className="h-4 w-4 text-ub-tone-brand-text"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-ub-label-md text-ub-text-primary">
                      {action.label}
                    </span>
                    <span className="mt-1 block text-ub-caption text-ub-text-secondary">
                      {action.description}
                    </span>
                  </span>
                </Link>
              ))}
            </nav>
          </DashboardCard>
          {panel("updates")}
        </aside>
      </div>
    </div>
  );
}
