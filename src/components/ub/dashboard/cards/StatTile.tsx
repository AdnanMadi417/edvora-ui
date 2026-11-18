"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { focusRing } from "components/ub/recipes";
import Skeleton from "components/ub/feedback/states/Skeleton";
import DeltaPill, { type DeltaPillProps } from "../shared/DeltaPill";
import IconTile, { type IconTileTone } from "../shared/IconTile";
import type { IconComponent } from "../types";

export interface StatTileProps {
  label: string;
  /** The figure: a number, Amount or Numeral (tabular). */
  value: ReactNode;
  /** Change pill beside the value. Leave it out when there is no real comparison. */
  delta?: Pick<DeltaPillProps, "value" | "unit" | "goodWhen" | "comparedTo">;
  icon?: IconComponent;
  iconTone?: IconTileTone;
  /** The footer line: an optional bold figure, then words, e.g. { value: "+7", text: "vs last 7 days" }. */
  footer?: { value?: ReactNode; text: ReactNode };
  /** Opens the filtered list; the footer becomes a link with an arrow on the end. */
  href?: string;
  /** Accessible name for the footer link; defaults to "Open {label}". */
  linkLabel?: string;
  state?: "ready" | "loading" | "error";
  errorMessage?: string;
  onRetry?: () => void;
  /** Heading level of the label. */
  as?: "h2" | "h3" | "h4";
  className?: string;
}

/**
 * KPI tile: a tray with the stat card inside (label, big tabular value, change
 * pill, icon on the end) and a footer line under it that links to the list
 * behind the number. Values in the tile and on the page behind it must agree.
 */
export default function StatTile({
  label,
  value,
  delta,
  icon,
  iconTone = "brand",
  footer,
  href,
  linkLabel,
  state = "ready",
  errorMessage = "Couldn't load this number.",
  onRetry,
  as: Heading = "h3",
  className,
}: StatTileProps) {
  const footerBody = (
    <>
      <span className="line-clamp-2 min-w-0 flex-1 break-words text-ub-body-sm text-ub-text-secondary sm:line-clamp-1">
        {footer?.value != null && <span className="ub-tabular me-1 text-ub-label-md text-ub-text-primary">{footer.value}</span>}
        {footer?.text}
      </span>
      {href && <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-ub-icon transition-transform duration-ub-fast group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5 motion-reduce:transition-none" />}
    </>
  );
  const footerClass = "flex min-h-11 items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4";

  return (
    <section
      aria-busy={state === "loading" || undefined}
      data-ub-stat-tile
      className={clsx("flex min-w-0 flex-col rounded-ub-lg border border-ub-border bg-ub-surface-subtle p-1.5", className)}
    >
      <div className="flex min-w-0 items-start justify-between gap-3 rounded-ub-md border border-ub-border bg-ub-surface p-3 sm:p-4">
        <div className="min-w-0 flex-1">
          <Heading className="line-clamp-2 break-words text-ub-label-md text-ub-text-secondary sm:line-clamp-1" title={label}>
            {label}
          </Heading>
          {state === "loading" ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : state === "error" ? (
            <p role="alert" className="mt-2 text-ub-body-sm text-ub-tone-danger-text">
              {errorMessage}{" "}
              {onRetry && (
                <button type="button" onClick={onRetry} className={`min-h-11 rounded-ub-xs text-ub-label-sm text-ub-text-link underline ${focusRing}`}>
                  Try again
                </button>
              )}
            </p>
          ) : (
            <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="ub-tabular text-ub-data-lg text-ub-text-primary">{value}</span>
              {delta && <DeltaPill {...delta} />}
            </p>
          )}
        </div>
        {/* Phones in a 2×2 grid need the room for the label and value. */}
        {icon && <IconTile icon={icon} tone={iconTone} size="md" className="hidden sm:grid" />}
      </div>

      {(footer || href) &&
        (href ? (
          <Link href={href} aria-label={linkLabel ?? `Open ${label}`} className={clsx("group rounded-ub-md hover:text-ub-text-primary", footerClass, focusRing)}>
            {footerBody}
          </Link>
        ) : (
          <div className={footerClass}>{footerBody}</div>
        ))}
    </section>
  );
}
