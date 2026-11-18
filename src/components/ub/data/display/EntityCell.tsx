import { isValidElement, type ReactElement, type ReactNode } from "react";
import { Avatar } from "components/ub/data/media/Avatar";
import EntityStatusBadge, { entityStatusOf, type EntityStatus, type EntityStatusBadgeProps } from "components/ub/data/badges/EntityStatusBadge";

/** Record state shown as a small circle on the avatar: a backend value plus an optional word. */
export type EntityCellStatus = { status: string | boolean | null | undefined; label?: string } | ReactElement<EntityStatusBadgeProps>;

export interface EntityCellProps {
  /** The record's name. One line; long names truncate with the full name in a tooltip. */
  name: string;
  /** Photo or logo URL; initials on a neutral background when missing or broken. */
  imageSrc?: string | null;
  /** A custom 40px avatar (e.g. a presigned image); wins over `imageSrc`. */
  avatar?: ReactNode;
  /** Hide the avatar for records that never have one (e.g. a field of study); the status circle then sits before the name. */
  noAvatar?: boolean;
  /** Whether the record is live: `{ status, label }` (or an <EntityStatusBadge />), drawn as a small circle on the avatar. */
  status?: EntityCellStatus;
  /** One short line under the name (type, country…). Never a description. */
  subtitle?: ReactNode;
  className?: string;
}

const DOT: Record<EntityStatus, string> = {
  active: "bg-ub-tone-success-dot",
  inactive: "bg-ub-tone-neutral-dot",
  pending: "bg-ub-tone-warning-dot",
};
const WORD: Record<EntityStatus, string> = { active: "Active", inactive: "Inactive", pending: "Pending" };

function readStatus(status: EntityCellStatus | undefined): { tone: EntityStatus; label: string } | null {
  if (!status) return null;
  const props = isValidElement(status) && status.type === EntityStatusBadge ? (status.props as EntityStatusBadgeProps) : (status as { status: string | boolean | null | undefined; label?: string });
  const tone = entityStatusOf(props.status);
  return { tone, label: props.label ?? WORD[tone] };
}

/**
 * The name cell every list uses, in the table and in its phone card: a 40px
 * round avatar with the record's status as a small circle on it (green
 * active, grey inactive, amber pending; tooltip and screen-reader text say
 * which), the name on one line, and one short line under it. No Status column.
 */
export default function EntityCell({ name, imageSrc, avatar, noAvatar = false, status, subtitle, className = "" }: EntityCellProps) {
  const s = readStatus(status);
  const dot = (size: string, placed: string) =>
    s && (
      <span data-entity-status={s.tone} title={s.label} className={`rounded-ub-full ${size} ${placed} ${DOT[s.tone]}`}>
        <span className="sr-only">{s.label}</span>
      </span>
    );
  return (
    <span className={`flex min-w-0 items-center gap-3 ${className}`}>
      {!noAvatar && (
        <span className="relative shrink-0">
          {avatar ?? <Avatar name={name} src={imageSrc ?? undefined} size={40} alt="" />}
          {dot("h-3 w-3", "absolute bottom-0 end-0 ring-2 ring-ub-avatar-ring")}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          {noAvatar && dot("h-2.5 w-2.5", "shrink-0")}
          <span title={name} className="min-w-0 truncate text-ub-label-md text-ub-text-primary">
            {name}
          </span>
        </span>
        {subtitle && <span className="block truncate text-ub-caption text-ub-text-tertiary">{subtitle}</span>}
      </span>
    </span>
  );
}
