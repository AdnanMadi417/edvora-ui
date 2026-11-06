import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonBase, buttonSizes, buttonVariants } from "components/ub/recipes";

interface TablePaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  itemCount: number;
  totalCount: number;
  itemLabel: string;
  loading?: boolean;
}

const pageButton = `${buttonBase} ${buttonVariants.secondary} ${buttonSizes.sm}`;

export default function TablePagination({
  currentPage,
  onPageChange,
  itemsPerPage,
  itemCount,
  totalCount,
  itemLabel,
  loading,
}: TablePaginationProps) {
  const displayTotal = itemCount < itemsPerPage
    ? (currentPage - 1) * itemsPerPage + itemCount
    : totalCount;
  const totalPages = Math.max(Math.ceil(displayTotal / itemsPerPage), 1);
  const first = (currentPage - 1) * itemsPerPage + 1;
  const last = (currentPage - 1) * itemsPerPage + itemCount;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 border-t border-ub-border px-4 py-3 text-ub-body-sm text-ub-text-secondary sm:flex-row md:px-6"
    >
      {itemCount === 0 && !loading ? (
        <span />
      ) : (
        <span className="ub-tabular" aria-live="polite">
          Showing <span className="font-medium text-ub-text-primary">{first.toLocaleString()}</span>–
          <span className="font-medium text-ub-text-primary">{last.toLocaleString()}</span> of{" "}
          <span className="font-medium text-ub-text-primary">{displayTotal.toLocaleString()}</span> {itemLabel}
        </span>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={pageButton}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          Previous
        </button>
        <span className="ub-tabular whitespace-nowrap">
          Page <span className="font-medium text-ub-text-primary">{currentPage}</span> of {totalPages}
        </span>
        <button
          type="button"
          className={pageButton}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || itemCount < itemsPerPage}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
