"use client";

import React from "react";
import Combobox from "./Combobox";
import TextButton from "components/ub/core/buttons/TextButton";

/** Legacy form-data adapter over the shared keyboard-accessible combobox. */
export default function SearchableDropdown({
  label = "",
  field,
  dataField = undefined,
  options = [],
  required = true,
  formData,
  errors,
  updateFormData,
  placeholder = "Select...",
  disabledOptions = [],
  onSelect = undefined,
  onBlur = undefined,
  compact = false,
  disabled = false,
  hint = undefined,
  actions = [],
}) {
  const value =
    field
      .split(/[.[\]]/)
      .filter(Boolean)
      .reduce((data, key) => data?.[key], formData) ?? "";
  return (
    <div data-field={dataField ?? field}>
      <Combobox
        label={label}
        value={value === "" ? null : String(value)}
        options={options.map((option) => ({
          ...option,
          value: String(option.value),
          disabled:
            option.disabled ||
            disabledOptions.some(
              (item) => String(item) === String(option.value)
            ),
        }))}
        onChange={(next) => {
          const option = options.find((item) => String(item.value) === next);
          const selected = option?.value ?? "";
          updateFormData(field, selected);
          onSelect?.(selected);
        }}
        placeholder={placeholder}
        error={errors?.[field]}
        helperText={hint}
        required={required}
        disabled={disabled}
        compact={compact}
        onBlur={onBlur}
        actions={
          actions.length ? (
            <div className="border-t border-ub-border p-2">
              {actions.map((action, index) => (
                <TextButton key={index} onClick={() => action.onClick?.()}>
                  {action.icon}
                  {action.label}
                </TextButton>
              ))}
            </div>
          ) : undefined
        }
      />
    </div>
  );
}
