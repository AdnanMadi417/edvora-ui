import React from "react";
import { iconTints } from "components/ub/recipes";

export type SectionIconBadgeColor = keyof typeof iconTints;

interface SectionIconBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  color?: SectionIconBadgeColor;
  className?: string;
}

/** 48px tinted circle with a 20px icon; tints follow data-ub-theme. */
export default function SectionIconBadge({ icon: Icon, color = "blue", className }: SectionIconBadgeProps) {
  return (
    <span
      aria-hidden
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-ub-full ${iconTints[color]} ${className ?? ""}`}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}
