"use client";

import { useId, type ReactNode } from "react";
import { AlertCircle, ChevronDown, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { focusRingInset } from "components/ub/recipes";

export interface CollapsibleSectionProps {
  icon: LucideIcon;
  title: string;
  /** One line under the title while closed, so the reader knows what's inside. */
  summary?: string;
  /** Marks the section when one of its fields has an error. */
  hasError?: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/** A form section that opens and closes. Long forms start with the first one open
 *  and the rest closed; open sections that hold an error before showing errors. */
export default function CollapsibleSection({
  icon: Icon,
  title,
  summary,
  hasError = false,
  open,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  const panelId = useId();
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-ub-lg border bg-ub-surface",
        hasError ? "border-ub-tone-danger-border" : "border-ub-border"
      )}
    >
      {/* Accordion pattern: the toggle sits inside a heading so sections show in heading navigation. */}
      <h3>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={clsx(
          "flex w-full items-center gap-3 px-4 py-4 text-start transition-colors duration-ub-fast hover:bg-ub-surface-subtle md:px-6",
          focusRingInset
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            "grid h-9 w-9 shrink-0 place-items-center rounded-ub-md",
            hasError ? "bg-ub-tone-danger-bg text-ub-tone-danger-text" : "bg-ub-tone-brand-bg text-ub-tone-brand-text"
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-ub-label-md text-ub-text-primary">{title}</span>
          {!open && summary && (
            <span className="mt-0.5 block truncate text-ub-caption text-ub-text-secondary">{summary}</span>
          )}
        </span>
        {hasError && !open && (
          <span className="flex shrink-0 items-center gap-1 text-ub-caption font-medium text-ub-tone-danger-text">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Needs attention
          </span>
        )}
        <ChevronDown
          aria-hidden="true"
          className={clsx(
            "h-4 w-4 shrink-0 text-ub-icon-default transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-180"
          )}
        />
      </button>
      </h3>
      {open && (
        <div id={panelId} className="space-y-4 border-t border-ub-border px-4 py-6 md:px-6">
          {children}
        </div>
      )}
    </div>
  );
}
