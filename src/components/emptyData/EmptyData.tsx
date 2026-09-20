import React from "react";
import { SearchX } from "lucide-react";
import type { SectionIconBadgeColor } from "components/ui/icons/SectionIconBadge";

const COLOR_CLASSES: Record<SectionIconBadgeColor, string> = {
  blue: "bg-blue-50 text-blue-500",
  green: "bg-green-50 text-green-500",
  amber: "bg-amber-50 text-amber-500",
  red: "bg-red-50 text-red-500",
  violet: "bg-violet-50 text-violet-500",
  slate: "bg-slate-100 text-slate-400",
};

interface EmptyDataProps {
  title?: string;
  subtitle?: React.ReactNode;
  /** An icon component (e.g. `Bell` from lucide-react, not `<Bell />`) —
   * sized and colored consistently via `color`. Falls back to the default
   * illustration when omitted. */
  icon?: React.ComponentType<{ className?: string }>;
  color?: SectionIconBadgeColor;
  /** Optional control rendered below the subtitle, e.g. a Retry button for error states. */
  action?: React.ReactNode;
}

export default function EmptyData({
  title = "No data found",
  subtitle = "There is no data available at the moment",
  icon: Icon = SearchX,
  color = "slate",
  action,
}: EmptyDataProps) {
  return (
    <section>
      <div className="bg-white p-10 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${COLOR_CLASSES[color]}`}>
            <Icon className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <p className="text-p2 font-semibold text-slate-900">{title}</p>
            <p className="text-caption font-normal text-slate-500">{subtitle}</p>
          </div>

          {action}
        </div>
      </div>
    </section>
  );
}
