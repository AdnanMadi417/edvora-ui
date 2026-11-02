import type { ReactNode } from "react";
import clsx from "clsx";

export interface DashboardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** The view's one Primary action (a Button variant="primary"). */
  primaryAction?: ReactNode;
  /** Secondary actions, e.g. a PeriodSelect or Export (secondary buttons). */
  secondaryActions?: ReactNode;
  /** Heading level. Default h1. */
  as?: "h1" | "h2" | "h3";
  className?: string;
}

/** Top of a dashboard (brief §5): heading-xl title, one line of context, actions on the end side (wrap on mobile). */
export default function DashboardHeader({ title, subtitle, primaryAction, secondaryActions, as: Heading = "h1", className }: DashboardHeaderProps) {
  return (
    <header className={clsx("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        <Heading className="text-ub-heading-xl-mobile text-ub-text-primary sm:text-ub-heading-xl">{title}</Heading>
        {subtitle && <p className="mt-1 text-ub-body-md text-ub-text-secondary">{subtitle}</p>}
      </div>
      {(primaryAction || secondaryActions) && (
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {secondaryActions}
          {primaryAction}
        </div>
      )}
    </header>
  );
}
