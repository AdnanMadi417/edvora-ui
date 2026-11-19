import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { focusRing, buttonBase, buttonVariants } from "components/ub/recipes";

interface TablePaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  itemCount: number;
  totalCount: number;
  itemLabel: string;
  loading?: boolean;
}

// At most three small lines: the pages around the current one.
const MAX_LINES = 3;
// Each line is a 44px-tall tap target around a 4px bar.
const lineButton = `group inline-flex h-11 shrink-0 items-center px-0.5 md:h-10 disabled:pointer-events-none ${focusRing} rounded-ub-xs`;
// Previous / next: the brand's secondary pill as a circle (blue outline), 44px on phones.
const navButton = `${buttonBase} ${buttonVariants.secondary} h-11 w-11 shrink-0 p-0 md:h-10 md:w-10 disabled:pointer-events-none disabled:opacity-40`;

export default function TablePagination({
  currentPage,
  onPageChange,
  itemsPerPage,
  totalCount,
  itemLabel,
  loading,
}: TablePaginationProps) {
  const totalPages = Math.max(Math.ceil(totalCount / itemsPerPage), 1);

  return (
    <div className="ub-table-pagination flex items-center justify-between gap-3 border-t border-ub-border bg-ub-surface px-4 py-3 text-ub-body-sm text-ub-text-secondary max-md:border-t-0 max-md:bg-transparent max-md:px-1 md:px-6">
      {/* The one place a table states its count (the toolbar above doesn't repeat it). */}
      <span className="ub-tabular shrink-0" role="status">
        {loading ? "Updating results…" : (
          <>
            <span className="font-medium text-ub-text-primary">{totalCount.toLocaleString()}</span> {itemLabel}
          </>
        )}
      </span>

      {/* One page: just the count, no arrows and no lone "1". */}
      {totalPages > 1 && (
      <nav aria-label="Pagination" aria-busy={loading || undefined} className="ub-tabular flex items-center justify-end gap-2">
        <button
          type="button"
          className={navButton}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={loading || currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        </button>
        <ul className="flex items-center">
            {linePages(currentPage, totalPages).map((page) => (
              <li key={page}>
                <button
                  type="button"
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                  disabled={loading}
                  onClick={() => { if (page !== currentPage) onPageChange(page); }}
                  className={lineButton}
                >
                  <span
                    aria-hidden="true"
                    className={`block h-1 rounded-ub-full transition-[width,background-color] duration-ub-fast motion-reduce:transition-none ${
                      page === currentPage ? "w-4 bg-ub-action-primary" : "w-4 bg-ub-chart-track group-hover:bg-ub-text-tertiary"
                    }`}
                  />
                </button>
              </li>
            ))}
        </ul>
        <span className="sr-only" aria-live="polite">
          Page <span className="font-medium text-ub-text-primary">{currentPage}</span> of {totalPages}
        </span>
        <button
          type="button"
          className={navButton}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={loading || currentPage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        </button>
      </nav>
      )}
    </div>
  );
}

/** Up to three pages: the current one and its neighbours, kept inside 1…total. */
export function linePages(current: number, total: number): number[] {
  const count = Math.min(MAX_LINES, total);
  const start = Math.min(Math.max(1, current - 1), total - count + 1);
  return Array.from({ length: count }, (_, i) => start + i);
}
