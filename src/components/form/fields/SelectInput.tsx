import React from "react";

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
}

/**
 * Bare dropdown — just the `<select>`, styled to match SelectField, with no
 * label or spacing wrapper. For inline pickers (e.g. a currency selector
 * sitting next to a button) where a full labeled SelectField would add
 * unwanted vertical space and a redundant caption.
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
    <select
      value={value}
      onChange={(e) => updateFormData(field, e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      className={`flex h-10 w-full items-center justify-start rounded-lg border px-3 py-2 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 ${
        hasError ? "border-red-500 bg-red-50" : "border-slate-200 bg-white hover:bg-slate-50"
      } ${className}`}
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
  );
}
