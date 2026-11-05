"use client";
import DashboardCard, { type DashboardCardProps } from "./DashboardCard";
import CardFooterStats, { type CardFooterStat } from "./CardFooterStats";
import CardMenu, { type CardMenuProps } from "../shared/CardMenu";
import GaugeChart, { type GaugeChartProps } from "../charts/GaugeChart";
import GaugeLegendStats from "../charts/GaugeLegendStats";

export interface GaugeCardProps
  extends Omit<DashboardCardProps, "children" | "skeleton" | "footer"> {
  segments: NonNullable<GaugeChartProps["segments"]>;
  label: string;
  centerLabel?: GaugeChartProps["centerLabel"];
  centerCaption?: GaugeChartProps["centerCaption"];
  stats?: CardFooterStat[];
  menu?: CardMenuProps;
}
/** Segmented gauge and matching legend; shared tokens support light, dark and RTL. */
export default function GaugeCard({
  segments,
  label,
  centerLabel,
  centerCaption,
  stats,
  menu,
  actions,
  state,
  ...card
}: GaugeCardProps) {
  const resolved = state ?? (segments.length ? "ready" : "empty");
  return (
    <DashboardCard
      {...card}
      state={resolved}
      skeleton="chart"
      actions={
        <>
          {menu && <CardMenu {...menu} />}
          {actions}
        </>
      }
      footer={stats?.length ? <CardFooterStats items={stats} /> : undefined}
    >
      <GaugeChart
        segments={segments}
        label={label}
        centerLabel={centerLabel}
        centerCaption={centerCaption}
      />
      <GaugeLegendStats items={segments} className="mt-5" />
    </DashboardCard>
  );
}
