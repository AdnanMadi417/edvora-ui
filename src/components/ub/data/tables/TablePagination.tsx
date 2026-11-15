import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { focusRing } from "components/ub/recipes";
import { getPageRange } from "components/ub/navigation/controls/Pagination";

interface TablePaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  itemCount: number;
  totalCount: number;
  itemLabel: string;
  loading?: boolean;
}

const pageButton = `inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-ub-md px-2 text-ub-label-sm transition-colors hover:bg-ub-action-secondary-hover disabled:pointer-events-none disabled:opacity-40 ${focusRing}`;

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
    <div className="flex items-center justify-between gap-3 border-t border-ub-border bg-ub-surface px-4 py-3 text-ub-body-sm text-ub-text-secondary md:px-6">
      <span className="ub-tabular hidden shrink-0 md:inline" role="status">
        {loading ? "Updating results…" : (
          <>
            <span className="font-medium text-ub-text-primary">{totalCount.toLocaleString()}</span> {itemLabel}
          </>
        )}
      </span>

      <nav aria-label="Pagination" aria-busy={loading || undefined} className="ub-tabular flex w-full items-center justify-between gap-2 md:w-auto md:justify-end">
        <button
          type="button"
          className={`${pageButton} border border-ub-border bg-ub-surface text-ub-text-primary`}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={loading || currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        </button>
        <ul className="hidden items-center gap-1 md:flex">
          {getPageRange(currentPage, totalPages).map((page) => (
            <li key={page}>
              {typeof page === "number" ? (
                <button
                  type="button"
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                  disabled={loading}
                  onClick={() => { if (page !== currentPage) onPageChange(page); }}
                  className={`${pageButton} ${page === currentPage ? "bg-ub-action-primary text-ub-action-primary-text hover:bg-ub-action-primary" : "text-ub-text-secondary"}`}
                >
                  {page}
                </button>
              ) : (
                <span aria-hidden="true" className="inline-flex h-10 min-w-6 items-center justify-center text-ub-text-tertiary">…</span>
              )}
            </li>
          ))}
        </ul>
        <span className="whitespace-nowrap text-ub-caption md:sr-only" aria-live="polite">
          Page <span className="font-medium text-ub-text-primary">{currentPage}</span> of {totalPages}
        </span>
        <button
          type="button"
          className={`${pageButton} border border-ub-border bg-ub-surface text-ub-text-primary`}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={loading || currentPage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
