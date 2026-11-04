"use client";

import {
  forwardRef,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import clsx from "clsx";
import {
  Building2,
  Check,
  CheckCircle2,
  CircleAlert,
  XCircle,
} from "lucide-react";
import { focusRing } from "components/ub/recipes";

export type Decision = "approved" | "rejected";

export interface ApproveRejectToggleProps {
  /** The recorded decision; null until one is chosen. */
  value: Decision | null;
  onChange: (value: Decision) => void;
  disabled?: boolean;
  /** Accessible name for the radio group. Default "Decision". */
  label?: string;
  /** card (default): tall cards with icon and optional description · compact: one 40px segmented row for dense forms. */
  variant?: "card" | "compact";
  /** Option labels, verb first. Defaults "Approve" / "Reject". */
  approveLabel?: string;
  rejectLabel?: string;
  /** One line under each label (card variant), naming what the choice does. */
  approveDescription?: ReactNode;
  rejectDescription?: ReactNode;
  /** Validation message, e.g. "Choose approve or reject." Marks the group invalid. */
  error?: ReactNode;
  required?: boolean;
  /** The entity being decided on, shown above the options. */
  companyName?: string;
  /** Label above `companyName`. Default "Stakeholder". */
  subjectLabel?: string;
  /** Layout only. */
  className?: string;
}

const TONE: Record<
  Decision,
  { selected: string; hover: string; icon: string; marker: string }
> = {
  approved: {
    selected:
      "border-ub-tone-success-border bg-ub-tone-success-bg text-ub-tone-success-text",
    hover: "hover:border-ub-tone-success-border hover:bg-ub-tone-success-bg",
    icon: "text-ub-tone-success-text",
    marker: "border-transparent bg-ub-success-600 text-ub-text-on-action",
  },
  rejected: {
    selected:
      "border-ub-tone-danger-border bg-ub-tone-danger-bg text-ub-tone-danger-text",
    hover: "hover:border-ub-tone-danger-border hover:bg-ub-tone-danger-bg",
    icon: "text-ub-tone-danger-text",
    marker: "border-transparent bg-ub-danger-600 text-ub-text-on-action",
  },
};

const transition =
  "transition-[background-color,border-color,color,box-shadow] duration-ub-fast ease-ub-standard motion-reduce:transition-none";

/**
 * Approve / reject decision (brief §4.1, §9). One single-choice radio group:
 * Tab reaches it once, arrow keys (mirrored in RTL), Home and End move and
 * select. Selected options use the tinted tone with a 2px border and a check
 * marker; color is never the only signal, and solid destructive fills stay
 * reserved for the confirmation dialog that commits the decision.
 */
const ApproveRejectToggle = forwardRef<
  HTMLDivElement,
  ApproveRejectToggleProps
>(function ApproveRejectToggle(
  {
    value,
    onChange,
    disabled = false,
    label = "Decision",
    variant = "card",
    approveLabel = "Approve",
    rejectLabel = "Reject",
    approveDescription,
    rejectDescription,
    error,
    required = false,
    companyName,
    subjectLabel = "Stakeholder",
    className,
  },
  ref
) {
  const errorId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const compact = variant === "compact";
  const options: {
    value: Decision;
    label: string;
    description?: ReactNode;
    icon: typeof CheckCircle2;
  }[] = [
    {
      value: "approved",
      label: approveLabel,
      description: approveDescription,
      icon: CheckCircle2,
    },
    {
      value: "rejected",
      label: rejectLabel,
      description: rejectDescription,
      icon: XCircle,
    },
  ];

  const select = (index: number) => {
    const i = (index + options.length) % options.length;
    onChange(options[i].value);
    refs.current[i]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    if (e.key === "ArrowDown" || e.key === (rtl ? "ArrowLeft" : "ArrowRight"))
      select(index + 1);
    else if (
      e.key === "ArrowUp" ||
      e.key === (rtl ? "ArrowRight" : "ArrowLeft")
    )
      select(index - 1);
    else if (e.key === "Home") select(0);
    else if (e.key === "End") select(options.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div ref={ref} className={clsx("grid gap-3", className)}>
      {companyName && (
        <div className="flex items-center gap-2 rounded-ub-md border border-ub-border bg-ub-surface-subtle px-3 py-2">
          <Building2
            className="h-4 w-4 shrink-0 text-ub-icon"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-ub-label-sm text-ub-text-tertiary">
              {subjectLabel}
            </p>
            <p className="truncate text-ub-label-md text-ub-text-primary">
              {companyName}
            </p>
          </div>
        </div>
      )}

      <div
        role="radiogroup"
        aria-label={label}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-disabled={disabled || undefined}
        className={clsx(
          compact
            ? "inline-grid max-w-full justify-self-start grid-cols-2 gap-1 rounded-ub-full border border-ub-border bg-ub-surface-subtle p-1"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2"
        )}
      >
        {options.map((o, i) => {
          const selected = value === o.value;
          // Roving tab index: the chosen option, or the first when nothing is chosen.
          const tabbable = selected || (value === null && i === 0);
          const tone = TONE[o.value];
          const Icon = o.icon;
          // Exactly one border/background set per state so utilities never compete.
          const idleCard = disabled
            ? "border-ub-border bg-ub-disabled text-ub-text-disabled"
            : clsx(
                "bg-ub-surface text-ub-text-primary",
                error ? "border-ub-tone-danger-border" : "border-ub-border",
                tone.hover
              );
          return (
            <button
              key={o.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={tabbable ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(o.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={clsx(
                focusRing,
                transition,
                "relative text-start disabled:cursor-not-allowed",
                compact
                  ? clsx(
                      "inline-flex h-8 items-center justify-center gap-2 rounded-ub-full border px-4 text-ub-label-md",
                      selected
                        ? clsx(tone.selected, "shadow-ub-xs")
                        : clsx(
                            "border-transparent",
                            disabled
                              ? "text-ub-text-disabled"
                              : "text-ub-text-secondary hover:bg-ub-action-ghost-hover hover:text-ub-text-primary"
                          )
                    )
                  : clsx(
                      "flex min-h-24 flex-col gap-3 rounded-ub-lg border-ub-strong p-4",
                      selected ? tone.selected : idleCard
                    ),
                disabled && selected && "opacity-70"
              )}
            >
              {compact ? (
                <>
                  <Icon
                    className={clsx(
                      "h-4 w-4 shrink-0",
                      selected || !disabled
                        ? tone.icon
                        : "text-ub-text-disabled"
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{o.label}</span>
                </>
              ) : (
                <>
                  {/* Icon and radio marker share the top row, so the label and description always get the full width. */}
                  <span className="flex items-center justify-between gap-3">
                    <Icon
                      className={clsx(
                        "h-6 w-6 shrink-0",
                        selected || !disabled
                          ? tone.icon
                          : "text-ub-text-disabled"
                      )}
                      aria-hidden="true"
                    />
                    <span
                      aria-hidden="true"
                      className={clsx(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-ub-full border",
                        selected
                          ? tone.marker
                          : "border-ub-border-control bg-ub-surface"
                      )}
                    >
                      {selected && (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      )}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-ub-label-lg">{o.label}</span>
                    {o.description && (
                      <span
                        className={clsx(
                          "mt-1 block text-ub-body-sm",
                          selected ? "opacity-90" : "text-ub-text-secondary"
                        )}
                      >
                        {o.description}
                      </span>
                    )}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p
          id={errorId}
          className="flex items-start gap-1.5 text-ub-body-sm text-ub-tone-danger-text"
        >
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
});

export default ApproveRejectToggle;
