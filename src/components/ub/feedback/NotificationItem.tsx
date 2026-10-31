"use client";

import { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { focusRing } from "components/ub/recipes";

export interface NotificationItemProps {
  /** The event, e.g. "Offer received for Nur Aisyah Binti Kamal". */
  title: string;
  /** The next step, e.g. "Next step: upload the signed offer letter." (brief §6). */
  nextStep?: string;
  /** Pre-formatted time: "9:42 am", "Mon", "12 Oct 2026" (see lib/format). */
  time?: string;
  unread?: boolean;
  /** Optional leading visual: an Avatar or a SectionIconBadge. */
  leading?: ReactNode;
  /** Renders a link (e.g. to the application) … */
  href?: string;
  /** … or a button (e.g. mark as read and open a drawer). */
  onClick?: () => void;
  className?: string;
}

/**
 * One notification: the event, then the next step, with an 8px blue dot when
 * unread (brief §6 Notifications). Use it on the Notifications page and in the
 * navbar bell popover; wrap items in NotificationGroup.
 */
export default function NotificationItem({ title, nextStep, time, unread = false, leading, href, onClick, className }: NotificationItemProps) {
  const body = (
    <>
      <span aria-hidden className={clsx("mt-1.5 h-2 w-2 shrink-0 rounded-ub-full", unread ? "bg-ub-action-primary" : "bg-transparent")} />
      {leading && <span className="shrink-0">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className={clsx("block text-ub-body-sm text-ub-text-primary", unread && "font-semibold")}>
          {title}
          {unread && <span className="sr-only"> (unread)</span>}
        </span>
        {nextStep && <span className="block text-ub-body-sm text-ub-text-secondary">{nextStep}</span>}
      </span>
      {time && <span className="ub-tabular shrink-0 text-ub-caption text-ub-text-tertiary">{time}</span>}
    </>
  );
  const classes = clsx("flex w-full items-start gap-3 rounded-ub-md p-3 text-start", (href || onClick) && "transition-colors duration-ub-fast hover:bg-ub-surface-subtle", (href || onClick) && focusRing, className);

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={classes}>
        {body}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {body}
      </button>
    );
  }
  return <div className={classes}>{body}</div>;
}

export interface NotificationGroupProps {
  /** "Today", "This week" or "Earlier" (see groupNotifications). */
  label: string;
  children: ReactNode;
  className?: string;
}

/** A labelled group of NotificationItems. */
export function NotificationGroup({ label, children, className }: NotificationGroupProps) {
  return (
    <section aria-label={label} className={clsx("p-4", className)}>
      <h3 className="mb-2 text-ub-label-sm uppercase tracking-[0.06em] text-ub-text-tertiary">{label}</h3>
      <ul className="space-y-1">{Array.isArray(children) ? children.map((c, i) => <li key={i}>{c}</li>) : <li>{children}</li>}</ul>
    </section>
  );
}

export type NotificationBucket = "Today" | "This week" | "Earlier";

/** Splits items into Today / This week (last 7 days) / Earlier, keeping order and dropping empty groups. */
export function groupNotifications<T>(items: T[], getDate: (item: T) => Date | string, now: Date = new Date()): { label: NotificationBucket; items: T[] }[] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekAgo = startOfToday - 6 * 86_400_000;
  const buckets: Record<NotificationBucket, T[]> = { Today: [], "This week": [], Earlier: [] };
  for (const item of items) {
    const t = new Date(getDate(item)).getTime();
    buckets[t >= startOfToday ? "Today" : t >= weekAgo ? "This week" : "Earlier"].push(item);
  }
  return (["Today", "This week", "Earlier"] as NotificationBucket[]).filter((l) => buckets[l].length).map((label) => ({ label, items: buckets[label] }));
}
