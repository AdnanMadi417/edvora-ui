import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PrevButton from "components/ui/buttons/PrevButton";
import NextButton from "components/ui/buttons/NextButton";

interface TablePaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  itemCount: number;
  totalCount: number;
  itemLabel: string;
  loading?: boolean;
}

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

  return (
    <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 p-6 text-sm text-slate-500 sm:flex-row">
      {itemCount === 0 && !loading ? (
        <span />
      ) : (
        <span>
          Showing{" "}
          <span className="font-medium text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
          <span className="font-medium text-slate-700">{(currentPage - 1) * itemsPerPage + itemCount}</span> of{" "}
          <span className="font-medium text-slate-700">{displayTotal}</span> {itemLabel}
        </span>
      )}
      <div className="flex items-center gap-2">
        <PrevButton
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          text="Prev"
          icon={<ArrowLeft className="h-4 w-4" />}
        />
        <span>Page {currentPage} of {totalPages}</span>
        <NextButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={itemCount < itemsPerPage}
          text="Next"
          icon={<ArrowRight className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}
