"use client";

import { SlidersHorizontal } from "lucide-react";
import { buttonBase, buttonSizes, buttonVariants } from "components/ub/recipes";

export interface FilterButtonProps {
  onClick: () => void;
  /** Active filters; shown as "(2)" in the label and as a badge on phones. */
  count?: number;
  /** Visible label from 640px. Default "Filters". */
  label?: string;
  /** For a panel that opens in place: its open state and id. */
  expanded?: boolean;
  controls?: string;
  className?: string;
}

/**
 * Opens a filter panel. Sits in the same row as the search field: a 44px icon
 * button on phones (with a count badge when filters are on), "Filters (2)"
 * from 640px. The label stays in the accessible name at every width.
 */
export default function FilterButton({ onClick, count = 0, label = "Filters", expanded, controls, className = "" }: FilterButtonProps) {
  const name = count ? `${label} (${count})` : label;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls={controls}
      title={name}
      className={`${buttonBase} ${buttonSizes.md} ${buttonVariants.secondary} relative shrink-0 max-sm:w-11 max-sm:px-0 ${className}`}
    >
      <span className="sr-only sm:not-sr-only sm:truncate">{name}</span>
      <SlidersHorizontal aria-hidden="true" className="h-4 w-4 shrink-0" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="ub-tabular absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-ub-full bg-ub-action-primary px-1 text-[11px] font-semibold leading-none text-ub-action-primary-text sm:hidden"
        >
          {count}
        </span>
      )}
    </button>
  );
}
