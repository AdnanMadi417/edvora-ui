import type { ReactNode } from "react";
import clsx from "clsx";
import ListRow, { RowAvatar } from "./ListRow";
import IconTile, { type IconTileTone } from "../shared/IconTile";
import WidgetStatus, { resolveWidgetState } from "../shared/WidgetStatus";
import type { IconComponent, WidgetStateProps } from "../types";

export interface TaskListItemProps {
  title: ReactNode;
  /** Second line: student, reference or Institution. Never a sentence. */
  meta?: ReactNode;
  /** A person or student: their avatar leads the row (wins over `icon`). */
  avatar?: { name: string; src?: string | null };
  icon?: IconComponent;
  iconTone?: IconTileTone;
  /** Status tag next to the title. */
  status?: string;
  statusLabel?: string;
  /** Days until due (negative = overdue) → Days tag. */
  dueInDays?: number | null;
  /** Days it has waited → "Waiting N days". */
  waitingDays?: number | null;
  /** End-side action: one verb + object TextButton. */
  action?: ReactNode;
  className?: string;
}

/** One task, in the shared row: avatar or icon tile · title + status tag · meta · days tag · action. */
export function TaskListItem({ title, meta, avatar, icon, iconTone = "brand", status, statusLabel, dueInDays, waitingDays, action, className }: TaskListItemProps) {
  return (
    <ListRow
      leading={avatar ? <RowAvatar name={avatar.name} src={avatar.src} /> : icon ? <IconTile icon={icon} tone={iconTone} size="sm" /> : undefined}
      title={title}
      status={status}
      statusLabel={statusLabel}
      meta={meta}
      dueInDays={dueInDays}
      waitingDays={waitingDays}
      action={action}
      className={className}
    />
  );
}

export interface TaskListProps extends WidgetStateProps {
  children?: ReactNode;
  /** Count used to decide the empty state. */
  count: number;
  label: string;
  className?: string;
}

/** Divided task list with loading / empty / error. */
export default function TaskList({ children, count, label, state, emptyMessage = "Nothing due. You're all caught up.", errorMessage, onRetry, className }: TaskListProps) {
  const resolved = resolveWidgetState(state, count > 0);
  if (resolved !== "ready") return <WidgetStatus state={resolved} skeleton="list" emptyMessage={emptyMessage} errorMessage={errorMessage} onRetry={onRetry} className={className} />;
  return (
    <ul aria-label={label} className={clsx("divide-y divide-ub-border", className)}>
      {children}
    </ul>
  );
}
