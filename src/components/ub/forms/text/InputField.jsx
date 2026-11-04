// components/form/InputField.jsx
import React, { useId } from "react";
import { fieldControl, fieldControlError, fieldControlHeight, fieldWrapper } from "components/ub/recipes";
import { FieldError, FieldHelper, FieldLabel, describedBy } from "components/ub/forms/layout/FieldChrome";

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(/[\.\[\]]/).filter(Boolean)
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

/**
 * Labelled text input (brief §4.2).
 * - `helperText` keeps its original meaning: shown only while the field is disabled
 *   (e.g. "Contact support to change your passport number.").
 * - `hint` (optional) is helper text shown under the field whenever there's no error.
 * - `reference` renders the value with `.ub-ref` (passport and other IDs); on by
 *   default for fields whose key mentions "passport".
 * - `tabular` renders tabular numerals (amounts); on by default for type="number".
 */
const InputField = ({
  label,
  field,
  dataField = undefined,
  type = "text",
  required = true,
  placeholder = "",
  formData,
  errors,
  updateFormData,
  onBlur = undefined,
  disabled = false,
  helperText = "",
  hint = "",
  reference = undefined,
  tabular = undefined,
}) => {
  const id = useId();
  const value = getNestedValue(formData, field) ?? "";
  const error = errors?.[field];

  const dateProps = type === "date" ? { min: "1900-01-01", max: "2099-12-31" } : {};
  const helper = !error ? (disabled && helperText ? helperText : hint) : "";
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helper ? `${id}-helper` : undefined;
  const isReference = reference ?? /passport/i.test(String(field ?? ""));
  const isTabular = tabular ?? type === "number";

  return (
    <div className={fieldWrapper} data-field={dataField ?? field}>
      <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => updateFormData(field, type === "email" ? e.target.value.toLowerCase() : e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(errorId, helperId)}
        {...dateProps}
        className={`${fieldControl} ${fieldControlHeight} ${error ? fieldControlError : ""} ${isReference ? "ub-ref" : ""} ${isTabular ? "ub-tabular" : ""}`}
      />

      <FieldError id={errorId}>{error}</FieldError>
      <FieldHelper id={helperId}>{helper}</FieldHelper>
    </div>
  );
};

export default InputField;
