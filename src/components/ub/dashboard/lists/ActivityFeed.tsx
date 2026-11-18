import clsx from "clsx";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { focusRing } from "components/ub/recipes";

export interface ActivityFeedItem {
  id: string;
  /** Who did what, e.g. "Fatima Yusuf submitted an application for Ruqayyah Zhang". */
  title: string;
  /** One line: the next step for the reader. */
  nextStep?: string;
  /** ISO date-time. */
  at?: string;
  href?: string;
}

export interface ActivityFeedProps {
  items: ActivityFeedItem[];
  /** Names the list for screen readers. */
  label: string;
  className?: string;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Kuala_Lumpur" });

/** "Today", "Yesterday", "3d ago", then "29 Oct". */
export function activityTime(at: string | undefined, now = Date.now()): string {
  if (!at) return "";
  const time = new Date(at).getTime();
  if (Number.isNaN(time)) return "";
  const days = Math.floor((now - time) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return dateFormat.format(time);
}

/**
 * Recent activity in the list style every home uses: who did what (2 lines
 * at most), the reader's next step on one line, the time on the end. The
 * whole row opens the item.
 */
export default function ActivityFeed({ items, label, className }: ActivityFeedProps) {
  return (
    <ul aria-label={label} className={clsx("flex flex-col divide-y divide-ub-border-subtle", className)}>
      {items.map((item) => {
        const when = activityTime(item.at);
        const body = (
          <>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-ub-label-md text-ub-text-primary" title={item.title}>
                {item.title}
              </p>
              {item.nextStep && (
                <p className="mt-0.5 truncate text-ub-caption text-ub-text-tertiary" title={item.nextStep}>
                  {item.nextStep}
                </p>
              )}
            </div>
            {when && (
              <time dateTime={new Date(item.at!).toISOString()} className="ub-tabular shrink-0 text-ub-caption text-ub-text-tertiary">
                {when}
              </time>
            )}
            {item.href && <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 self-center text-ub-icon rtl:-scale-x-100" />}
          </>
        );
        return (
          <li key={item.id} className="py-1 first:pt-0 last:pb-0">
            {item.href ? (
              <Link
                href={item.href}
                className={clsx(
                  "-mx-2 flex min-h-11 items-start gap-3 rounded-ub-md px-2 py-2 transition-colors duration-ub-fast hover:bg-ub-surface-subtle motion-reduce:transition-none",
                  focusRing
                )}
              >
                {body}
              </Link>
            ) : (
              <div className="flex items-start gap-3 py-2">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
