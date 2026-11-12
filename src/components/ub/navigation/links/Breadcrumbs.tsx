"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import { ChevronRight, Ellipsis } from "lucide-react";
import clsx from "clsx";
import { focusRing } from "components/ub/recipes";
import ContextMenu from "components/ub/navigation/menus/ContextMenu";

export interface BreadcrumbItem {
  label: string;
  /** Omit on the last (current) item. */
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Accessible name for the nav landmark. */
  "aria-label"?: string;
  className?: string;
}

// Local constants.
const crumbLink = `-my-0.5 max-w-[16rem] truncate rounded-ub-xs py-0.5 text-ub-body-sm text-ub-text-secondary underline-offset-2 transition-colors duration-ub-fast ease-ub-standard hover:text-ub-text-primary hover:underline ${focusRing}`;
const crumbCurrent = "max-w-[16rem] truncate text-ub-body-sm font-medium text-ub-text-primary";

function Separator({ className }: { className?: string }) {
  // Chevron mirrors in RTL (brief §4.7, §4.8).
  return <ChevronRight aria-hidden="true" className={clsx("h-4 w-4 shrink-0 text-ub-text-tertiary rtl:-scale-x-100", className)} />;
}

/**
 * Breadcrumbs (brief §4.7). The last item is the current page
 * (aria-current="page"). Below sm, middle items collapse into a "…" menu.
 */
export default function Breadcrumbs({ items, "aria-label": ariaLabel = "Breadcrumb", className }: BreadcrumbsProps) {
  if (items.length === 0) return null;
  const lastIndex = items.length - 1;
  const middle = items.slice(1, lastIndex);
  const collapsible = middle.length > 0;

  return (
    <nav aria-label={ariaLabel} className={clsx("min-w-0", className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === lastIndex;
          const isMiddle = i > 0 && !isLast;
          return (
            <Fragment key={`${item.label}-${i}`}>
              {/* Collapsed middle items: a menu that is only shown below sm. */}
              {i === 1 && collapsible && (
                <li className="flex items-center gap-1.5 sm:hidden">
                  <ContextMenu
                    label="Hidden breadcrumbs"
                    align="start"
                    items={middle.map((m) => ({ label: m.label, href: m.href }))}
                    trigger={
                      <button
                        type="button"
                        aria-label={`Show ${middle.length} more ${middle.length === 1 ? "level" : "levels"}`}
                        className={clsx("grid h-6 w-6 place-items-center rounded-ub-full text-ub-text-secondary hover:bg-ub-surface-subtle", focusRing)}
                      >
                        <Ellipsis className="h-4 w-4" aria-hidden="true" />
                      </button>
                    }
                  />
                  <Separator />
                </li>
              )}
              {/* Only the current page shrinks and truncates; links keep their width so the row wraps instead of squeezing them. */}
              <li className={clsx("items-center gap-1.5", isLast ? "min-w-0" : "shrink-0", isMiddle ? "hidden sm:flex" : "flex")}>
                {isLast ? (
                  <span aria-current="page" className={crumbCurrent} title={item.label}>
                    {item.label}
                  </span>
                ) : item.href ? (
                  <Link href={item.href} className={crumbLink} title={item.label}>
                    {item.label}
                  </Link>
                ) : (
                  <span className="max-w-[16rem] truncate text-ub-body-sm text-ub-text-secondary">{item.label}</span>
                )}
                {!isLast && <Separator />}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
