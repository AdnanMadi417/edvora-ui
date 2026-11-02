import type { ReactNode } from "react";
import clsx from "clsx";
import { tableHead } from "components/ub/recipes";
import DeltaPill from "./DeltaPill";
import WidgetStatus, { resolveWidgetState } from "./WidgetStatus";
import type { WidgetStateProps } from "./types";

export interface BreakdownRow {
  key: string;
  /** First column, e.g. an Institution or Advisor. */
  label: ReactNode;
  /** Second line under the label. */
  meta?: ReactNode;
  /** Main figure: Amount or Numeral. */
  value: ReactNode;
  /** Change in percent → growth pill. */
  growth?: number;
  /** Whether a rise is good. Default "up". */
  goodWhen?: "up" | "down";
}

export interface BreakdownTableProps extends WidgetStateProps {
  rows: BreakdownRow[];
  caption: string;
  labelHeader?: string;
  valueHeader?: string;
  growthHeader?: string;
  /** Period for growth, read by screen readers: "vs last intake". */
  comparedTo?: string;
  className?: string;
}

/** Compact breakdown (44px rows): label, right-aligned tabular value, growth pill. */
export default function BreakdownTable({ rows, caption, labelHeader = "Name", valueHeader = "Total", growthHeader = "Growth", comparedTo, state, emptyMessage, errorMessage, onRetry, className }: BreakdownTableProps) {
  const resolved = resolveWidgetState(state, rows.length > 0);
  if (resolved !== "ready") return <WidgetStatus state={resolved} skeleton="list" emptyMessage={emptyMessage} errorMessage={errorMessage} onRetry={onRetry} className={className} />;
  return (
    <div className={clsx("overflow-x-auto rounded-ub-md border border-ub-border", className)}>
      <table className="w-full text-start text-ub-body-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className={tableHead}>
          <tr>
            <th scope="col" className="h-9 px-3 text-start font-medium">{labelHeader}</th>
            <th scope="col" className="h-9 px-3 text-end font-medium">{valueHeader}</th>
            <th scope="col" className="h-9 px-3 text-end font-medium">{growthHeader}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-ub-border">
              <th scope="row" className="h-11 px-3 text-start font-normal">
                <span className="block truncate text-ub-label-md text-ub-text-primary">{r.label}</span>
                {r.meta && <span className="block truncate text-ub-caption text-ub-text-tertiary">{r.meta}</span>}
              </th>
              <td className="ub-tabular h-11 px-3 text-end text-ub-text-primary">{r.value}</td>
              <td className="h-11 px-3 text-end">{typeof r.growth === "number" ? <DeltaPill value={r.growth} goodWhen={r.goodWhen} comparedTo={comparedTo} /> : <span className="text-ub-text-tertiary">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
