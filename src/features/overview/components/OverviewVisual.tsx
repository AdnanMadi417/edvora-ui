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
        className="h-full"
        title={pipeline.title}
        subtitle={pipeline.subtitle}
        as="h2"
        skeleton="list"
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
      >
        <PipelineFlow
          layout="list"
          label="Applications by stage"
          stages={distribution.map((stage) => ({
            id: stage.key,
            label: stage.label,
            count: stage.value,
          }))}
          // Each stage opens the Application Tracker filtered to it.
          getHref={(stage) => `${pipeline.href}?stage=${encodeURIComponent(stage.id)}`}
        />
      </DashboardCard>
    );
  }
  if (role === "data_entry") {
    const inputs = [
      resources.programs,
      resources.hiddenPrograms,
      resources.catalogueQuality,
    ];
    const error = inputs.find((resource) => resource?.state === "error");
    const loading = inputs.some(
      (resource) => !resource || resource.state === "loading"
    );
    const total =
      (resources.programs?.data?.total || 0) +
      (resources.hiddenPrograms?.data?.total || 0);
    const issues = resources.catalogueQuality?.data?.total || 0;
    const invalid = issues > total;
    const state: WidgetState =
      error || invalid
        ? "error"
        : loading
        ? "loading"
        : !total
        ? "empty"
        : "ready";
    const complete = Math.max(0, total - issues);
    const percent = total ? Math.round((complete / total) * 100) : 0;
    return (
      <GaugeCard
        title="Catalogue completeness"
        subtitle="Required program fields and delivery mode."
        as="h2"
        className="h-full"
        state={state}
        emptyMessage="Add programs to see catalogue completeness."
        errorMessage={
          error?.error ||
          (invalid ? "Catalogue counts changed. Try again." : undefined)
        }
        onRetry={onRetry}
        stats={[
          { label: "Complete", value: complete.toLocaleString() },
          { label: "Needs attention", value: issues.toLocaleString() },
        ]}
        segments={[
          { label: "Complete", value: percent, color: "cat-1" },
          { label: "Needs attention", value: 100 - percent, color: "cat-2" },
        ]}
        label="Required program information"
        centerLabel={`${percent}%`}
        centerCaption="complete"
      />
    );
  }
  const values = [resources.verified, resources.reviews];
  const [verified, awaiting] = values.map(
    (resource) => resource?.data?.total ?? 0
  );
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
        extraItems: [
          { label: "Refresh data", icon: RefreshCw, onClick: onRetry },
        ],
      }}
      actions={
        <CardLinkButton
          href="/reviewer/advisors"
          label="Open advisor directory"
        />
      }
      segments={[
        { label: "Verified", value: percent, color: "cat-1" as const },
        {
          label: "Awaiting review",
          value: 100 - percent,
          color: "cat-2" as const,
        },
      ]}
      label="Advisor verification status"
      centerLabel={`${percent}%`}
      centerCaption="verified"
    />
  );
}
