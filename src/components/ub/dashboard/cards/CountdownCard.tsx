"use client";

import { useEffect, useState, type ReactNode } from "react";
import AppDate from "components/ub/data/formatting/AppDate";
import DashboardCard from "./DashboardCard";
import type { WidgetStateProps } from "../types";

export interface CountdownCardProps extends Omit<WidgetStateProps, "emptyMessage"> {
  /** Heading, e.g. "Next intake". */
  heading: string;
  /** ISO date-time counted down to. */
  target: string;
  /** What it is, e.g. "January 2027 intake". */
  description?: ReactNode;
  /** Shown once the date has passed. Default "It's started." */
  doneMessage?: string;
  /** Reference time (tests and previews); otherwise ticks every minute. */
  now?: Date;
  footer?: ReactNode;
  className?: string;
}

/** Pure: whole days, hours and minutes until target (all 0 once passed). */
export function countdownParts(target: Date, now: Date): { days: number; hours: number; minutes: number; done: boolean } {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, done: true };
  const m = Math.floor(ms / 60_000);
  return { days: Math.floor(m / 1440), hours: Math.floor((m % 1440) / 60), minutes: m % 60, done: false };
}

/** Countdown to a date (next intake, visa deadline) in days / hours / minutes, tabular, updating every minute. */
export default function CountdownCard({ heading, target, description, doneMessage = "It's started.", now: fixedNow, footer, state = "ready", errorMessage, onRetry, className }: CountdownCardProps) {
  const [now, setNow] = useState<Date | null>(fixedNow ?? null);
  useEffect(() => {
    if (fixedNow) return;
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, [fixedNow]);

  const parts = now ? countdownParts(new Date(target), now) : null;
  const units = parts ? [{ n: parts.days, l: parts.days === 1 ? "day" : "days" }, { n: parts.hours, l: parts.hours === 1 ? "hour" : "hours" }, { n: parts.minutes, l: parts.minutes === 1 ? "minute" : "minutes" }] : [];
  return (
    <DashboardCard title={heading} subtitle={<AppDate value={target} format="long" />} state={state === "ready" && !parts ? "loading" : state} skeleton="stat" errorMessage={errorMessage} onRetry={onRetry} footer={footer} className={className}>
      {parts?.done ? (
        <p className="text-ub-heading-md text-ub-text-primary">{doneMessage}</p>
      ) : (
        <>
          <p className="sr-only">{units.map((u) => `${u.n} ${u.l}`).join(", ")} left</p>
          <div aria-hidden="true" className="grid grid-cols-3 gap-2">
            {units.map((u) => (
              <div key={u.l} className="rounded-ub-md bg-ub-surface-subtle px-2 py-3 text-center">
                <p className="ub-tabular text-ub-data-lg text-ub-text-primary">{String(u.n).padStart(2, "0")}</p>
                <p className="text-ub-caption text-ub-text-tertiary">{u.l}</p>
              </div>
            ))}
          </div>
        </>
      )}
      {description && <p className="mt-3 text-ub-body-sm text-ub-text-secondary">{description}</p>}
    </DashboardCard>
  );
}
