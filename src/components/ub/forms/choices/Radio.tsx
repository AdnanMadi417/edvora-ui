"use client";

// 20px radio with a 6px dot (brief §4.2) and a RadioGroup with a legend and
// arrow-key roving focus (brief §9). Native inputs stay underneath so forms,
// labels and screen readers behave as expected.
import React, { forwardRef, useId, useRef } from "react";
import { FieldError, FieldHelper, FieldLabel, RadioMark, describedBy } from "components/ub/forms/layout/FieldChrome";

export type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "onChange" | "value"> & {
  value: string;
  checked: boolean;
  onChange: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  invalid?: boolean;
  className?: string;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, checked, onChange, label, description, invalid = false, id: idProp, className = "", disabled, "aria-describedby": ariaDescribedBy, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? `ub-radio-${autoId}`;
  const descId = description ? `${id}-desc` : undefined;
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <span className="flex h-6 shrink-0 items-center">
        <input
          ref={ref}
          id={id}
          type="radio"
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(value, e)}
          aria-describedby={describedBy(descId, ariaDescribedBy)}
          {...rest}
          className="peer sr-only"
        />
        <RadioMark checked={checked} invalid={invalid} />
      </span>
      {(label || description) && (
        <div className="min-w-0 pt-0.5">
          {label && (
            <label
              htmlFor={id}
              className={`block text-ub-label-md ${disabled ? "cursor-not-allowed text-ub-text-disabled" : "cursor-pointer text-ub-text-primary"}`}
            >
              {label}
            </label>
          )}
          {description && (
            <p id={descId} className="mt-0.5 text-ub-body-sm text-ub-text-tertiary">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

export type RadioOption = {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
};

export type RadioGroupProps = {
  legend: React.ReactNode;
  options: RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  /** Shared input name; generated when omitted. */
  name?: string;
  orientation?: "vertical" | "horizontal";
  required?: boolean;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  hideLegend?: boolean;
  className?: string;
};

export function RadioGroup({
  legend,
  options,
  value,
  onChange,
  name: nameProp,
  orientation = "vertical",
  required = false,
  helperText,
  error,
  disabled = false,
  hideLegend = false,
  className = "",
}: RadioGroupProps) {
  const autoId = useId();
  const name = nameProp ?? `ub-radio-group-${autoId}`;
  const helperId = helperText ? `${name}-helper` : undefined;
  const errorId = error ? `${name}-error` : undefined;
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const enabled = options.map((o) => !disabled && !o.disabled);
  const selectedIndex = options.findIndex((o) => o.value === value);
  // Roving tab stop: the checked option, else the first enabled one.
  const tabStop = selectedIndex >= 0 && enabled[selectedIndex] ? selectedIndex : enabled.indexOf(true);

  const move = (from: number, step: 1 | -1 | "first" | "last") => {
    const n = options.length;
    let i = step === "first" ? -1 : step === "last" ? n : from;
    const dir = step === "first" ? 1 : step === "last" ? -1 : step;
    for (let k = 0; k < n; k++) {
      i = (i + dir + n) % n;
      if (enabled[i]) {
        refs.current[i]?.focus();
        onChange(options[i].value); // selection follows focus, as with native radios
        return;
      }
    }
  };

  const onKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    const rtl = typeof window !== "undefined" && window.getComputedStyle(e.currentTarget).direction === "rtl";
    const next = rtl ? "ArrowLeft" : "ArrowRight";
    const prev = rtl ? "ArrowRight" : "ArrowLeft";
    let handled = true;
    if (e.key === "ArrowDown" || e.key === next) move(index, 1);
    else if (e.key === "ArrowUp" || e.key === prev) move(index, -1);
    else if (e.key === "Home") move(index, "first");
    else if (e.key === "End") move(index, "last");
    else handled = false;
    if (handled) e.preventDefault();
  };

  return (
    <fieldset
      role="radiogroup"
      aria-labelledby={`${name}-legend`}
      className={`min-w-0 ${className}`}
      aria-describedby={describedBy(errorId, helperId)}
      aria-invalid={error ? true : undefined}
      aria-required={required || undefined}
      disabled={disabled}
    >
      <FieldLabel as="legend" id={`${name}-legend`} required={required} className={hideLegend ? "sr-only" : ""}>
        {legend}
      </FieldLabel>
      <div role="presentation" className={orientation === "horizontal" ? "flex flex-wrap gap-x-6 gap-y-3" : "grid gap-3"}>
        {options.map((o, i) => (
          <Radio
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            name={name}
            value={o.value}
            checked={o.value === value}
            onChange={(v) => onChange(v)}
            onKeyDown={onKeyDown(i)}
            tabIndex={i === tabStop ? 0 : -1}
            label={o.label}
            description={o.description}
            disabled={disabled || o.disabled}
            invalid={Boolean(error)}
          />
        ))}
      </div>
      <FieldError id={errorId}>{error}</FieldError>
      <FieldHelper id={helperId}>{helperText}</FieldHelper>
    </fieldset>
  );
}

export default RadioGroup;
