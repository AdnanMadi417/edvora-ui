import StatusBadge, { type StatusBadgeVariant } from "./StatusBadge";

/**
 * Whether a record is live: the one status badge every list uses next to a
 * name (advisors, staff, universities, providers, banks…). Three tones across
 * the portal: success = active, neutral = inactive, warning = pending.
 * Workflow statuses (an application's status, a commission's state) use
 * StatusTag instead.
 */
export type EntityStatus = "active" | "inactive" | "pending";

const TONE: Record<EntityStatus, StatusBadgeVariant> = { active: "success", inactive: "neutral", pending: "warning" };
const LABEL: Record<EntityStatus, string> = { active: "Active", inactive: "Inactive", pending: "Pending" };

const ACTIVE = /^(active|verified|approved|enabled|published|visible|live|true)$/i;
const PENDING = /^(pending|unverified|invited|draft|awaiting|in[_ ]?review|submitted|new)$/i;

/** Maps backend values ("active", "suspended", true/false, "unverified"…) onto the three tones. */
export function entityStatusOf(value: string | boolean | null | undefined): EntityStatus {
  if (value === true) return "active";
  if (value === false || value == null) return "inactive";
  const v = String(value).trim();
  if (ACTIVE.test(v)) return "active";
  if (PENDING.test(v)) return "pending";
  return "inactive";
}

export interface EntityStatusBadgeProps {
  /** Backend value, or an EntityStatus. */
  status: string | boolean | null | undefined;
  /** Text to show instead of Active / Inactive / Pending, e.g. "Verified" or "Suspended". Tone still follows `status`. */
  label?: string;
  className?: string;
}

export default function EntityStatusBadge({ status, label, className }: EntityStatusBadgeProps) {
  const s = entityStatusOf(status);
  return (
    <StatusBadge variant={TONE[s]} className={className}>
      {label ?? LABEL[s]}
    </StatusBadge>
  );
}
