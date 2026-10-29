import React from "react";
import { tagBase, tagDot, tagTones } from "components/ub/recipes";
import { STATUS_BADGE_TONE, type StatusBadgeVariant } from "components/ub/data/StatusBadge";

interface DetailStatusBadgeProps {
  variant: StatusBadgeVariant;
  children: React.ReactNode;
  className?: string;
}

/** Tinted tag with a 6px status dot, for detail-page headers. */
export default function DetailStatusBadge({ variant, children, className }: DetailStatusBadgeProps) {
  const tone = STATUS_BADGE_TONE[variant];
  return (
    <span className={`${tagBase} ${tagTones[tone]} ${className ?? ""}`}>
      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-ub-full ${tagDot[tone]}`} />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}
