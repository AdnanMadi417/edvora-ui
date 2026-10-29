"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { buttonBase, buttonSizes, buttonVariants, focusRing } from "components/ub/recipes";

export type PageRangeItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * Page numbers to show, with ellipses: always the first and last page, the
 * current page and `siblingCount` pages either side.
 * getPageRange(5, 12) → [1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 12]
 */
export function getPageRange(page: number, pageCount: number, siblingCount = 1): PageRangeItem[] {
  const count = Math.max(0, Math.floor(pageCount));
  if (count === 0) return [];
  const current = Math.min(Math.max(1, page), count);
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

  // first + last + current + siblings + 2 ellipses
  const totalSlots = siblingCount * 2 + 5;
  if (count <= totalSlots) return range(1, count);

  const left = Math.max(current - siblingCount, 1);
  const right = Math.min(current + siblingCount, count);
  // An ellipsis only ever stands for 2+ pages; a lone hidden page is shown instead.
  const showStart = left > 3;
  const showEnd = right < count - 2;
  const edgeCount = 3 + siblingCount * 2;

  if (!showStart && showEnd) return [...range(1, edgeCount), "ellipsis-end", count];
  if (showStart && !showEnd) return [1, "ellipsis-start", ...range(count - edgeCount + 1, count)];
  return [1, "ellipsis-start", ...range(left, right), "ellipsis-end", count];
}

export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Pages shown either side of the current page (default 1). */
  siblingCount?: number;
  /** Just Previous / "Page x of y" / Next. Full mode also falls back to this below sm. */
  compact?: boolean;
  "aria-label"?: string;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

// Local constants: 32px circular page buttons; current page uses the primary fill.
const pageButton = `inline-flex h-8 min-w-8 items-center justify-center rounded-ub-full px-2 text-ub-label-md transition-colors duration-ub-fast ease-ub-standard ${focusRing}`;
const pageIdle = "text-ub-text-primary hover:bg-ub-action-secondary-hover";
const pageCurrent = "bg-ub-action-primary text-ub-action-primary-text";
const navButton = `${buttonBase} ${buttonSizes.sm} ${buttonVariants.secondary}`;

/**
 * Pagination (brief §4.6, §6): Previous / numbered pages with ellipsis / Next,
 * tabular numerals, aria-current on the current page and a polite live
 * "Page x of y" status.
 */
export default function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  compact = false,
  "aria-label": ariaLabel = "Pagination",
  previousLabel = "Previous",
  nextLabel = "Next",
  className,
}: PaginationProps) {
  const total = Math.max(1, Math.floor(pageCount));
  const current = Math.min(Math.max(1, page), total);
  const go = (p: number) => {
    if (p >= 1 && p <= total && p !== current) onPageChange(p);
  };

  return (
    <nav aria-label={ariaLabel} className={clsx("ub-tabular flex items-center justify-between gap-3 sm:justify-center", className)}>
      <button type="button" className={navButton} onClick={() => go(current - 1)} disabled={current <= 1}>
        <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        {previousLabel}
      </button>

      {!compact && (
        <ul className="hidden items-center gap-1 sm:flex">
          {getPageRange(current, total, siblingCount).map((item) =>
            typeof item === "number" ? (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => go(item)}
                  aria-label={`Page ${item}`}
                  aria-current={item === current ? "page" : undefined}
                  className={clsx(pageButton, item === current ? pageCurrent : pageIdle)}
                >
                  {item}
                </button>
              </li>
            ) : (
              <li key={item} aria-hidden="true" className="inline-flex h-8 min-w-8 items-center justify-center text-ub-body-sm text-ub-text-tertiary">
                …
              </li>
            ),
          )}
        </ul>
      )}

      <span aria-live="polite" className={clsx("whitespace-nowrap text-ub-body-sm text-ub-text-secondary", !compact && "sm:sr-only")}>
        Page <span className="font-medium text-ub-text-primary">{current}</span> of {total}
      </span>

      <button type="button" className={navButton} onClick={() => go(current + 1)} disabled={current >= total}>
        {nextLabel}
        <ChevronRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
      </button>
    </nav>
  );
}
