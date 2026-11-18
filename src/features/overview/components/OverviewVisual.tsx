"use client";
import type { WidgetState } from "components/ub/dashboard/types";
import { CheckCircle2, RefreshCw } from "lucide-react";
import GaugeCard from "components/ub/dashboard/cards/GaugeCard";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import CardLinkButton from "components/ub/dashboard/cards/CardLinkButton";
import DonutStatsCard from "components/ub/dashboard/cards/DonutStatsCard";
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
    const universities = resources.actionRequired?.state === "ready" ? resources.actionRequired.data?.byUniversity : undefined;
    const stageTotal = distribution.reduce((sum, stage) => sum + stage.value, 0);
    const universityTotal = universities?.reduce((sum, u) => sum + u.value, 0);
    // Dev-only: every count on the home must agree (pipeline total = list total).
    if (process.env.NODE_ENV !== "production" && resource?.state === "ready" && universityTotal != null && universityTotal !== stageTotal)
      console.warn(`[overview] Applications by stage (${stageTotal}) and by university (${universityTotal}) disagree.`);
    return (
      <DonutStatsCard
        title={pipeline.title}
        subtitle={pipeline.subtitle}
        state={resource?.state ?? "loading"}
        emptyMessage={pipeline.emptyMessage}
        errorMessage={resource?.error}
        onRetry={onRetry}
        actions={<CardLinkButton href={pipeline.href} label="Open application tracker" />}
        // One dimension: stages, in workflow order (the same colours on every role).
        views={[
          {
            id: "stage",
            label: "By stage",
            centerLabel: "Active applications",
            // Workflow order, so the pipeline reads review → commission.
            keepOrder: true,
            // Each stage opens the Application Tracker filtered to it.
            items: distribution.map((stage) => ({
              key: stage.key,
              label: stage.label,
              value: stage.value,
              href: `${pipeline.href}?stage=${encodeURIComponent(stage.key)}`,
            })),
          },
]}
      />
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
    // A complete catalogue says so in one line, not a 100% gauge.
    if (state === "ready" && issues === 0)
      return (
        <DashboardCard title="Catalogue completeness" as="h2">
          <p className="flex items-center gap-2 text-ub-body-sm text-ub-text-secondary">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-ub-tone-success-text" />
            All {total.toLocaleString()} programs are complete.
          </p>
        </DashboardCard>
      );
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
  // Reviewer: verification lives in the Advisors card (one row per dimension), not a second chart.
  return null;
}
