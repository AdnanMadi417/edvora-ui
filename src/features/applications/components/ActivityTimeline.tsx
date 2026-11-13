"use client";

import { useState } from "react";
import { History } from "lucide-react";
import Button from "components/ub/core/buttons/Button";
import Chip from "components/ub/data/badges/Chip";
import SectionCard from "components/ub/data/cards/SectionCard";
import Timeline, { type TimelineEvent } from "components/ub/data/display/Timeline";

export interface ActivityEvent extends TimelineEvent {
  /** "Label: text" lines under the title (reason, notes, requested documents). */
  details?: { label: string; text: string }[];
  /** Drives the filter chips (see ACTIVITY_FILTERS). */
  category?: string;
}

/** Filter chips, in this order; only categories present in the loaded events show. */
export const ACTIVITY_FILTERS: { key: string; label: string }[] = [
  { key: "status", label: "Status" },
  { key: "documents", label: "Documents" },
  { key: "correction", label: "Corrections" },
  { key: "visa", label: "Visa and payments" },
  { key: "message", label: "Messages" },
  { key: "program", label: "Programme and commission" },
  { key: "other", label: "Other" },
];

export interface ActivityTimelineProps {
  events: ActivityEvent[];
  /** Total events on the server, for the description. */
  total?: number;
  loading?: boolean;
  error?: string | null;
  /** Replaces the error with a neutral note, e.g. when history is unavailable for inactive applications. */
  unavailableMessage?: string | null;
  onRetry?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  /** Reference time for relative labels (tests, previews). */
  now?: Date;
  className?: string;
}

/** Activity (brief §6, §8): grouped Today / This week / Earlier, relative time under 7 days. */
export default function ActivityTimeline({ events, total, loading = false, error, unavailableMessage, onRetry, hasMore = false, loadingMore = false, onLoadMore, now, className }: ActivityTimelineProps) {
  const state = loading && events.length === 0 ? "loading" : unavailableMessage ? "empty" : error ? "error" : events.length === 0 ? "empty" : "ready";
  const [filter, setFilter] = useState<string | null>(null);
  const counts = events.reduce<Record<string, number>>((acc, e) => {
    if (e.category) acc[e.category] = (acc[e.category] ?? 0) + 1;
    return acc;
  }, {});
  const filters = ACTIVITY_FILTERS.filter((f) => counts[f.key]);
  // A filter whose events are gone (e.g. after a refetch) falls back to All.
  const active = filter && counts[filter] ? filter : null;
  const shown = active ? events.filter((e) => e.category === active) : events;
  return (
    <SectionCard
      title="Activity"
      description={total ? `${total} ${total === 1 ? "event" : "events"}, newest first` : undefined}
      state={state}
      loadingRows={4}
      empty={{ icon: History, title: unavailableMessage ?? "No activity yet", description: unavailableMessage ? undefined : "Status changes, uploads and messages appear here." }}
      errorMessage={error ?? undefined}
      onRetry={onRetry}
      className={className}
    >
      {filters.length > 1 && (
        <div role="group" aria-label="Show activity" className="-mt-1 mb-5 flex flex-wrap gap-2">
          <Chip selected={active === null} onSelectedChange={() => setFilter(null)}>
            All
          </Chip>
          {filters.map((f) => (
            <Chip key={f.key} selected={active === f.key} onSelectedChange={() => setFilter(active === f.key ? null : f.key)}>
              {f.label} <span className="ub-tabular ms-1 text-ub-text-tertiary">{counts[f.key]}</span>
            </Chip>
          ))}
        </div>
      )}
      <Timeline
        now={now}
        aria-label="Activity"
        events={shown.map((e) => ({
          ...e,
          description: e.details?.length ? (
            <div className="grid gap-0.5">
              {e.details.map((d) => (
                <p key={d.label} className="whitespace-pre-wrap break-words">
                  <span className="font-medium text-ub-text-primary">{d.label}:</span> {d.text}
                </p>
              ))}
            </div>
          ) : (
            e.description
          ),
        }))}
      />
      {hasMore && onLoadMore && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" text="Load more activity" onClick={onLoadMore} loading={loadingMore} />
        </div>
      )}
    </SectionCard>
  );
}
