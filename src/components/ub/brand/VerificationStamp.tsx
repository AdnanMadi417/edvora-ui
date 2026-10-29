import clsx from "clsx";
import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { tagBase, tagTones } from "components/ub/recipes";

// Verification stamp (brief §4.7): shield-check icon with "Verified 12 Jun 2026".
// Used on Knowledge Hub program cards and Logistics Marketplace services.

export type VerificationFreshness = "fresh" | "review" | "expired";

/** Freshness thresholds in days (brief §4.7). One place to change them. */
export const VERIFICATION_FRESHNESS = {
  /** ≤ this many days: fresh (success). */
  freshMaxDays: 90,
  /** ≤ this many days: due for review (warning); older is expired (danger). */
  reviewMaxDays: 180,
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Parses a Date or ISO string; "YYYY-MM-DD" is read as a local calendar day, not UTC midnight. */
export function toLocalDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
}

/** DD MMM YYYY, e.g. "12 Jun 2026" (brief §4.2, §8). */
export function formatStampDate(value: Date | string): string {
  const d = toLocalDate(value);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Whole calendar days from `date` to `now` (0 for future dates). */
export function daysSince(date: Date | string, now: Date | string = new Date()): number {
  const a = toLocalDate(date);
  const b = toLocalDate(now);
  const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.max(0, Math.round((end - start) / DAY_MS));
}

/** Pure freshness rule: ≤90 days fresh, 91–180 due for review, >180 expired. */
export function verificationFreshness(date: Date | string, now: Date | string = new Date(), thresholds = VERIFICATION_FRESHNESS): VerificationFreshness {
  const days = daysSince(date, now);
  if (days <= thresholds.freshMaxDays) return "fresh";
  if (days <= thresholds.reviewMaxDays) return "review";
  return "expired";
}

const STATE = {
  fresh: { tone: tagTones.success, Icon: ShieldCheck, status: "" },
  review: { tone: tagTones.warning, Icon: ShieldAlert, status: "Due for review" },
  expired: { tone: tagTones.danger, Icon: ShieldX, status: "Expired" },
} as const;

export const VERIFICATION_EXPIRED_NOTE = "Confirm with the Institution before quoting";

export interface VerificationStampProps {
  /** When the data was last verified. */
  date: Date | string;
  /** Reference "today", for tests and demos. Default: the current date. */
  now?: Date | string;
  /** Hide the "Confirm with the Institution before quoting" line on expired stamps (e.g. very tight layouts). Default false. */
  hideExpiredNote?: boolean;
  className?: string;
}

/**
 * Shield icon + "Verified DD MMM YYYY", toned by freshness. Review and expired
 * stamps also say so in words, so colour is never the only signal.
 */
export default function VerificationStamp({ date, now, hideExpiredNote = false, className }: VerificationStampProps) {
  const freshness = verificationFreshness(date, now ?? new Date());
  const { tone, Icon, status } = STATE[freshness];
  const iso = toLocalDate(date);
  const isoAttr = isNaN(iso.getTime()) ? undefined : `${iso.getFullYear()}-${String(iso.getMonth() + 1).padStart(2, "0")}-${String(iso.getDate()).padStart(2, "0")}`;

  return (
    <span className={clsx("inline-flex flex-col items-start gap-1", className)} data-freshness={freshness}>
      <span className={clsx(tagBase, tone)}>
        <Icon aria-hidden="true" className="h-3 w-3 shrink-0" strokeWidth={2} />
        <span className="ub-tabular">
          Verified <time dateTime={isoAttr}>{formatStampDate(date)}</time>
        </span>
        {status && (
          <>
            <span aria-hidden="true">·</span>
            <span>{status}</span>
          </>
        )}
      </span>
      {freshness === "expired" && !hideExpiredNote && <span className="text-ub-caption text-ub-tone-danger-text">{VERIFICATION_EXPIRED_NOTE}</span>}
    </span>
  );
}
