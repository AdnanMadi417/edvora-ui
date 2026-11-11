"use client";
import type { WidgetState } from "components/ub/dashboard/types";
import { RefreshCw } from "lucide-react";
import GaugeCard from "components/ub/dashboard/cards/GaugeCard";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
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
  const pipeline = plans.find((plan) => plan.id === "pipeline");
  if (pipeline) {
    const resource = resources.pipeline;
    const distribution = resource?.data?.distribution ?? [];
    const state =
      resource?.state === "ready" && !resource.data?.total
        ? "empty"
        : resource?.state ?? "loading";
    return (
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
          <CardLinkButton href={pipeline.href} label="Open application tracker" />
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
    );
  }
  // Data entry's visible/hidden split is already in the cards above; no chart.
  if (role === "data_entry") return null;
  const values = [resources.verified, resources.reviews];
  const [verified, awaiting] = values.map((resource) => resource?.data?.total ?? 0);
  const total = verified + awaiting;
  const error = values.find((resource) => resource?.state === "error");
  const state: WidgetState = error
    ? "error"
    : values.some((resource) => !resource || resource.state === "loading")
    ? "loading"
    : total === 0
    ? "empty"
    : "ready";
  const percent = total ? Math.round((verified / total) * 100) : 0;
  return (
    <GaugeCard
      title="Advisor verification"
      subtitle="Verification status across advisor profiles, including inactive accounts."
      as="h2"
      state={state}
      emptyMessage="Advisor profiles will appear here as registrations are completed."
      errorMessage={error?.error}
      onRetry={onRetry}
      stats={[
        { label: "Verified", value: verified.toLocaleString() },
        { label: "Awaiting review", value: awaiting.toLocaleString() },
      ]}
      menu={{
        label: "Chart options",
        extraItems: [{ label: "Refresh data", icon: RefreshCw, onClick: onRetry }],
      }}
      actions={<CardLinkButton href="/reviewer/advisors" label="Open advisor directory" />}
      segments={[
        { label: "Verified", value: percent, color: "cat-1" as const },
        { label: "Awaiting review", value: 100 - percent, color: "cat-2" as const },
      ]}
      label="Advisor verification status"
      centerLabel={`${percent}%`}
      centerCaption="verified"
    />
  );
}
