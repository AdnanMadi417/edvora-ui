"use client";

// 20px checkbox, radius 4 (brief §4.2), with label, description and
// indeterminate support. A native input keeps keyboard and form behaviour.
import React, { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";
import { checkbox } from "components/ub/recipes";
import { FieldError, describedBy } from "components/ub/forms/FieldChrome";
import { Icon } from "components/ub/icons/Icon";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "onChange"> & {
  checked: boolean;
  onChange: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Mixed state, e.g. "select all" when only some rows are selected. */
  indeterminate?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { checked, onChange, indeterminate = false, label, description, error, id: idProp, className = "", disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? `ub-checkbox-${autoId}`;
  const descId = description ? `${id}-desc` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  // `indeterminate` is a DOM property only, never an attribute.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const filled = checked || indeterminate;

  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        {/* 24px row so the 20px box lines up with label-md text and the target stays ≥24px. */}
        <span className="relative flex h-6 shrink-0 items-center">
          <input
            ref={inputRef}
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked, e)}
            disabled={disabled}
            aria-checked={indeterminate ? "mixed" : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(descId, errorId)}
            {...rest}
            className={`${checkbox} ${indeterminate ? "border-ub-action-primary bg-ub-action-primary" : ""} ${
              error && !filled ? "border-ub-danger-500" : ""
            } disabled:border-ub-border disabled:checked:bg-ub-text-disabled`}
          />
          {filled && (
            <span className="pointer-events-none absolute inset-0 grid place-items-center text-ub-action-primary-text">
              <Icon name={indeterminate ? "minus" : "check"} size={16} className="[&_*]:[stroke-width:2.5]" />
            </span>
          )}
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
      <FieldError id={errorId} className="ms-8">
        {error}
      </FieldError>
    </div>
  );
});

export default Checkbox;
