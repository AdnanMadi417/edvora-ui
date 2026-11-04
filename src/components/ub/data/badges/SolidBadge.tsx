import React from "react";
import { tagBase, tagSolidTones } from "components/ub/recipes";
import { STATUS_BADGE_TONE, type StatusBadgeVariant } from "components/ub/data/badges/StatusBadge";

interface SolidBadgeProps {
  variant: StatusBadgeVariant;
  children: React.ReactNode;
  /**
   * When passed, the caller owns the badge's size and shape (e.g. a 20px
   * count dot); only the solid tone fill is applied. Without it the badge
   * renders as a standard 24px solid tag (brief §4.3).
   */
  className?: string;
}

// Solid fills from the design system: white on 600 (success/danger/info),
// navy on warning-500 and the orange attention fill — all ≥ 4.5:1.
export default function SolidBadge({ variant, children, className }: SolidBadgeProps) {
  const tone = tagSolidTones[STATUS_BADGE_TONE[variant]];
  const shape = className ? "inline-flex items-center justify-center font-semibold" : tagBase;
  return <span className={`${shape} ${tone} ${className ?? ""}`}>{children}</span>;
}
