import React from "react";

export type CountBadgeTone = "brand" | "danger";

const countTones: Record<CountBadgeTone, string> = {
  // Neutral counter: solid blue in light; raised surface + border + white in dark (guide §4).
  brand: "border border-ub-count-border bg-ub-count-bg text-ub-count-text",
  danger: "bg-ub-danger-600 text-ub-text-on-action",
};

export interface CountBadgeProps {
  count: number;
  /** Above this the badge reads "<max>+". Default 99. */
  max?: number;
  tone?: CountBadgeTone;
  /** Accessible text for the count, e.g. (n) => `${n} unread`. Uses the real count, not the capped one. */
  label?: (count: number) => string;
  /** Render "0" instead of nothing when the count is zero. */
  showZero?: boolean;
  className?: string;
}

/**
 * Small count pill for nav items, tabs and the bell (brief §4.7). 20px high,
 * tabular numerals. The visible number is hidden from assistive tech and
 * replaced by a full phrase ("4 unread") so it reads well out of context.
 */
export default function CountBadge({ count, max = 99, tone = "brand", label = (n) => `${n} unread`, showZero, className }: CountBadgeProps) {
  if (count <= 0 && !showZero) return null;
  const n = Math.max(0, Math.floor(count));
  const display = n > max ? `${max}+` : String(n);
  return (
    <span
      className={`ub-tabular inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-ub-full px-1.5 text-ub-label-sm ${countTones[tone]} ${className ?? ""}`}
    >
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{label(n)}</span>
    </span>
  );
}
