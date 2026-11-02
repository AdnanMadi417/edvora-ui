import clsx from "clsx";
import { CircleAlert, Inbox, RotateCw } from "lucide-react";
import Skeleton from "components/ub/feedback/Skeleton";
import { buttonBase, buttonSizes, buttonVariants } from "components/ub/recipes";
import type { WidgetState } from "./types";

export interface WidgetStatusProps {
  state: Exclude<WidgetState, "ready">;
  /** Skeleton shape while loading. Default "lines". */
  skeleton?: "lines" | "chart" | "list" | "stat";
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Loading, empty and error content for a widget, sized like the real thing
 * so nothing jumps when data arrives. Loading is announced as busy; errors
 * use role="alert".
 */
export default function WidgetStatus({ state, skeleton = "lines", emptyMessage = "Nothing to show yet.", errorMessage = "This couldn't load.", onRetry, className }: WidgetStatusProps) {
  if (state === "loading") {
    return (
      <div role="status" aria-label="Loading" aria-busy="true" className={className}>
        {skeleton === "chart" && (
          <div className="flex h-40 items-end gap-3">
            {[40, 70, 55, 90, 65, 45, 80].map((h, i) => (
              <Skeleton key={i} className={clsx("flex-1 rounded-ub-full", ["h-1/3", "h-2/3", "h-1/2", "h-5/6", "h-3/5", "h-2/5", "h-3/4"][i])} />
            ))}
          </div>
        )}
        {skeleton === "stat" && (
          <div className="grid gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        )}
        {skeleton === "list" && (
          <div className="grid gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-ub-md" />
                <div className="grid flex-1 gap-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}
        {skeleton === "lines" && (
          <div className="grid gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}
      </div>
    );
  }
  if (state === "error") {
    return (
      <div role="alert" className={clsx("flex flex-col items-start gap-3 rounded-ub-md border border-ub-tone-danger-border bg-ub-tone-danger-bg p-4", className)}>
        <p className="flex items-start gap-2 text-ub-body-sm text-ub-tone-danger-text">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
        {onRetry && (
          <button type="button" onClick={onRetry} className={clsx(buttonBase, buttonSizes.sm, buttonVariants.secondary)}>
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
        )}
      </div>
    );
  }
  return (
    <div className={clsx("flex flex-col items-center justify-center gap-2 rounded-ub-md bg-ub-surface-subtle px-4 py-8 text-center", className)}>
      <Inbox className="h-6 w-6 text-ub-icon" aria-hidden="true" />
      <p className="text-ub-body-sm text-ub-text-secondary">{emptyMessage}</p>
    </div>
  );
}

/** Pure: the state a widget shows (explicit state wins; no data means empty). */
export function resolveWidgetState(state: WidgetState | undefined, hasData: boolean): WidgetState {
  if (state && state !== "ready") return state;
  return hasData ? "ready" : "empty";
}
