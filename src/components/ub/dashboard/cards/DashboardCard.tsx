import type { ReactNode } from "react";
import clsx from "clsx";
import { card } from "components/ub/recipes";
import WidgetStatus, { type WidgetStatusProps } from "../shared/WidgetStatus";
import type { WidgetStateProps } from "../types";

export interface DashboardCardProps extends WidgetStateProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** End-side header controls: PeriodSelect, CardMenu, CardLinkButton. */
  actions?: ReactNode;
  children?: ReactNode;
  /** Tabs or filters inside the card, between the header and body. */
  controls?: ReactNode;
  /** Under the body, e.g. CardFooterStats. */
  footer?: ReactNode;
  /** default: solid surface · highlighted: brand fill for the one card the view leads with. */
  variant?: "default" | "highlighted";
  /** Skeleton shape while loading. */
  skeleton?: WidgetStatusProps["skeleton"];
  as?: "h2" | "h3" | "h4";
  /** Layout only (grid placement). */
  className?: string;
}

/**
 * Card shell for dashboard widgets (brief §4.4): radius 12, 1px border, no
 * resting shadow, padding 20 (16 on mobile). The header holds the title and
 * controls; the body swaps to loading, empty or error from `state`.
 */
export default function DashboardCard({ title, subtitle, actions, children, controls, footer, variant = "default", state = "ready", skeleton, emptyMessage, errorMessage, onRetry, as: Heading = "h3", className }: DashboardCardProps) {
  const hi = variant === "highlighted";
  return (
    <section aria-busy={state === "loading" || undefined} className={clsx(hi ? "rounded-ub-lg border border-transparent bg-ub-action-primary text-ub-action-primary-text" : card, "flex min-w-0 flex-col", className)}>
      <header className="flex items-start justify-between gap-3 px-4 pt-4 md:px-5 md:pt-5">
        <div className="min-w-0">
          <Heading className={clsx("text-ub-heading-sm", hi ? "text-ub-action-primary-text" : "text-ub-text-primary")}>{title}</Heading>
          {subtitle && <p className={clsx("mt-0.5 text-ub-body-sm", hi ? "text-ub-action-primary-text opacity-80" : "text-ub-text-secondary")}>{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      {controls && <div className="px-4 pt-4 md:px-5">{controls}</div>}
      <div className="min-w-0 flex-1 px-4 pb-4 pt-4 md:px-5 md:pb-5">
        {state === "ready" ? children : <WidgetStatus state={state} skeleton={skeleton} emptyMessage={emptyMessage} errorMessage={errorMessage} onRetry={onRetry} />}
      </div>
      {footer && state === "ready" && <footer className={clsx("border-t px-4 py-3 md:px-5", hi ? "border-ub-action-primary-pressed" : "border-ub-border")}>{footer}</footer>}
    </section>
  );
}
