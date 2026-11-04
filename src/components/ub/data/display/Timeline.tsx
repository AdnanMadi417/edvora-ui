import type { ComponentType, ReactNode } from "react";
import clsx from "clsx";
import { parseDate, formatDate, toISOString } from "components/ub/data/formatting/appDateUtils";
import { tagDot, type TagTone } from "components/ub/recipes";

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

export interface TimelineEvent {
  id: string;
  title: ReactNode;
  /** Second line: who did it, a reason or notes. */
  description?: ReactNode;
  /** ISO date-time; drives grouping and the time label. */
  at: string;
  /** 16px icon in the marker; otherwise a dot in `tone`. */
  icon?: IconComponent;
  tone?: TagTone;
}

export type TimelineGroupKey = "today" | "week" | "earlier";

export const TIMELINE_GROUP_LABELS: Record<TimelineGroupKey, string> = {
  today: "Today",
  week: "This week",
  earlier: "Earlier",
};

const DAY = 86_400_000;

/** Pure: which recency group an event falls in, relative to `now`. */
export function timelineGroupOf(at: string, now: Date = new Date()): TimelineGroupKey {
  const date = parseDate(at);
  if (!date) return "earlier";
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (date.getTime() >= startOfToday) return "today";
  if (now.getTime() - date.getTime() < 7 * DAY) return "week";
  return "earlier";
}

/** Pure: "3 hours ago" / "2 days ago" under 7 days, otherwise "12 Jun 2026" (brief §8). */
export function formatEventTime(at: string, now: Date = new Date(), locale = "en-GB"): string {
  const date = parseDate(at);
  if (!date) return "";
  const diff = now.getTime() - date.getTime();
  if (diff >= 0 && diff < 7 * DAY) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (diff < 60_000) return "Just now";
    if (diff < 3_600_000) return rtf.format(-Math.round(diff / 60_000), "minute");
    if (diff < DAY) return rtf.format(-Math.round(diff / 3_600_000), "hour");
    return rtf.format(-Math.round(diff / DAY), "day");
  }
  return formatDate(date, "short", locale);
}

/** Pure: groups events (newest first) into Today / This week / Earlier, skipping empty groups. */
export function groupTimeline<T extends { at: string }>(events: T[], now: Date = new Date()): { key: TimelineGroupKey; label: string; events: T[] }[] {
  const sorted = [...events].sort((a, b) => (parseDate(b.at)?.getTime() ?? 0) - (parseDate(a.at)?.getTime() ?? 0));
  return (["today", "week", "earlier"] as const)
    .map((key) => ({ key, label: TIMELINE_GROUP_LABELS[key], events: sorted.filter((e) => timelineGroupOf(e.at, now) === key) }))
    .filter((g) => g.events.length > 0);
}

export interface TimelineProps {
  events: TimelineEvent[];
  /** Group under Today / This week / Earlier headings. Default true. */
  grouped?: boolean;
  /** Reference time, for tests and stable previews. */
  now?: Date;
  /** Accessible name for the list. */
  "aria-label"?: string;
  className?: string;
}

function EventItem({ event, now, last }: { event: TimelineEvent; now: Date; last: boolean }) {
  const date = parseDate(event.at);
  const Icon = event.icon;
  return (
    <li className="flex gap-3">
      <div aria-hidden="true" className="flex shrink-0 flex-col items-center">
        <span className="grid h-6 w-6 place-items-center rounded-ub-full border border-ub-border bg-ub-surface text-ub-icon">
          {Icon ? <Icon className="h-3.5 w-3.5" /> : <span className={clsx("h-2 w-2 rounded-ub-full", tagDot[event.tone ?? "neutral"])} />}
        </span>
        {!last && <span className="my-1 w-px flex-1 bg-ub-border" />}
      </div>
      <div className={clsx("min-w-0 flex-1", !last && "pb-5")}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="min-w-0 text-ub-label-md text-ub-text-primary">{event.title}</p>
          {date && (
            <time dir="auto" dateTime={toISOString(date)} className="ub-tabular shrink-0 text-ub-caption text-ub-text-tertiary">
              {formatEventTime(event.at, now)}
            </time>
          )}
        </div>
        {event.description && <div className="mt-0.5 text-ub-body-sm text-ub-text-secondary">{event.description}</div>}
      </div>
    </li>
  );
}

/**
 * Vertical event timeline (brief §4 Data, §8 time rules): newest first,
 * grouped Today / This week / Earlier, relative time under 7 days.
 */
export default function Timeline({ events, grouped = true, now = new Date(), "aria-label": ariaLabel = "Activity", className }: TimelineProps) {
  if (!grouped) {
    return (
      <ol aria-label={ariaLabel} className={className}>
        {events.map((e, i) => (
          <EventItem key={e.id} event={e} now={now} last={i === events.length - 1} />
        ))}
      </ol>
    );
  }
  return (
    <div className={clsx("grid gap-6", className)}>
      {groupTimeline(events, now).map((g) => (
        <section key={g.key} aria-label={`${ariaLabel}: ${g.label}`}>
          <h4 className="mb-3 text-ub-label-sm text-ub-text-tertiary">{g.label}</h4>
          <ol>
            {g.events.map((e, i) => (
              <EventItem key={e.id} event={e} now={now} last={i === g.events.length - 1} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
