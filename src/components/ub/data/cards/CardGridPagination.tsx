"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import NextButton from "components/ub/core/buttons/NextButton";
import PrevButton from "components/ub/core/buttons/PrevButton";

export interface CardGridPaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalCount: number;
  /** Plural noun for the count, e.g. "programs". */
  itemLabel: string;
}

/**
 * The footer under every Advisor card grid (programs, universities, language
 * centres): "Showing 1 to 9 of 21 programs" on the start, Prev · Page 1 of 3 ·
 * Next on the end. Card grids use 9 per page (three rows of three).
 */
export default function CardGridPagination({ currentPage, onPageChange, itemsPerPage, totalCount, itemLabel }: CardGridPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const from = totalCount ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const to = Math.min(currentPage * itemsPerPage, totalCount);
  return (
    <div className="grid grid-cols-1 items-center gap-4 border-t border-ub-border p-4 sm:p-6 md:flex md:justify-between">
      <p className="ub-tabular flex flex-wrap items-center gap-1 text-sm font-medium text-ub-text-secondary" role="status">
        Showing <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> of{" "}
        <span className="font-medium">{totalCount}</span> {itemLabel}
      </p>
      <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
        <PrevButton
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage <= 1}
          text="Prev"
          icon={<ArrowLeft className="h-4 w-4" />}
        />
        <span className="ub-tabular px-3 py-1 font-medium text-ub-text-secondary" aria-live="polite">
          Page {currentPage} of {totalPages}
        </span>
        <NextButton
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage >= totalPages}
          text="Next"
          icon={<ArrowRight className="h-4 w-4" />}
        />
      </nav>
    </div>
  );
}
