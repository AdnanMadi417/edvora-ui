"use client";

import CompositionCard from "components/ub/dashboard/cards/CompositionCard";
import type { OverviewResource } from "../model/types";

/** Home: active applications by study level (donut up to seven levels, ranked bars past that). */
export default function StudyLevelCard({ resource, onRetry }: { resource?: OverviewResource; onRetry: () => void }) {
  const mix = resource?.data?.studyLevels;
  return (
    <CompositionCard
      title="Study level mix"
      subtitle="Active applications by the program's study level."
      unit="applications"
      centerLabel="With a study level"
      items={mix?.levels ?? []}
      state={resource?.state ?? "loading"}
      errorMessage={resource?.error}
      onRetry={onRetry}
      emptyMessage="No active applications yet."
    />
  );
}
