import React from "react";

export type StatusBadgeVariant = "success" | "danger" | "warning" | "attention" | "info" | "neutral";

const VARIANT_CLASSES: Record<StatusBadgeVariant, string> = {
  success: "border-green-200 bg-green-50 text-green-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  attention: "border-orange-200 bg-orange-50 text-orange-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  neutral: "border-slate-200 bg-slate-100 text-slate-500",
};

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function StatusBadge({ variant, icon, children, className }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium ${VARIANT_CLASSES[variant]} ${className ?? ""}`}
    >
      {icon}
      {children}
    </span>
  );
}
