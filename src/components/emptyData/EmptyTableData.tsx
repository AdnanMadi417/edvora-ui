import React, { type ReactNode } from "react";
import { SearchX } from "lucide-react";

interface EmptyDataProps {
  title?: string;
  subtitle?: string;
  /** Overrides the default generic icon — pass one when this empty state
   *  has a more specific message (e.g. "No applications found"), so the
   *  icon matches instead of defaulting to a generic empty-box graphic. */
  icon?: ReactNode;
}

export default function EmptyData({
  title = "No data found",
  subtitle = "There is no data available at the moment",
  icon,
}: EmptyDataProps) {
  return (
    <section>
      <div className="m-0 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted">
            {icon ?? <SearchX className="h-8 w-8 text-slate-400" />}
          </div>

          <p className="text-p2 font-medium text-slate-900">{title}</p>

          <p className="text-caption font-normal text-slate-600">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
