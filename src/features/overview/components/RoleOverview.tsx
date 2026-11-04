"use client";
import Link from "next/link";
import { buttonBase, buttonSizes, buttonVariants } from "components/ub/recipes";
import DashboardHeader from "components/ub/dashboard/shared/DashboardHeader";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import StatCard from "components/ub/dashboard/cards/StatCard";
import CardLinkButton from "components/ub/dashboard/cards/CardLinkButton";
import WidgetStatus from "components/ub/dashboard/shared/WidgetStatus";
import TaskList, { TaskListItem } from "components/ub/dashboard/lists/TaskList";
import QuickActions from "components/ub/dashboard/lists/QuickActions";
import { TextButton } from "components/ub/core/buttons/TextButton";
import AppDate from "components/ub/data/formatting/AppDate";
import { useRoleOverview } from "../hooks/useRoleOverview";
import {
  metricCaptions,
  metricIcons,
  metricLabels,
  overviewConfig,
} from "../model/overviewConfig";
import type { OverviewRole } from "../model/types";

export default function RoleOverview({ role }: { role: OverviewRole }) {
  const { context, plans, resources, refresh, waiting, denied, refreshing } =
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
  return (
    <div className="mx-auto w-full min-w-0 space-y-6 pb-8">
      <DashboardHeader
        title={config.title}
        subtitle={config.subtitle}
        secondaryActions={
          <TextButton onClick={refresh} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh overview"}
          </TextButton>
        }
        primaryAction={
          <Link
            className={`${buttonBase} ${buttonSizes.md} ${buttonVariants.primary}`}
            href={config.actions[0].href}
          >
            {config.actions[0].label}
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {config.metrics.map((id) => {
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
              variant="icon"
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
      <DashboardCard title="Quick actions" as="h2">
        <QuickActions actions={config.actions} />
      </DashboardCard>
      <div className="grid items-start gap-4 xl:grid-cols-2">
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
            >
              <TaskList count={items.length} label={plan.title}>
                {items.map((item) => (
                  <TaskListItem
                    key={item.id}
                    title={
                      <TextButton
                        href={item.href}
                        className="max-w-full text-left"
                      >
                        <span className="whitespace-normal break-words">
                          {item.title}
                        </span>
                      </TextButton>
                    }
                    meta={
                      <span className="block whitespace-normal break-words">
                        {item.description}
                        {item.at && Number.isFinite(Date.parse(item.at)) && (
                          <span className="mt-1 block">
                            <AppDate value={item.at} />
                          </span>
                        )}
                      </span>
                    }
                  />
                ))}
              </TaskList>
            </DashboardCard>
          );
        })}
      </div>
    </div>
  );
}
