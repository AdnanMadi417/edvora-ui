import type { ReactNode } from "react";
import clsx from "clsx";
import Avatar from "components/ub/data/media/Avatar";
import DaysTag from "components/ub/data/badges/DaysTag";
import StatusTag from "../shared/StatusTag";

export interface ListRowProps {
  /** Leading 40px avatar or icon tile. */
  leading?: ReactNode;
  title: ReactNode;
  /** Status tag next to the name (one line, ellipsis and tooltip): a stage id, status name or code. */
  status?: string;
  statusLabel?: string;
  /** One short secondary line: never a sentence. */
  meta?: ReactNode;
  /** Days it has waited (oldest first in a list). */
  waitingDays?: number | null;
  /** Days until due (negative = overdue). */
  dueInDays?: number | null;
  /** One verb + object action on the end side. */
  action?: ReactNode;
  className?: string;
}

/**
 * The one dashboard list row: avatar · name + status tag · secondary line ·
 * days tag · one action on the end. TaskListItem and PeopleListItem are this
 * row, so every list on every role home reads the same.
 */
export default function ListRow({ leading, title, status, statusLabel, meta, waitingDays, dueInDays, action, className }: ListRowProps) {
  return (
    // On phones the action wraps under the text instead of squeezing the name and tag.
    <li className={clsx("flex flex-wrap items-center gap-x-3 gap-y-1 py-3 first:pt-0 last:pb-0 sm:flex-nowrap", className)}>
      {leading}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <p className="min-w-0 max-w-full truncate text-ub-label-md text-ub-text-primary">{title}</p>
          {status && <StatusTag status={status} label={statusLabel} size="sm" />}
        </div>
        {(meta || typeof waitingDays === "number" || typeof dueInDays === "number") && (
          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            {meta && <p className="min-w-0 truncate text-ub-caption text-ub-text-tertiary">{meta}</p>}
            {typeof dueInDays === "number" ? (
              <DaysTag mode="deadline" days={dueInDays} size="sm" />
            ) : (
              typeof waitingDays === "number" && <DaysTag mode="waiting" days={waitingDays} size="sm" />
            )}
          </div>
        )}
      </div>
      {action && <div className="flex w-full shrink-0 justify-end sm:w-auto">{action}</div>}
    </li>
  );
}

/** A person's or student's 40px avatar for `leading`. */
export const RowAvatar = ({ name, src }: { name: string; src?: string | null }) => <Avatar name={name} src={src ?? undefined} size={40} />;
