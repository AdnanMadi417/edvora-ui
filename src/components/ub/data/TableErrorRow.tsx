import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { buttonBase, buttonSizes, buttonVariants, emptyBody, emptyTitle } from "components/ub/recipes";

interface TableErrorRowProps {
  colSpan: number;
  message?: string;
  onRetry?: () => void;
}

export default function TableErrorRow({
  colSpan,
  message = "We couldn't load this data. Check your connection and try again.",
  onRetry,
}: TableErrorRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div role="alert" className="flex flex-col items-center gap-2">
          <div className="mb-2 grid h-16 w-16 place-items-center rounded-ub-full bg-ub-tone-danger-bg text-ub-tone-danger-text">
            <AlertTriangle className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className={emptyTitle}>Something went wrong</p>
          <p className={`${emptyBody} mx-auto`}>{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={`mt-4 ${buttonBase} ${buttonVariants.secondary} ${buttonSizes.md}`}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
