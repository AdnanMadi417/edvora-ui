"use client";

import React, { forwardRef, useId } from "react";
import { fieldControl, fieldControlError, fieldWrapper } from "components/ub/recipes";
import { FieldError, FieldHelper, FieldLabel, describedBy } from "components/ub/forms/FieldChrome";

export type TextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> & {
  label?: React.ReactNode;
  value: string;
  onChange: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  helperText?: React.ReactNode;
  /** What happened and how to fix it. */
  error?: React.ReactNode;
  /** Shows a live "120 / 500" count (tabular) and caps input at this length. */
  maxLength?: number;
  /** Hide the label visually but keep it for screen readers. */
  hideLabel?: boolean;
  wrapperClassName?: string;
};

/**
 * Multi-line text field with the same label, helper and error pattern as
 * Input (brief §4.2). Use it for reasons, notes and descriptions.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, value, onChange, helperText, error, maxLength, hideLabel = false, required = false, rows = 4, id: idProp, className = "", wrapperClassName = fieldWrapper, "aria-describedby": ariaDescribedBy, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? `ub-textarea-${autoId}`;
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const countId = maxLength ? `${id}-count` : undefined;

  return (
    <div className={wrapperClassName}>
      <FieldLabel htmlFor={id} required={required} className={hideLabel ? "sr-only" : ""}>
        {label}
      </FieldLabel>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value, e)}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(errorId, helperId, countId, ariaDescribedBy)}
        {...rest}
        className={[fieldControl, "min-h-24 resize-y py-2", error && fieldControlError, className].filter(Boolean).join(" ")}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <FieldError id={errorId}>{error}</FieldError>
          <FieldHelper id={helperId}>{helperText}</FieldHelper>
        </div>
        {maxLength && (
          <p id={countId} className="ub-tabular mt-1.5 shrink-0 text-ub-caption text-ub-text-tertiary">
            {value.length} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

export default Textarea;
