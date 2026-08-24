import React from "react";
import type { StatusBadgeVariant } from "./StatusBadge";

const VARIANT_CLASSES: Record<StatusBadgeVariant, string> = {
  success: "border-green-200 bg-green-50 text-green-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  attention: "border-orange-200 bg-orange-50 text-orange-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  neutral: "border-slate-200 bg-slate-100 text-slate-500",
};

const VARIANT_DOT_CLASSES: Record<StatusBadgeVariant, string> = {
  success: "bg-green-500",
  danger: "bg-red-500",
  warning: "bg-amber-500",
  attention: "bg-orange-500",
  info: "bg-blue-500",
  neutral: "bg-slate-400",
};

interface DetailStatusBadgeProps {
  variant: StatusBadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function DetailStatusBadge({ variant, children, className }: DetailStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold ${VARIANT_CLASSES[variant]} ${className ?? ""}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${VARIANT_DOT_CLASSES[variant]}`} />
      {children}
    </span>
  );
}
