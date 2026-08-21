import React from "react";

export type SectionIconBadgeColor = "blue" | "green" | "amber" | "red" | "violet" | "slate";

const COLOR_CLASSES: Record<SectionIconBadgeColor, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  violet: "bg-violet-100 text-violet-700",
  slate: "bg-slate-100 text-slate-700",
};

interface SectionIconBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  color?: SectionIconBadgeColor;
  className?: string;
}

export default function SectionIconBadge({ icon: Icon, color = "blue", className }: SectionIconBadgeProps) {
  return (
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${COLOR_CLASSES[color]} ${className ?? ""}`}>
      <Icon className="h-5 w-5" />
    </span>
  );
}
