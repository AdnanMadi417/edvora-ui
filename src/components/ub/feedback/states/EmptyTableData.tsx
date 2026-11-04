import React, { type ReactNode } from "react";
import { SearchX } from "lucide-react";
import { emptyBody, emptyIconCircle, emptyTitle } from "components/ub/recipes";

interface EmptyDataProps {
  title?: string;
  subtitle?: string;
  /** Overrides the default generic icon — pass one when this empty state
   *  has a more specific message (e.g. "No applications found"), so the
   *  icon matches instead of defaulting to a generic empty-box graphic. */
  icon?: ReactNode;
  /** Extra control under the subtitle, e.g. a Retry button for an error state. */
  action?: ReactNode;
}

/** Empty state for use inside a table or card (brief §4.7); no surface of its own. */
export default function EmptyData({
  title = "No data found",
  subtitle = "There is no data available at the moment",
  icon,
  action,
}: EmptyDataProps) {
  return (
    <section>
      <div className="m-0 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className={`${emptyIconCircle} [&>svg]:h-8 [&>svg]:w-8`}>
            {icon ?? <SearchX className="h-8 w-8" aria-hidden="true" />}
          </div>

          <div className="space-y-1">
            <p className={emptyTitle}>{title}</p>
            <p className={`${emptyBody} mx-auto`}>{subtitle}</p>
          </div>

          {action && <div className="mt-2 flex justify-center">{action}</div>}
        </div>
      </div>
    </section>
  );
}
