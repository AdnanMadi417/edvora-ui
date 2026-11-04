"use client";

// Numeric stepper (− value +) on the field recipe (brief §4.2). The input is a
// spinbutton: Arrow Up/Down step, Page Up/Down step ×10, Home/End jump to
// min/max, and typed values are clamped on blur or Enter. Tabular numerals.
import React, { forwardRef, useEffect, useId, useState } from "react";
import { fieldControlHeight, fieldWrapper, focusRing } from "components/ub/recipes";
import { FieldError, FieldHelper, FieldLabel, describedBy } from "components/ub/forms/layout/FieldChrome";
import { Icon } from "components/ub/icons/Icon";

export type StepperProps = {
  label: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Short unit before the value, e.g. "RM". */
  prefix?: string;
  /** Short unit after the value, e.g. "months". */
  suffix?: string;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  /** Accessible names for the buttons. */
  decrementLabel?: string;
  incrementLabel?: string;
  className?: string;
};

/** Clamp to [min, max] and snap to the step grid (anchored at min, or 0). */
export function clampStep(raw: number, min = -Infinity, max = Infinity, step = 1): number {
  if (!Number.isFinite(raw)) return Number.isFinite(min) ? min : 0;
  const base = Number.isFinite(min) ? min : 0;
  const snapped = base + Math.round((raw - base) / step) * step;
  // Round off float noise from fractional steps (0.1 + 0.2).
  const decimals = (String(step).split(".")[1] ?? "").length;
  const fixed = Number(snapped.toFixed(decimals));
  return Math.min(max, Math.max(min, fixed));
}

const format = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 6 });
const parse = (s: string) => Number(s.replace(/,/g, "").trim());

// Field recipe drawn on the wrapper, since the focusable input sits inside it.
const shell =
  "flex w-full items-center gap-1 rounded-ub-md border px-1 transition-[border-color,box-shadow] duration-ub-fast ease-ub-standard motion-reduce:transition-none focus-within:ring-1";
const shellIdle =
  "bg-ub-surface border-ub-border-control hover:border-ub-border-control-hover focus-within:border-ub-border-focus focus-within:ring-ub-border-focus";
const shellError = "bg-ub-surface border-ub-danger-500 focus-within:border-ub-danger-500 focus-within:ring-ub-danger-500";
const shellDisabled = "cursor-not-allowed border-ub-border bg-ub-disabled";

const stepButton =
  `grid h-8 w-8 shrink-0 place-items-center rounded-ub-full text-ub-icon-interactive ${focusRing} ` +
  "transition-colors duration-ub-fast ease-ub-standard hover:bg-ub-action-secondary-hover active:bg-ub-action-secondary-pressed motion-reduce:transition-none " +
  "disabled:cursor-not-allowed disabled:bg-transparent disabled:text-ub-text-disabled";

export const Stepper = forwardRef<HTMLInputElement, StepperProps>(function Stepper(
  {
    label,
    value,
    onChange,
    min = -Infinity,
    max = Infinity,
    step = 1,
    prefix,
    suffix,
    helperText,
    error,
    required = false,
    disabled = false,
    id: idProp,
    name,
    decrementLabel = "Decrease",
    incrementLabel = "Increase",
    className = "",
  },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? `ub-stepper-${autoId}`;
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const [draft, setDraft] = useState(format(value));

  // Follow outside changes to the value.
  useEffect(() => setDraft(format(value)), [value]);

  const commit = (n: number) => {
    const next = clampStep(n, min, max, step);
    setDraft(format(next));
    if (next !== value) onChange(next);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const keys: Record<string, () => number> = {
      ArrowUp: () => value + step,
      ArrowDown: () => value - step,
      PageUp: () => value + step * 10,
      PageDown: () => value - step * 10,
      Home: () => min,
      End: () => max,
    };
    if (e.key === "Enter") {
      commit(parse(draft));
      return;
    }
    const fn = keys[e.key];
    if (!fn) return;
    const target = fn();
    if (!Number.isFinite(target)) return; // Home/End with no bound
    e.preventDefault();
    commit(target);
  };

  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div className={`${fieldWrapper} ${className}`}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <div
        className={`${shell} ${fieldControlHeight} ${disabled ? shellDisabled : error ? shellError : shellIdle}`}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label={decrementLabel}
          aria-controls={id}
          disabled={disabled || atMin}
          onClick={() => commit(value - step)}
          className={stepButton}
        >
          <Icon name="minus" size={20} />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
          {prefix && <span className="text-ub-body-md text-ub-text-tertiary">{prefix}</span>}
          <input
            ref={ref}
            id={id}
            name={name}
            type="text"
            inputMode={step % 1 === 0 && min >= 0 ? "numeric" : "decimal"}
            role="spinbutton"
            aria-valuenow={value}
            aria-valuemin={Number.isFinite(min) ? min : undefined}
            aria-valuemax={Number.isFinite(max) ? max : undefined}
            aria-valuetext={`${prefix ? `${prefix} ` : ""}${format(value)}${suffix ? ` ${suffix}` : ""}`}
            aria-invalid={error ? true : undefined}
            aria-required={required || undefined}
            aria-describedby={describedBy(errorId, helperId)}
            disabled={disabled}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commit(parse(draft))}
            onKeyDown={onKeyDown}
            size={Math.max(2, draft.length)}
            className="ub-tabular min-w-0 bg-transparent text-center text-ub-body-md text-ub-text-primary outline-none disabled:cursor-not-allowed disabled:text-ub-text-disabled"
          />
          {suffix && <span className="text-ub-body-md text-ub-text-tertiary">{suffix}</span>}
        </div>
        <button
          type="button"
          tabIndex={-1}
          aria-label={incrementLabel}
          aria-controls={id}
          disabled={disabled || atMax}
          onClick={() => commit(value + step)}
          className={stepButton}
        >
          <Icon name="plus" size={20} />
        </button>
      </div>
      <FieldError id={errorId}>{error}</FieldError>
      <FieldHelper id={helperId}>{helperText}</FieldHelper>
    </div>
  );
});

export default Stepper;
