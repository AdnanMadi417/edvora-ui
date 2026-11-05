"use client";
import type { WidgetState } from "components/ub/dashboard/types";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import Tabs from "components/ub/navigation/controls/Tabs";
import BarChartCard from "components/ub/dashboard/cards/BarChartCard";
import GaugeCard from "components/ub/dashboard/cards/GaugeCard";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import CardFooterStats from "components/ub/dashboard/cards/CardFooterStats";
import CardLinkButton from "components/ub/dashboard/cards/CardLinkButton";
import PipelineFlow from "components/ub/dashboard/pipeline/PipelineFlow";
import type {
  OverviewResource,
  OverviewRole,
  ResourcePlan,
} from "../model/types";

export default function OverviewVisual({
  role,
  resources,
  plans,
  onRetry,
}: {
  role: OverviewRole;
  resources: Record<string, OverviewResource>;
  plans: ResourcePlan[];
  onRetry: () => void;
}) {
  const [view, setView] = useState<"bars" | "pipeline">("bars");
  const menu = {
    label: "Chart options",
    extraItems: [{ label: "Refresh data", icon: RefreshCw, onClick: onRetry }],
  };
  const pipeline = plans.find((plan) => plan.id === "pipeline");
  if (pipeline) {
    const resource = resources.pipeline;
    const distribution = resource?.data?.distribution ?? [];
    const state =
      resource?.state === "ready" && !resource.data?.total
        ? "empty"
        : resource?.state ?? "loading";
    const viewSwitch = (
      <Tabs<"bars" | "pipeline">
        tabs={[
          { key: "bars" as const, label: "Bars" },
          { key: "pipeline" as const, label: "Pipeline" },
        ]}
        active={view}
        onChange={setView}
        variant="segmented"
        size="sm"
        aria-label="Application chart view"
      />
    );
    if (view === "bars")
      return (
        <div className="space-y-3">
          {viewSwitch}
          <BarChartCard
            title="Applications by stage"
            subtitle={pipeline.subtitle}
            as="h2"
            state={state}
            emptyMessage={pipeline.emptyMessage}
            errorMessage={resource?.error}
            onRetry={onRetry}
            data={distribution.map((stage) => ({
              label: stage.label,
              value: stage.value,
            }))}
            label="Active applications by stage"
            unit="applications"
            highlightIndex={
              distribution.length
                ? distribution.reduce(
                    (best, stage, index) =>
                      stage.value > distribution[best].value ? index : best,
                    0
                  )
                : undefined
            }
            stats={[
              {
                label: "Active applications",
                value: resource?.data?.total.toLocaleString() ?? "—",
              },
              { label: "Stages", value: distribution.length },
            ]}
            menu={menu}
            actions={
              <>
                <span className="sr-only">Chart view</span>
                <CardLinkButton
                  href={pipeline.href}
                  label="Open application tracker"
                />
              </>
            }
          />
        </div>
      );
    return (
      <div className="space-y-3">
        {viewSwitch}
        <DashboardCard
          title={pipeline.title}
          subtitle={pipeline.subtitle}
          as="h2"
          skeleton="chart"
          state={state}
          emptyMessage={pipeline.emptyMessage}
          errorMessage={resource?.error}
          onRetry={onRetry}
          actions={
            <CardLinkButton
              href={pipeline.href}
              label="Open application tracker"
            />
          }
          footer={
            resource?.data && (
              <CardFooterStats
                items={[
                  {
                    label: "Active applications",
                    value: resource.data.total.toLocaleString(),
                  },
                  { label: "Stages", value: distribution.length },
                ]}
              />
            )
          }
        >
          <p className="mb-1 text-ub-caption text-ub-text-tertiary sm:hidden">
            Scroll horizontally to see all stages.
          </p>
          <PipelineFlow
            stages={distribution.map((stage) => ({
              id: stage.key,
              label: stage.label,
              count: stage.value,
              stageId: stage.stageId,
            }))}
          />
        </DashboardCard>
      </div>
    );
  }
  const catalogue = role === "data_entry";
  const sources = catalogue
    ? ["programs", "hiddenPrograms"]
    : ["verified", "reviews"];
  const values = sources.map((id) => resources[id]);
  const total = values.reduce(
    (sum, resource) => sum + (resource?.data?.total ?? 0),
    0
  );
  const error = values.find((resource) => resource?.state === "error");
  const state: WidgetState = error
    ? "error"
    : values.some((resource) => !resource || resource.state === "loading")
    ? "loading"
    : total === 0
    ? "empty"
    : "ready";
  const data = sources.map((key, index) => ({
    key,
    label: catalogue
      ? ["Visible", "Hidden"][index]
      : ["Verified", "Awaiting review"][index],
    value: values[index]?.data?.total ?? 0,
  }));
  const percent = total ? Math.round((data[0].value / total) * 100) : 0;
  const segments = [
    { label: "Verified", value: percent, color: "cat-1" as const },
    { label: "Awaiting review", value: 100 - percent, color: "cat-2" as const },
  ];
  const props = {
    title: catalogue ? "Programme visibility" : "Advisor verification",
    subtitle: catalogue
      ? "Visible and hidden programmes across your catalogue."
      : "Verification status across advisor profiles, including inactive accounts.",
    as: "h2" as const,
    state,
    emptyMessage: catalogue
      ? "Add your first programme to start building the catalogue."
      : "Advisor profiles will appear here as registrations are completed.",
    errorMessage: error?.error,
    onRetry,
    stats: data.map((item) => ({
      label: item.label,
      value: item.value.toLocaleString(),
    })),
    menu,
    actions: (
      <CardLinkButton
        href={catalogue ? "/data-entry/knowledge-hub" : "/reviewer/advisors"}
        label={
          catalogue ? "Open programme catalogue" : "Open advisor directory"
        }
      />
    ),
  };
  return catalogue ? (
    <BarChartCard
      {...props}
      data={data}
      label="Programmes by visibility"
      unit="programmes"
      highlightIndex={0}
    />
  ) : (
    <GaugeCard
      {...props}
      segments={segments}
      label="Advisor verification status"
      centerLabel={`${percent}%`}
      centerCaption="verified"
    />
  );
}
