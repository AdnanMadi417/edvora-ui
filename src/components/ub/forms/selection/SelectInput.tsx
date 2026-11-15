"use client";
import React from "react";
import Combobox from "./Combobox";
import {
  nestedSelectValue,
  normalizeSelectOptions,
  type LegacySelectOption,
} from "./normalizeSelectOptions";
interface SelectInputProps {
  field: string;
  options: LegacySelectOption[];
  formData: Record<string, any>;
  errors?: Record<string, string>;
  updateFormData: (field: string, value: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-controls"?: string;
}
/** Compact searchable picker for inline controls such as currency. */
export default function SelectInput({
  field,
  options,
  formData,
  errors,
  updateFormData,
  onBlur,
  disabled,
  className,
  "aria-label": ariaLabel,
  "aria-controls": ariaControls,
}: SelectInputProps) {
  return (
    <Combobox
      compact
      name={field}
      ariaLabel={ariaLabel ?? field.replace(/_/g, " ")}
      aria-controls={ariaControls}
      value={String(nestedSelectValue(formData, field) ?? "")}
      options={normalizeSelectOptions(options)}
      onChange={(value) => updateFormData(field, value ?? "")}
      onBlur={onBlur}
      disabled={disabled}
      error={errors?.[field]}
      triggerClassName={className}
    />
  );
}
