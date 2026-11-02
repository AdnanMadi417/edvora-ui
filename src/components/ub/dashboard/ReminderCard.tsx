import type { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { CalendarClock } from "lucide-react";
import AppDate from "components/ub/data/AppDate";
import { buttonBase, buttonSizes, buttonVariants } from "components/ub/recipes";
import DashboardCard from "./DashboardCard";
import type { WidgetStateProps } from "./types";

export interface ReminderCardProps extends WidgetStateProps {
  /** Card heading. Default "Next up". */
  heading?: string;
  /** The event, e.g. "Call with Sunway University admissions". */
  title?: ReactNode;
  /** ISO start time. */
  startsAt?: string;
  /** Where or how, e.g. "Google Meet" or "Unibexs office, KL". */
  location?: ReactNode;
  /** The one action: verb + object ("Join call"). */
  cta?: { label: string; href?: string; onClick?: () => void; icon?: ReactNode };
  /** highlighted uses the brand fill and a white CTA. */
  variant?: "default" | "highlighted";
  className?: string;
}

/** Upcoming event: title, time, place and one call to action. Empty when nothing is scheduled. */
export default function ReminderCard({ heading = "Next up", title, startsAt, location, cta, variant = "default", state, emptyMessage = "Nothing scheduled. Enjoy the quiet.", errorMessage, onRetry, className }: ReminderCardProps) {
  const hi = variant === "highlighted";
  const resolved = state && state !== "ready" ? state : title ? "ready" : "empty";
  const btn = clsx(buttonBase, buttonSizes.md, hi ? buttonVariants.inverse : buttonVariants.primary, "w-full");
  return (
    <DashboardCard title={heading} variant={variant} state={resolved} skeleton="lines" emptyMessage={emptyMessage} errorMessage={errorMessage} onRetry={onRetry} className={className}>
      <p className={clsx("text-ub-heading-md", hi ? "text-ub-action-primary-text" : "text-ub-text-primary")}>{title}</p>
      {(startsAt || location) && (
        <p className={clsx("mt-2 flex items-center gap-2 text-ub-body-sm", hi ? "text-ub-action-primary-text opacity-90" : "text-ub-text-secondary")}>
          <CalendarClock className="h-4 w-4 shrink-0" aria-hidden="true" />
          {startsAt && <AppDate value={startsAt} format="datetime" />}
          {startsAt && location && <span aria-hidden="true">·</span>}
          {location}
        </p>
      )}
      {cta && (
        <div className="mt-4">
          {cta.href ? (
            <Link href={cta.href} className={btn}>
              {cta.icon}
              {cta.label}
            </Link>
          ) : (
            <button type="button" onClick={cta.onClick} className={btn}>
              {cta.icon}
              {cta.label}
            </button>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
