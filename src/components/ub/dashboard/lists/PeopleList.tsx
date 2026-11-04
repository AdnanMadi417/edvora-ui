import type { ReactNode } from "react";
import clsx from "clsx";
import Avatar from "components/ub/data/media/Avatar";
import StatusTag from "../shared/StatusTag";
import WidgetStatus, { resolveWidgetState } from "../shared/WidgetStatus";
import type { WidgetStateProps } from "../types";

export interface PeopleListItemProps {
  name: string;
  avatarSrc?: string | null;
  /** What they're working on, e.g. "Reviewing 4 applications". */
  work?: ReactNode;
  /** Stage id or status for the tag. */
  status?: string;
  statusLabel?: string;
  /** End-side action, e.g. a CardLinkButton. */
  action?: ReactNode;
  className?: string;
}

/** Avatar, name, current work and a status tag. */
export function PeopleListItem({ name, avatarSrc, work, status, statusLabel, action, className }: PeopleListItemProps) {
  return (
    <li className={clsx("flex items-center gap-3 py-3 first:pt-0 last:pb-0", className)}>
      <Avatar name={name} src={avatarSrc} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-ub-label-md text-ub-text-primary">{name}</p>
        {work && <p className="truncate text-ub-caption text-ub-text-tertiary">{work}</p>}
      </div>
      {status && <StatusTag status={status} label={statusLabel} />}
      {action && <div className="shrink-0">{action}</div>}
    </li>
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
