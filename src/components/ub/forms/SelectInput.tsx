import React from "react";
import { fieldControl, fieldControlError } from "components/ub/recipes";
import { SelectChevron, selectControl } from "components/ub/forms/FieldChrome";

const getNestedValue = (obj: Record<string, any>, path: string) => {
  if (!path) return undefined;
  return path
    .split(/[.[\]]/)
    .filter(Boolean)
    .reduce((acc: any, key) => (acc ? acc[key] : undefined), obj);
};

type Option = string | { value: string | number; label: string };

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
}: SelectInputProps) {
  const value = getNestedValue(formData, field) ?? "";
  const hasError = Boolean(errors?.[field]);
  // Same guard as SelectField: an unmatched value would otherwise make React
  // show the first option as if it were selected (UBX-395).
  const hasMatchingOption = options.some(
    (opt) => String(typeof opt === "object" ? opt.value : opt) === String(value)
  );
  const showUnmatched = value !== "" && !hasMatchingOption;

  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => updateFormData(field, e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={hasError || undefined}
        className={`${fieldControl} h-10 ${selectControl} ${hasError ? fieldControlError : ""} ${className}`}
      >
        {showUnmatched && (
          <option value={value} disabled>
            {`${value} (not an available option)`}
          </option>
        )}
        {options.map((opt, index) => {
          const optValue = typeof opt === "object" ? opt.value : opt;
          const optLabel = typeof opt === "object" ? opt.label : opt;
          return (
            <option key={`${optValue}-${index}`} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
      <SelectChevron />
    </div>
  );
}
