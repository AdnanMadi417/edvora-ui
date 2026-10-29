"use client";

import React, { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { focusRing } from "components/ub/recipes";

export type ChipSize = "sm" | "md";

const chipShell =
  "inline-flex shrink-0 items-center whitespace-nowrap rounded-ub-full border text-ub-label-md transition-[background-color,border-color,color] duration-ub-fast ease-ub-standard motion-reduce:transition-none";
const chipIdle = "border-ub-border-control bg-ub-surface text-ub-text-primary";
const chipOn = "border-ub-action-primary bg-ub-selected text-ub-text-link";
const chipSizes: Record<ChipSize, string> = { sm: "h-8", md: "h-10" };
const chipPad: Record<ChipSize, string> = { sm: "px-3", md: "px-4" };

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "children"> {
  children: ReactNode;
  /** Pressed state. When set (or `onSelectedChange` is passed) the chip is a toggle button. */
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Adds a remove (×) button after the label. */
  onRemove?: () => void;
  /** Accessible name for the remove button. Defaults to "Remove <label>" when the label is a string. */
  removeLabel?: string;
  /** Leading icon (16px). Replaced by a check while selected. */
  icon?: ReactNode;
  size?: ChipSize;
}

/**
 * Selectable chip (brief §4.2 intake chips, filters): a pill toggle with
 * aria-pressed. Selected shows a check as well as the colour change.
 * With `onRemove` it gets a separate × button (never nested in the toggle).
 */
export default function Chip({
  children,
  selected,
  onSelectedChange,
  onRemove,
  removeLabel,
  icon,
  size = "sm",
  disabled,
  className,
  onClick,
  ...rest
}: ChipProps) {
  const toggleable = selected !== undefined || onSelectedChange !== undefined;
  const on = !!selected;
  const lead = on ? <Check aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} /> : icon;
  const tone = disabled
    ? "cursor-not-allowed border-ub-border bg-ub-disabled text-ub-text-disabled"
    : on
      ? chipOn
      : `${chipIdle} hover:border-ub-border-control-hover hover:bg-ub-surface-subtle`;
  const removeName = removeLabel ?? (typeof children === "string" ? `Remove ${children}` : "Remove");

  const label = (
    <>
      {lead && <span className="flex shrink-0 items-center [&>svg]:h-4 [&>svg]:w-4">{lead}</span>}
      <span>{children}</span>
    </>
  );

  const removeButton = onRemove && (
    <button
      type="button"
      onClick={onRemove}
      disabled={disabled}
      aria-label={removeName}
      className={`me-1 grid h-6 w-6 shrink-0 place-items-center rounded-ub-full text-current hover:bg-ub-action-secondary-hover disabled:cursor-not-allowed ${focusRing}`}
    >
      <X aria-hidden="true" className="h-3.5 w-3.5" />
    </button>
  );

  if (!toggleable) {
    // Static removable chip: the label is plain text, only × is interactive.
    return (
      <span className={`${chipShell} ${chipSizes[size]} ${tone} gap-1.5 ${onRemove ? "ps-3" : chipPad[size]} ${className ?? ""}`}>
        {label}
        {removeButton}
      </span>
    );
  }

  const toggle = (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        onSelectedChange?.(!on);
      }}
      className={
        onRemove
          ? `inline-flex h-full items-center gap-1.5 rounded-ub-full ps-3 pe-1 ${focusRing}`
          : `${chipShell} ${chipSizes[size]} ${chipPad[size]} ${tone} gap-1.5 ${focusRing} ${className ?? ""}`
      }
      {...rest}
    >
      {label}
    </button>
  );

  if (!onRemove) return toggle;
  return (
    <span className={`${chipShell} ${chipSizes[size]} ${tone} ${className ?? ""}`}>
      {toggle}
      {removeButton}
    </span>
  );
}
