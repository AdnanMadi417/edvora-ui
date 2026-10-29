import React from "react";
import { tagBase, tagTones, type TagTone } from "components/ub/recipes";

export type StatusBadgeVariant = "success" | "danger" | "warning" | "attention" | "info" | "neutral";

/** StatusBadgeVariant → design-system tag tone (brief §4.3). */
export const STATUS_BADGE_TONE: Record<StatusBadgeVariant, TagTone> = {
  success: "success",
  danger: "danger",
  warning: "warning",
  attention: "attention",
  info: "info",
  neutral: "neutral",
};

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Tinted tag: 24px high, radius 6, label-sm — never a pill. */
export default function StatusBadge({ variant, icon, children, className }: StatusBadgeProps) {
  return (
    <span className={`${tagBase} ${tagTones[STATUS_BADGE_TONE[variant]]} ${className ?? ""}`}>
      {icon}
      {children}
    </span>
  );
}
