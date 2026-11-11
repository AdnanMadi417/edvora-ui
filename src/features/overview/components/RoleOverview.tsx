"use client";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import DashboardHeader from "components/ub/dashboard/shared/DashboardHeader";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import StatCard from "components/ub/dashboard/cards/StatCard";
import CardLinkButton from "components/ub/dashboard/cards/CardLinkButton";
import WidgetStatus from "components/ub/dashboard/shared/WidgetStatus";
import OverviewVisual from "./OverviewVisual";
import OverviewItems from "./OverviewItems";
import { useRoleOverview } from "../hooks/useRoleOverview";
import {
  metricCaptions,
  metricIcons,
  metricLabels,
  overviewConfig,
} from "../model/overviewConfig";
import type { OverviewRole } from "../model/types";

// Exceptions: these cards only matter when something is there, so a zero hides them.
const HIDE_WHEN_ZERO = new Set(["hold", "hiddenPrograms", "unread"]);
const GRID_COLS = ["", "xl:grid-cols-1", "xl:grid-cols-2", "xl:grid-cols-3", "xl:grid-cols-4"];

export default function RoleOverview({ role }: { role: OverviewRole }) {
  // The overview refreshes by itself (see useRoleOverview), so there's no refresh button.
  const { context, plans, resources, refresh, waiting, denied } =
    useRoleOverview(role);
  if (denied)
    return (
      <WidgetStatus
        state="error"
        errorMessage="This overview is not available for your account."
      />
    );
  if (waiting) return <WidgetStatus state="loading" skeleton="list" />;
  const config = overviewConfig(context);
  const metrics = config.metrics.filter((id) => {
    const resource = resources[id];
    return !(HIDE_WHEN_ZERO.has(id) && resource?.state === "ready" && resource.data?.total === 0);
  });
  // Data entry's only chart would repeat the visible/hidden cards, so it has none.
  const hasChart = role !== "data_entry";
  return (
    // Phones lead with the work (queue, lists, activity), then totals, then the
    // chart; from 768px the sections keep their reading order.
    <div className="mx-auto flex w-full min-w-0 flex-col gap-6 pb-8">
      <DashboardHeader hideTitle
        title={config.title}
        subtitle={config.subtitle}
        primaryAction={
          <LinkBtn
            variant="primary"
            href={config.actions[0].href}
            label={config.actions[0].label}
            icon={null}
          />
        }
      />
      <div className={`order-2 grid gap-4 md:order-none ${metrics.length > 1 ? "sm:grid-cols-2" : ""} ${GRID_COLS[metrics.length] ?? "xl:grid-cols-4"}`}>
        {metrics.map((id, index) => {
          const plan = plans.find((item) => item.id === id);
          const resource = resources[id];
          if (!plan) return null;
          return (
            <StatCard
              key={id}
              label={
                id === "advisors" && role === "account_manager"
                  ? "Your advisors"
                  : metricLabels[id]
              }
              value={resource?.data?.total.toLocaleString()}
              caption={metricCaptions[id]}
              variant={index === 0 ? "highlighted" : "icon"}
              icon={metricIcons[id]}
              state={resource?.state ?? "loading"}
              errorMessage={resource?.error}
              onRetry={refresh}
              action={
                <CardLinkButton href={plan.href} label={`Open ${plan.title}`} />
              }
            />
          );
        })}
      </div>
      {hasChart && (
        <div className="order-3 min-w-0 md:order-none">
          <OverviewVisual
            role={role}
            plans={plans}
            resources={resources}
            onRetry={refresh}
          />
        </div>
      )}
      <div className="order-1 grid items-start gap-4 md:order-none xl:grid-cols-3">
        {[...config.panels, "updates"].map((id) => {
          const plan = plans.find((item) => item.id === id);
          if (!plan) return null;
          const resource = resources[id];
          const items = resource?.data?.items ?? [];
          const state =
            resource?.state === "ready" && !items.length
              ? "empty"
              : resource?.state ?? "loading";
          return (
            <DashboardCard
              key={id}
              className={
                id === config.panels[0]
                  ? "xl:col-span-2"
                  : id === "updates"
                  ? "xl:col-span-2"
                  : undefined
              }
              title={plan.title}
              subtitle={plan.subtitle}
              as="h2"
              state={state}
              emptyMessage={plan.emptyMessage}
              errorMessage={resource?.error}
              onRetry={refresh}
              skeleton="list"
              // Only say there's more when there is. The work queue's total
              // counts applications, not tasks, so it never gets this line.
              footer={
                id !== "active" &&
                resource?.data &&
                state === "ready" &&
                resource.data.total > items.length ? (
                  <p className="text-ub-caption text-ub-text-tertiary">
                    Showing {items.length} of {resource.data.total.toLocaleString()}
                  </p>
                ) : undefined
              }
              actions={
                <CardLinkButton
                  href={plan.href}
                  label={`View all: ${plan.title}`}
                />
              }
            >
              <OverviewItems resourceId={id} title={plan.title} items={items} />
            </DashboardCard>
          );
        })}
      </div>
    </div>
  );
}
