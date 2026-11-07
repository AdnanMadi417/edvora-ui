// components/form/TextareaField.jsx
import React, { useId } from "react";
import { fieldControl, fieldControlError, fieldWrapper } from "components/ub/recipes";
import { FieldError, FieldHelper, FieldLabel, describedBy } from "components/ub/forms/layout/FieldChrome";

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(/[\.\[\]]/).filter(Boolean)
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const TextareaField = ({ label, field, required = true, placeholder = "", formData, errors, updateFormData, onBlur = undefined, disabled = false, hint = "" }) => {
  const id = useId();
  const value = getNestedValue(formData, field) ?? "";
  const error = errors?.[field];
  const errorId = error ? `${id}-error` : undefined;
  const helperId = !error && hint ? `${id}-helper` : undefined;

  return (
    <div className={fieldWrapper} data-field={field}>
      <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>

      <textarea
        id={id}
        value={value}
        onChange={(e) => updateFormData(field, e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(errorId, helperId)}
        className={`${fieldControl} block min-h-[96px] resize-y !rounded-ub-lg py-3 ${error ? fieldControlError : ""}`}
      />

      <FieldError id={errorId}>{error}</FieldError>
      {!error && <FieldHelper id={helperId}>{hint}</FieldHelper>}
    </div>
  );
};

export default TextareaField;
