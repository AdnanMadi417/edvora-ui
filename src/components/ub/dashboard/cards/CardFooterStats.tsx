import type { ReactNode } from "react";
import clsx from "clsx";

export interface CardFooterStat {
  label: string;
  /** Amount, Numeral or plain text (tabular). */
  value: ReactNode;
}

export interface CardFooterStatsProps {
  /** 2–3 pairs. */
  items: CardFooterStat[];
  className?: string;
}

/** Label/value pairs in a row, separated by hairline dividers (logical, so they mirror in RTL). */
export default function CardFooterStats({ items, className }: CardFooterStatsProps) {
  return (
    <dl className={clsx("grid", items.length === 3 ? "grid-cols-3" : "grid-cols-2", className)}>
      {items.map((item, i) => (
        <div key={item.label} className={clsx("min-w-0 px-3 first:ps-0 last:pe-0", i > 0 && "border-s border-ub-border")}>
          <dt className="truncate text-ub-caption text-ub-text-tertiary">{item.label}</dt>
          <dd className="ub-tabular mt-0.5 truncate text-ub-label-lg text-ub-text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
