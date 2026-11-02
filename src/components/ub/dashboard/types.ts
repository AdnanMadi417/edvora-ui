import type { ComponentType } from "react";

/** Every widget renders one of these (brief §4.7 data states). */
export type WidgetState = "ready" | "loading" | "empty" | "error";

export type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

/** Shared state props: pass state, or let the widget infer "empty" from its data. */
export interface WidgetStateProps {
  state?: WidgetState;
  /** Empty state line, e.g. "No applications this week." */
  emptyMessage?: string;
  /** Error line; a Try again button shows when onRetry is set. */
  errorMessage?: string;
  onRetry?: () => void;
}

/** Categorical slots (validated set) and supporting chart colours. */
export type ChartColor = "cat-1" | "cat-2" | "cat-3" | "muted" | "hatch";

/** Full class names so Tailwind's JIT sees them. */
export const CHART_BG: Record<ChartColor, string> = {
  "cat-1": "bg-ub-chart-cat-1",
  "cat-2": "bg-ub-chart-cat-2",
  "cat-3": "bg-ub-chart-cat-3",
  muted: "bg-ub-chart-muted",
  hatch: "ub-chart-hatch",
};
export const CHART_STROKE: Record<Exclude<ChartColor, "hatch">, string> = {
  "cat-1": "stroke-ub-chart-cat-1",
  "cat-2": "stroke-ub-chart-cat-2",
  "cat-3": "stroke-ub-chart-cat-3",
  muted: "stroke-ub-chart-muted",
};

/** Pure: compact numbers for axes and bubbles (1,284 · 12.9K · 4.2M). */
export function compactNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${+(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-MY");
}
