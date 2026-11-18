"use client";

import RadialStatsCard from "components/ub/dashboard/cards/RadialStatsCard";

export interface AdvisorStats {
  active?: number;
  inactive?: number;
  individual?: number;
  agency?: number;
}

/**
 * How many advisors there are and how they split (active / suspended,
 * company / individual) as rings; each legend row filters the list below.
 * Every advisor is active or suspended, so that pair is the whole.
 */
export default function AdvisorStatsRings({
  stats,
  selectedId,
  onSelect,
  loading,
}: {
  stats?: AdvisorStats | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  loading?: boolean;
}) {
  const total = (stats?.active ?? 0) + (stats?.inactive ?? 0);
  return (
    <RadialStatsCard
      framed={false}
      title="Advisors"
      subtitle="Press a group to show only those advisors; press it again to show all."
      total={total}
      totalLabel="advisors"
      loading={loading && !stats}
      selectedId={selectedId}
      onSelect={onSelect}
      items={[
        { id: "active", label: "Active", value: stats?.active ?? 0 },
        { id: "inactive", label: "Suspended", value: stats?.inactive ?? 0 },
        { id: "agency", label: "Company", value: stats?.agency ?? 0 },
        { id: "individual", label: "Individual", value: stats?.individual ?? 0 },
      ]}
    />
  );
}
