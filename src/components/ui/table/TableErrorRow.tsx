import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface TableErrorRowProps {
  colSpan: number;
  message?: string;
  onRetry?: () => void;
}

export default function TableErrorRow({
  colSpan,
  message = "Something went wrong while loading this data.",
  onRetry,
}: TableErrorRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-sm font-medium text-slate-900">Something went wrong</p>
          <p className="text-xs text-slate-500">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
