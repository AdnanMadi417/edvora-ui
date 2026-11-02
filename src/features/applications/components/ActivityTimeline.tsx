"use client";

import { History } from "lucide-react";
import Button from "components/ub/core/Button";
import SectionCard from "components/ub/data/SectionCard";
import Timeline, { type TimelineEvent } from "components/ub/data/Timeline";

export interface ActivityEvent extends TimelineEvent {
  /** "Label: text" lines under the title (reason, notes, requested documents). */
  details?: { label: string; text: string }[];
}

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
      <Timeline
        now={now}
        aria-label="Activity"
        events={events.map((e) => ({
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
