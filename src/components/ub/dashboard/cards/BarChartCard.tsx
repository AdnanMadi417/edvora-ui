"use client";
import DashboardCard, { type DashboardCardProps } from "./DashboardCard";
import CardFooterStats, { type CardFooterStat } from "./CardFooterStats";
import CardMenu, { type CardMenuProps } from "../shared/CardMenu";
import PillBarChart, { type PillBarChartProps } from "../charts/PillBarChart";

export interface BarChartCardProps
  extends Omit<DashboardCardProps, "children" | "skeleton" | "footer"> {
  data: PillBarChartProps["data"];
  label: string;
  unit?: string;
  highlightIndex?: number;
  formatValue?: PillBarChartProps["formatValue"];
  stats?: CardFooterStat[];
  menu?: CardMenuProps;
}
/** Reference dashboard card: rounded bars, optional menu/link actions and summary footer. */
export default function BarChartCard({
  data,
  label,
  unit,
  highlightIndex,
  formatValue,
  stats,
  menu,
  actions,
  state,
  ...card
}: BarChartCardProps) {
  const resolved = state ?? (data.length ? "ready" : "empty");
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
      <PillBarChart
        data={data}
        label={label}
        unit={unit}
        highlightIndex={highlightIndex}
        formatValue={formatValue}
        heightClass="h-48"
        className="pt-7"
      />
    </DashboardCard>
  );
}
