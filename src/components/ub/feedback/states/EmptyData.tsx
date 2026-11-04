import React from "react";
import { SearchX } from "lucide-react";
import type { SectionIconBadgeColor } from "components/ub/icons/SectionIconBadge";
import { emptyBody, emptyTitle, iconTints } from "components/ub/recipes";

interface EmptyDataProps {
  title?: string;
  subtitle?: React.ReactNode;
  /** An icon component (e.g. `Bell` from lucide-react, not `<Bell />`) —
   * sized and colored consistently via `color`. Falls back to a generic
   * search icon when omitted. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Tint of the 64px icon circle. Defaults to the brand tint (brief §4.7);
   *  use "red" for error states. */
  color?: SectionIconBadgeColor;
  /** Optional control rendered below the subtitle, e.g. a Retry button for error states. */
  action?: React.ReactNode;
}

/**
 * Empty state (brief §4.7): 32px icon in a 64px tinted circle, heading-md
 * title, one sentence and an optional action. Transparent background so it
 * sits on whatever surface hosts it, in light and dark themes.
 */
export default function EmptyData({
  title = "No data found",
  subtitle = "There is no data available at the moment",
  icon: Icon = SearchX,
  color = "blue",
  action,
}: EmptyDataProps) {
  const tint = (iconTints as Record<string, string>)[color] ?? iconTints.blue;
  return (
    <section>
      <div className="px-4 py-10 text-center md:px-6 md:py-12">
        <div className="flex flex-col items-center gap-4">
          <div className={`grid h-16 w-16 place-items-center rounded-ub-full ${tint}`}>
            <Icon className="h-8 w-8" aria-hidden="true" />
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
