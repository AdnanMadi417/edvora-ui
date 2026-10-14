"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import EmptyData from "components/emptyData/EmptyData";
import Button from "components/ui/buttons/Button";
import type { AsyncStatus } from "./AsyncStatus";

interface AsyncStateViewProps {
  status: AsyncStatus;
  /** Rendered for "loading" — pass a skeleton shaped like the real content,
   *  not a spinner, so there's no layout shift once data arrives. */
  skeleton: React.ReactNode;
  /** A human-readable message (already parsed from the caught error by the
   *  caller, e.g. via parseApiError) — never pass a raw Error/response. */
  errorMessage?: string;
  /** Re-triggers the fetch. Omit to hide the Retry button (rare). */
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
        subtitle={errorMessage || "Please try again."}
        icon={AlertCircle}
        color="red"
        action={
          onRetry && (
            <Button
              onClick={onRetry}
              icon={<RefreshCw className="h-4 w-4" />}
              text="Retry"
              bgColor="bg-white"
              textColor="text-red-600"
              borderColor="border-red-200"
              hoverTextColor="hover:text-red-600"
              hoverBorderColor="hover:border-red-200"
              className="hover:bg-red-50"
            />
          )
        }
      />
    );
  }

  if (status === "empty") {
    return <EmptyData title={emptyTitle} subtitle={emptySubtitle} icon={emptyIcon} color="slate" action={emptyAction} />;
  }

  return <>{children}</>;
}
