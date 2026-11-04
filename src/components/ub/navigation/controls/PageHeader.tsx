import { ReactNode } from "react";
import clsx from "clsx";
import Breadcrumbs, { type BreadcrumbItem } from "../links/Breadcrumbs";

export interface PageHeaderProps {
  /** Page title in sentence case, e.g. "Application Tracker". */
  title: ReactNode;
  /** One sentence under the title. */
  description?: ReactNode;
  /** Trail above the title; the last item is the current page. */
  breadcrumbs?: BreadcrumbItem[];
  /** Tags or meta next to the title, e.g. <StageTag /> and <DaysTag /> on a Student profile. */
  meta?: ReactNode;
  /** Up to three buttons. Exactly one Primary per view, and it goes last (brief §4.1). */
  actions?: ReactNode;
  /** Leading visual, e.g. an Avatar on the Student profile. */
  leading?: ReactNode;
  className?: string;
}

/**
 * The top of every screen's content: breadcrumbs, title, meta, description and
 * the view's actions. Use it once per page (Tracker, Student profile, Knowledge
 * Hub, Commission, settings). Renders the page's h1.
 */
export default function PageHeader({ title, description, breadcrumbs, meta, actions, leading, className }: PageHeaderProps) {
  return (
    <header className={clsx("mb-6 md:mb-8", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} className="mb-3" />}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {leading && <div className="shrink-0">{leading}</div>}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="min-w-0 text-ub-heading-xl-mobile text-ub-text-primary sm:text-ub-heading-xl">{title}</h1>
              {meta && <div className="flex flex-wrap items-center gap-2">{meta}</div>}
            </div>
            {description && <p className="mt-2 max-w-ub-reading text-ub-body-md text-ub-text-secondary">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
