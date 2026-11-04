"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import EmptyData from "components/ub/feedback/states/EmptyData";
import { buttonBase, buttonSizes, buttonVariants } from "components/ub/recipes";
import type { AsyncStatus } from "components/ub/feedback/states/AsyncStatus";

interface AsyncStateViewProps {
  status: AsyncStatus;
  /** Rendered for "loading" — pass a skeleton shaped like the real content,
   *  not a spinner, so there's no layout shift once data arrives. */
  skeleton: React.ReactNode;
  /** A human-readable message (already parsed from the caught error by the
   *  caller, e.g. via parseApiError) — never pass a raw Error/response. */
  errorMessage?: string;
  /** Re-triggers the fetch. Omit to hide the "Try again" button (rare). */
  onRetry?: () => void;
  emptyTitle?: string;
  emptySubtitle?: React.ReactNode;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  /** Extra control under the empty message, e.g. an "Add X" button. */
  emptyAction?: React.ReactNode;
  /** Rendered for "success". */
  children: React.ReactNode;
}

/**
 * Wraps a data-fetching screen/section with the four states every such
 * screen needs: loading (skeleton), error (message + Retry), empty
 * (screen-specific message), success (the real content). Doesn't fetch
 * anything itself — derive `status` with getAsyncStatus from whatever hook
 * already loads the data, and pass the existing refetch as onRetry.
 */
export default function AsyncStateView({
  status,
  skeleton,
  errorMessage,
  onRetry,
  emptyTitle = "No data found",
  emptySubtitle,
  emptyIcon,
  emptyAction,
  children,
}: AsyncStateViewProps) {
  if (status === "loading") return <>{skeleton}</>;

  if (status === "error") {
    return (
      <EmptyData
        title="Something went wrong"
        subtitle={errorMessage || "We couldn't load this. Check your connection and try again."}
        icon={AlertCircle}
        color="red"
        action={
          onRetry && (
            <button type="button" onClick={onRetry} className={`${buttonBase} ${buttonVariants.secondary} ${buttonSizes.md}`}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          )
        }
      />
    );
  }

  if (status === "empty") {
    return <EmptyData title={emptyTitle} subtitle={emptySubtitle} icon={emptyIcon} color="blue" action={emptyAction} />;
  }

  return <>{children}</>;
}
