import type { ReactNode } from "react";
import clsx from "clsx";
import DaysTag from "components/ub/data/badges/DaysTag";
import IconTile, { type IconTileTone } from "../shared/IconTile";
import WidgetStatus, { resolveWidgetState } from "../shared/WidgetStatus";
import type { IconComponent, WidgetStateProps } from "../types";

export interface TaskListItemProps {
  title: ReactNode;
  /** Second line: student, reference or Institution. */
  meta?: ReactNode;
  icon?: IconComponent;
  iconTone?: IconTileTone;
  /** Days until due (negative = overdue) → Days tag. */
  dueInDays?: number | null;
  /** End-side action: a small secondary Button or TextButton. */
  action?: ReactNode;
  className?: string;
}

/** One task: icon tile, title, meta, due Days tag and an optional action. */
export function TaskListItem({ title, meta, icon, iconTone = "brand", dueInDays, action, className }: TaskListItemProps) {
  return (
    <li className={clsx("flex items-center gap-3 py-3 first:pt-0 last:pb-0", className)}>
      {icon && <IconTile icon={icon} tone={iconTone} size="sm" />}
      <div className="min-w-0 flex-1">
        <p className="truncate text-ub-label-md text-ub-text-primary">{title}</p>
        {meta && <p className="truncate text-ub-caption text-ub-text-tertiary">{meta}</p>}
      </div>
      {typeof dueInDays === "number" && <DaysTag mode="deadline" days={dueInDays} size="sm" />}
      {action && <div className="shrink-0">{action}</div>}
    </li>
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
