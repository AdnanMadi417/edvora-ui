import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "next/link";
import { CalendarClock, ChevronRight, Clock } from "lucide-react";
import { focusRing } from "components/ub/recipes";
import Avatar from "components/ub/data/media/Avatar";
import { getDaysLabel, getDaysLevel, type DaysLevel } from "components/ub/data/badges/DaysTag";
import type { TagTone } from "components/ub/recipes";
import StatusTag from "../shared/StatusTag";

export interface ListRowProps {
  /** Leading 40px avatar or icon tile. */
  leading?: ReactNode;
  title: ReactNode;
  /** Status tag next to the name (one line, ellipsis and tooltip). Leave it out when every row in the list shares it. */
  status?: string;
  statusLabel?: string;
  /** Tag tone from config/statusTone.ts: amber = waiting on the viewer, red = a problem. */
  statusTone?: TagTone;
  /** One short secondary line: never a sentence. */
  meta?: ReactNode;
  /** Days it has waited (lists sort oldest first). */
  waitingDays?: number | null;
  /** Days until due (negative = overdue). */
  dueInDays?: number | null;
  /** One verb + object action on the end, e.g. a small secondary button (rows with `href` don't need one). */
  action?: ReactNode;
  /** Makes the whole row a link to the item (hover, focus ring, chevron on the end). */
  href?: string;
  /** Read before the row by screen readers, e.g. "Review payment". */
  hrefLabel?: string;
  className?: string;
}

// Urgency as text colour on a quiet clock, not a second filled pill.
const LEVEL_TEXT: Record<DaysLevel, string> = {
  grey: "text-ub-text-tertiary",
  amber: "text-ub-tone-warning-text",
  orange: "text-ub-tone-danger-text",
  red: "text-ub-tone-danger-text",
};

function Days({ waitingDays, dueInDays }: { waitingDays?: number | null; dueInDays?: number | null }) {
  const due = typeof dueInDays === "number";
  const days = due ? dueInDays! : waitingDays;
  if (typeof days !== "number") return null;
  const mode = due ? "deadline" : "waiting";
  const level = getDaysLevel(mode, Math.round(days));
  const Icon = due ? CalendarClock : Clock;
  const whole = Math.max(0, Math.round(days));
  return (
    <span className={clsx("ub-tabular inline-flex shrink-0 items-center gap-1 text-ub-caption", LEVEL_TEXT[level])}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {due ? getDaysLabel("deadline", Math.round(days)) : (
        <>
          <span className="sr-only">Waiting </span>
          {whole} {whole === 1 ? "day" : "days"}
        </>
      )}
    </span>
  );
}

/**
 * The one dashboard list row: avatar · name + status tag · one short line,
 * then how long it has waited. With `href` the whole row is the link to the
 * item (chevron on the end, verb read first by screen readers); otherwise an
 * optional action sits on the end. On phones the days drop under the text.
 * TaskListItem and PeopleListItem are this row on every role home.
 */
export default function ListRow({ leading, title, status, statusLabel, statusTone, meta, waitingDays, dueInDays, action, href, hrefLabel, className }: ListRowProps) {
  const hasDays = typeof waitingDays === "number" || typeof dueInDays === "number";
  const content = (
    <>
      {/* Decorative: the name is already in the row, so the avatar isn't read twice. */}
      {leading && (
        <span aria-hidden="true" className="shrink-0">
          {leading}
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <p className="min-w-0 max-w-full truncate text-ub-label-md text-ub-text-primary" title={typeof title === "string" ? title : undefined}>
              {hrefLabel && <span className="sr-only">{hrefLabel}: </span>}
              {title}
            </p>
            {status && <StatusTag status={status} label={statusLabel} tone={statusTone} size="sm" />}
          </div>
          {meta && (
            <p className="mt-0.5 truncate text-ub-caption text-ub-text-tertiary" title={typeof meta === "string" ? meta : undefined}>
              {meta}
            </p>
          )}
        </div>
        {(hasDays || action) && (
          <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
            {hasDays ? <Days waitingDays={waitingDays} dueInDays={dueInDays} /> : <span />}
            {action}
          </div>
        )}
      </div>
      {href && <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 self-center text-ub-icon rtl:-scale-x-100" />}
    </>
  );
  if (href)
    return (
      <li className={clsx("py-1 first:pt-0 last:pb-0", className)}>
        <Link
          href={href}
          className={clsx(
            "-mx-2 flex min-h-11 items-start gap-3 rounded-ub-md px-2 py-2 transition-colors duration-ub-fast hover:bg-ub-surface-subtle motion-reduce:transition-none sm:items-center",
            focusRing
          )}
        >
          {content}
        </Link>
      </li>
    );
  return <li className={clsx("flex items-start gap-3 py-3 first:pt-0 last:pb-0 sm:items-center", className)}>{content}</li>;
}

/** A person's or student's 40px avatar for `leading`. */
export const RowAvatar = ({ name, src }: { name: string; src?: string | null }) => <Avatar name={name} src={src ?? undefined} size={40} />;
