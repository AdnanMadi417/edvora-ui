"use client";
import React from "react";
import SearchableSelectButton from "./SearchableSelectButton";
import {
  nestedSelectValue,
  normalizeSelectOptions,
} from "./normalizeSelectOptions";

/** Multi-select shares the same searchable popup, keyboard handling and modal positioning. */
export default function MultiSelect({
  label,
  field,
  options = [],
  required = true,
  formData,
  errors,
  updateFormData,
  placeholder = "Select...",
  disabledOptions = [],
  disabled = false,
  hint = undefined,
}) {
  const values = nestedSelectValue(formData, field) ?? [];
  return (
    <div data-field={field}>
      <SearchableSelectButton
        multiple
        label={label}
        name={field}
        value={values.map(String)}
        options={normalizeSelectOptions(options).map((option) => ({
          ...option,
          disabled:
            option.disabled ||
            disabledOptions.some((value) => String(value) === option.value),
        }))}
        onChange={(next) =>
          updateFormData(
            field,
            next.map(
              (value) =>
                options.find((option) => String(option.value) === value)
                  ?.value ?? value
            )
          )
        }
        required={required}
        disabled={disabled}
        error={errors?.[field]}
        helperText={hint}
        placeholder={placeholder}
      />
    </div>
  );
}
