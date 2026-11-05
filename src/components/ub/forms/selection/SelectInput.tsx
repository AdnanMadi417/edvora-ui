import React, { useId } from "react";
import { fieldControl, fieldControlError } from "components/ub/recipes";
import {
  FieldError,
  SelectChevron,
  selectControl,
} from "components/ub/forms/layout/FieldChrome";

const getNestedValue = (obj: Record<string, any>, path: string) => {
  if (!path) return undefined;
  return path
    .split(/[.[\]]/)
    .filter(Boolean)
    .reduce((acc: any, key) => (acc ? acc[key] : undefined), obj);
};

type Option =
  | string
  | { value: string | number; label: string; disabled?: boolean };

interface SelectInputProps {
  field: string;
  options: Option[];
  formData: Record<string, any>;
  errors?: Record<string, string>;
  updateFormData: (field: string, value: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  /** Accessible name, since this control has no visible label. */
  "aria-label"?: string;
  "aria-controls"?: string;
}

/**
 * Bare dropdown — just the `<select>`, styled to match SelectField, with no
 * label or spacing wrapper. For inline pickers (e.g. a currency selector
 * sitting next to a button) where a full labeled SelectField would add
 * unwanted vertical space and a redundant caption. 40px tall to line up with
 * md buttons; pass a height in `className` to override.
 */
export default function SelectInput({
  field,
  options,
  formData,
  errors,
  updateFormData,
  onBlur,
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
  "aria-controls": ariaControls,
}: SelectInputProps) {
  const id = useId();
  const value = getNestedValue(formData, field) ?? "";
  const hasError = Boolean(errors?.[field]);
  // Same guard as SelectField: an unmatched value would otherwise make React
  // show the first option as if it were selected (UBX-395).
  const hasMatchingOption = options.some(
    (opt) => String(typeof opt === "object" ? opt.value : opt) === String(value)
  );
  const showUnmatched = value !== "" && !hasMatchingOption;

  return (
    <div className="w-full">
      <div className="relative">
        <select
          value={value}
          onChange={(e) => updateFormData(field, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          aria-label={ariaLabel ?? field.replace(/_/g, " ")}
          aria-controls={ariaControls}
          aria-describedby={hasError ? `${id}-error` : undefined}
          aria-invalid={hasError || undefined}
          className={`${fieldControl} h-10 ${selectControl} ${
            hasError ? fieldControlError : ""
          } ${className}`}
        >
          {value === "" && (
            <option value="" disabled>
              Select...
            </option>
          )}
          {showUnmatched && (
            <option value={value} disabled>
              {`${value} (not an available option)`}
            </option>
          )}
          {options.map((opt, index) => {
            const optValue = typeof opt === "object" ? opt.value : opt;
            const optLabel = typeof opt === "object" ? opt.label : opt;
            return (
              <option
                key={`${optValue}-${index}`}
                value={optValue}
                disabled={typeof opt === "object" ? opt.disabled : false}
              >
                {optLabel}
              </option>
            );
          })}
        </select>
        <SelectChevron />
      </div>
      <FieldError id={`${id}-error`}>{errors?.[field]}</FieldError>
    </div>
  );
}
