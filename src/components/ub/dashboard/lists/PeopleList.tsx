import type { ReactNode } from "react";
import clsx from "clsx";
import ListRow, { RowAvatar } from "./ListRow";
import WidgetStatus, { resolveWidgetState } from "../shared/WidgetStatus";
import type { WidgetStateProps } from "../types";

export interface PeopleListItemProps {
  name: string;
  avatarSrc?: string | null;
  /** One short line: type, country, current work. Never a sentence. */
  work?: ReactNode;
  /** Status for the tag next to the name. */
  status?: string;
  statusLabel?: string;
  /** Days it has waited (e.g. a profile awaiting review). */
  waitingDays?: number | null;
  /** End-side action: one verb + object TextButton. */
  action?: ReactNode;
  /** Makes the whole row a link to the item (no separate button). */
  href?: string;
  /** Read before the row by screen readers, e.g. "Review payment". */
  hrefLabel?: string;
  className?: string;
}

/** A person, in the shared row: avatar · name + status tag · one line · days tag · action. */
export function PeopleListItem({ name, avatarSrc, work, status, statusLabel, waitingDays, action, href, hrefLabel, className }: PeopleListItemProps) {
  return (
    <ListRow
      leading={<RowAvatar name={name} src={avatarSrc} />}
      title={name}
      status={status}
      statusLabel={statusLabel}
      meta={work}
      waitingDays={waitingDays}
      action={action}
      href={href}
      hrefLabel={hrefLabel}
      className={className}
    />
  );
}

export interface PeopleListProps extends WidgetStateProps {
  children?: ReactNode;
  count: number;
  label: string;
  className?: string;
}

/** Divided people list (team, Advisors, students) with loading / empty / error. */
export default function PeopleList({ children, count, label, state, emptyMessage = "No one here yet.", errorMessage, onRetry, className }: PeopleListProps) {
  const resolved = resolveWidgetState(state, count > 0);
  if (resolved !== "ready") return <WidgetStatus state={resolved} skeleton="list" emptyMessage={emptyMessage} errorMessage={errorMessage} onRetry={onRetry} className={className} />;
  return (
    <ul aria-label={label} className={clsx("divide-y divide-ub-border", className)}>
      {children}
    </ul>
  );
}
