"use client";

import React from "react";
import Toggle from "./Toggle";
import { fieldWrapper } from "components/ub/recipes";

/** Form-data adapter for the shared switch. Label stays stable as the state changes. */
export default function ToggleInput({
  label,
  field,
  formData,
  updateFormData,
  errors,
  required = false,
  enabledText = "Enabled",
  disabledText = "Disabled",
  enabledDescription = "",
  disabledDescription = "",
  disabled = false,
}) {
  const selected = Boolean(
    field
      .split(/[.[\]]/)
      .filter(Boolean)
      .reduce((data, key) => data?.[key], formData)
  );
  return (
    <div className={fieldWrapper} data-field={field}>
      <Toggle
        checked={selected}
        onChange={(next) => updateFormData(field, next)}
        label={label || (selected ? enabledText : disabledText)}
        description={
          <>
            <span className="font-medium text-ub-text-secondary">
              {selected ? enabledText : disabledText}
            </span>
            {(selected ? enabledDescription : disabledDescription) && (
              <> · {selected ? enabledDescription : disabledDescription}</>
            )}
          </>
        }
        error={errors?.[field]}
        disabled={disabled}
        switchPosition="end"
        className="rounded-ub-lg bg-[var(--ub-field-bg)] p-4 shadow-[inset_0_0_0_1px_var(--ub-field-ring)] transition-shadow duration-200 focus-within:shadow-[inset_0_0_0_2px_var(--ub-border-focus)]"
      />
    </div>
  );
}
