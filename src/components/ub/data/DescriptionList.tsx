import { ReactNode } from "react";
import clsx from "clsx";

export interface DescriptionItem {
  label: string;
  /** Empty values (null, undefined, "") render the fallback, so layouts don't collapse. */
  value?: ReactNode;
  /** Span the full row in multi-column layouts (e.g. an address). */
  fullWidth?: boolean;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /** 1 (default), 2 or 3 columns from md up; always 1 on mobile. */
  columns?: 1 | 2 | 3;
  /** "stacked": label above value (default). "inline": label and value side by side. */
  layout?: "stacked" | "inline";
  /** Shown for empty values. Default "—". */
  fallback?: ReactNode;
  /** Dividers between rows. */
  divided?: boolean;
  className?: string;
}

const COLS = { 1: "", 2: "md:grid-cols-2", 3: "md:grid-cols-3" } as const;

/**
 * Label–value pairs as a semantic <dl>. Use it for read-only details: the
 * Student profile Overview tab, Advisor and Institution details, application
 * summaries, payout and bank details. Values can be any node (Amount, RefId,
 * AppDate, StageTag…).
 */
export default function DescriptionList({ items, columns = 1, layout = "stacked", fallback = "—", divided = false, className }: DescriptionListProps) {
  return (
    <dl className={clsx("grid grid-cols-1 gap-x-8", COLS[columns], divided ? "gap-y-0" : "gap-y-4", className)}>
      {items.map((item) => {
        const empty = item.value === null || item.value === undefined || item.value === "";
        return (
          <div
            key={item.label}
            className={clsx(
              item.fullWidth && "md:col-span-full",
              layout === "inline" && "flex items-baseline justify-between gap-4",
              divided && "border-b border-ub-border py-3 last:border-0",
            )}
          >
            <dt className={clsx("text-ub-label-sm text-ub-text-tertiary", layout === "inline" && "shrink-0")}>{item.label}</dt>
            <dd className={clsx("text-ub-body-md", empty ? "text-ub-text-disabled" : "text-ub-text-primary", layout === "stacked" ? "mt-1" : "min-w-0 text-end")}>{empty ? fallback : item.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
