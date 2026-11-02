import { forwardRef, type ComponentType, type ReactNode } from "react";
import clsx from "clsx";
import { RotateCw } from "lucide-react";
import {
  buttonBase,
  buttonSizes,
  buttonVariants,
  card,
} from "components/ub/recipes";
import Skeleton from "components/ub/feedback/Skeleton";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export type SectionCardState = "ready" | "loading" | "empty" | "error";

export interface SectionCardEmpty {
  icon?: IconComponent;
  title: string;
  description?: string;
}

export interface SectionCardProps {
  /** Card heading (heading-md). */
  title: ReactNode;
  /** One line under the heading. */
  description?: ReactNode;
  /** Header actions on the end side: a TextButton, IconButton or Tag. */
  action?: ReactNode;
  /** Heading level for the title. Default h3. */
  as?: "h2" | "h3" | "h4";
  /** ready (default) shows children; the other states replace the body. */
  state?: SectionCardState;
  /** Skeleton rows while loading. Default 3. */
  loadingRows?: number;
  /** Shown when state is "empty". */
  empty?: SectionCardEmpty;
  /** Shown when state is "error". */
  errorMessage?: string;
  /** Adds a "Try again" button to the error state. */
  onRetry?: () => void;
  /** Footer row under the body, e.g. "Tracked automatically". */
  footer?: ReactNode;
  /** Removes body padding so a List or table can run edge to edge. */
  flush?: boolean;
  children?: ReactNode;
  /** Layout only (grid placement, margins). */
  className?: string;
  id?: string;
}

/**
 * Card with a header and the four data states (brief §4.4, §4.7): radius 12,
 * 1px border, solid surface, no resting shadow, padding 24 (16 on mobile).
 * Use it for every read-only block on a detail page so loading, empty and
 * error look the same everywhere.
 */
const SectionCard = forwardRef<HTMLElement, SectionCardProps>(
  function SectionCard(
    {
      title,
      description,
      action,
      as: Heading = "h3",
      state = "ready",
      loadingRows = 3,
      empty,
      errorMessage,
      onRetry,
      footer,
      flush = false,
      children,
      className,
      id,
    },
    ref
  ) {
    const pad = "px-4 md:px-6";
    // A header-only card (title, description, action) has no body to pad.
    const hasBody =
      state !== "ready" ||
      (children !== undefined && children !== null && children !== false);
    return (
      <section
        ref={ref}
        id={id}
        aria-busy={state === "loading" || undefined}
        className={clsx(card, "flex min-w-0 flex-col", className)}
      >
        <header
          className={clsx(
            pad,
            "flex items-start justify-between gap-4 pt-4 md:pt-6",
            !hasBody && "pb-4 md:pb-6"
          )}
        >
          <div className="min-w-0">
            <Heading className="text-ub-heading-md text-ub-text-primary">
              {title}
            </Heading>
            {description && (
              <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
                {description}
              </p>
            )}
          </div>
          {action && state === "ready" && (
            <div className="flex shrink-0 items-center gap-2">{action}</div>
          )}
        </header>

        {hasBody && (
          <div
            className={clsx("min-w-0 flex-1 pb-4 pt-4 md:pb-6", !flush && pad)}
          >
            {state === "loading" && (
              <div
                className={clsx("grid gap-3", flush && pad)}
                role="status"
                aria-label="Loading"
              >
                {Array.from({ length: loadingRows }, (_, i) => (
                  <Skeleton
                    key={i}
                    className={clsx("h-5", i % 2 ? "w-2/3" : "w-full")}
                  />
                ))}
              </div>
            )}

            {state === "empty" && empty && (
              <div
                className={clsx(
                  "flex items-start gap-3 rounded-ub-md bg-ub-surface-subtle p-4",
                  flush && "mx-4 md:mx-6"
                )}
              >
                {empty.icon && (
                  <empty.icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-ub-icon"
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-ub-label-md text-ub-text-primary">
                    {empty.title}
                  </p>
                  {empty.description && (
                    <p className="mt-0.5 text-ub-body-sm text-ub-text-secondary">
                      {empty.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {state === "error" && (
              <div
                role="alert"
                className={clsx(
                  "flex flex-wrap items-center justify-between gap-3 rounded-ub-md border border-ub-tone-danger-border bg-ub-tone-danger-bg p-4",
                  flush && "mx-4 md:mx-6"
                )}
              >
                <p className="min-w-0 text-ub-body-sm text-ub-tone-danger-text">
                  {errorMessage ?? "This section couldn't load."}
                </p>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className={clsx(
                      buttonBase,
                      buttonSizes.sm,
                      buttonVariants.secondary
                    )}
                  >
                    <RotateCw className="h-4 w-4" aria-hidden="true" />
                    Try again
                  </button>
                )}
              </div>
            )}

            {state === "ready" && children}
          </div>
        )}

        {footer && state === "ready" && (
          <footer
            className={clsx(
              pad,
              "border-t border-ub-border py-3 text-ub-body-sm text-ub-text-secondary"
            )}
          >
            {footer}
          </footer>
        )}
      </section>
    );
  }
);

export default SectionCard;
