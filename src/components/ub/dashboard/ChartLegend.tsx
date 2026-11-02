import clsx from "clsx";
import { CHART_BG, type ChartColor } from "./types";

export interface ChartLegendItem {
  label: string;
  color: ChartColor;
  /** Optional value after the label, e.g. "42%". */
  value?: string;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  /** dot (default) or square swatch (better for hatched fills). */
  marker?: "dot" | "square";
  className?: string;
}

/** Dot + label legend. Labels use text tokens; only the marker carries the series colour. */
export default function ChartLegend({ items, marker = "dot", className }: ChartLegendProps) {
  return (
    <ul className={clsx("flex flex-wrap items-center gap-x-4 gap-y-2", className)} aria-label="Legend">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-ub-body-sm text-ub-text-secondary">
          <span aria-hidden="true" className={clsx("shrink-0", marker === "dot" ? "h-2.5 w-2.5 rounded-ub-full" : "h-3 w-3 rounded-ub-xs", CHART_BG[item.color])} />
          {item.label}
          {item.value && <span className="ub-tabular font-medium text-ub-text-primary">{item.value}</span>}
        </li>
      ))}
    </ul>
  );
}
