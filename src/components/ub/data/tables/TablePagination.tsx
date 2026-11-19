import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { focusRing } from "components/ub/recipes";

interface TablePaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  itemCount: number;
  totalCount: number;
  itemLabel: string;
  loading?: boolean;
}

// Up to this many pages show one line per page; more read as "Page x of y".
const MAX_LINES = 7;
// Each line is a 44px-tall tap target around a 4px bar.
const lineButton = `group inline-flex h-11 shrink-0 items-center px-1 md:h-10 disabled:pointer-events-none ${focusRing} rounded-ub-xs`;
// Previous / next: quiet icon buttons.
const navButton = `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-ub-full text-ub-text-link transition-colors hover:bg-ub-action-secondary-hover md:h-10 md:w-10 disabled:pointer-events-none disabled:text-ub-text-disabled ${focusRing}`;

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
        {totalPages <= MAX_LINES && (
          <ul className="flex items-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                      page === currentPage ? "w-8 bg-ub-action-primary" : "w-5 bg-ub-chart-track group-hover:bg-ub-text-tertiary"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
        <span className={`whitespace-nowrap text-ub-caption ${totalPages <= MAX_LINES ? "sr-only" : ""}`} aria-live="polite">
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
