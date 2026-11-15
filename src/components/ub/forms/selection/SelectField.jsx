"use client";
import React from "react";
import Combobox from "./Combobox";
import {
  nestedSelectValue,
  normalizeSelectOptions,
} from "./normalizeSelectOptions";

/** Form-data adapter; every select uses the same searchable button and popup. */
export default function SelectField({
  label,
  field,
  options = [],
  required = true,
  formData,
  errors,
  updateFormData,
  onBlur = undefined,
  disabled = false,
  hint = "",
  placeholder = "Select...",
}) {
  return (
    <div data-field={field}>
      <Combobox
        label={label}
        name={field}
        value={String(nestedSelectValue(formData, field) ?? "")}
        options={normalizeSelectOptions(options)}
        required={required}
        error={errors?.[field]}
        helperText={hint}
        disabled={disabled}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={(value) => updateFormData(field, value ?? "")}
      />
    </div>
  );
}
