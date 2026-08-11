import React from "react";
import type { StatusBadgeVariant } from "./StatusBadge";

// Solid fill + white text, each verified >= 4.5:1 contrast (WCAG AA) — see
// design notes in the PR. Do not swap these for the -500 shades used by
// StatusBadge's soft variants; -500 fills read ~2-3:1 with white text.
const VARIANT_CLASSES: Record<StatusBadgeVariant, string> = {
  success: "bg-emerald-700 text-white",
  danger: "bg-red-700 text-white",
  warning: "bg-amber-500 text-white",
  attention: "bg-orange-700 text-white",
  info: "bg-blue-600 text-white",
  neutral: "bg-slate-600 text-white",
};

interface SolidBadgeProps {
  variant: StatusBadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function SolidBadge({ variant, children, className }: SolidBadgeProps) {
  return (
    <span className={`inline-flex items-center justify-center font-semibold ${VARIANT_CLASSES[variant]} ${className ?? ""}`}>
      {children}
    </span>
  );
}
