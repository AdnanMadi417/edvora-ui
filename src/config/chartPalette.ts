/**
 * Categorical chart colours in fixed order, never cycled (checked for
 * contrast and colour-blind separation in light and dark), then "Other".
 * Stages take slots in workflow order, so a stage has the same colour on
 * every role. Status meaning uses the status palette (statusTone.ts), not these.
 */
export const CHART_PALETTE = [
  "var(--ub-chart-cat-1)",
  "var(--ub-chart-cat-2)",
  "var(--ub-chart-cat-3)",
  "var(--ub-chart-6)",
  "var(--ub-chart-5)",
] as const;
export const CHART_OTHER = "var(--ub-neutral-600)";
