import React from "react";
import { FileCheck2 } from "lucide-react";
import { card, emptyBody, emptyIconCircle, emptyTitle } from "components/ub/recipes";

interface EmptyDataProps {
  title?: string;
  subtitle?: string;
  /** Overrides the default icon (e.g. a lucide-react element) when the
   *  generic "no documents" icon doesn't fit the context. */
  icon?: React.ReactNode;
}

/** Bordered empty-state card (brief §4.4 card + §4.7 empty state). */
export default function EmptyData({
  title = "No data",
  subtitle = "No additional information available.",
  icon,
}: EmptyDataProps) {
  return (
    <section>
      <div className={`mt-5 ${card} px-4 py-10 text-center md:px-6`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`${emptyIconCircle} [&>svg]:h-8 [&>svg]:w-8`}>
            {icon ?? <FileCheck2 className="h-8 w-8" aria-hidden="true" />}
          </div>

          <div className="space-y-1">
            <p className={emptyTitle}>{title}</p>
            <p className={`${emptyBody} mx-auto`}>{subtitle}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
