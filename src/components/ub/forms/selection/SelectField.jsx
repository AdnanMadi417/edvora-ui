// components/form/SelectField.jsx
import React, { useId } from "react";
import {
  fieldControl,
  fieldControlError,
  fieldControlHeight,
  fieldWrapper,
} from "components/ub/recipes";
import {
  FieldError,
  FieldHelper,
  FieldLabel,
  SelectChevron,
  describedBy,
  selectControl,
} from "components/ub/forms/layout/FieldChrome";

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(/[\.\[\]]/)
    .filter(Boolean)
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const SelectField = ({
  label,
  field,
  options,
  required = true,
  formData,
  errors,
  updateFormData,
  onBlur = undefined,
  disabled = false,
  hint = "",
  placeholder = "Select...",
}) => {
  const id = useId();
  const value = getNestedValue(formData, field) ?? "";
  const error = errors?.[field];
  const errorId = error ? `${id}-error` : undefined;
  const helperId = !error && hint ? `${id}-helper` : undefined;
  // A controlled <select> whose value matches no option makes React select the
  // first enabled option instead, silently showing the wrong choice (UBX-395:
  // "RM" programs rendered as USD). Surface the raw value as a disabled option
  // so the mismatch is visible and the user has to pick a real option to move on.
  const hasMatchingOption = options.some(
    (opt) =>
      String(
        typeof opt === "object" && opt !== null ? opt.value ?? "" : opt
      ) === String(value)
  );
  const showUnmatched = value !== "" && !hasMatchingOption;

  return (
    <div className={fieldWrapper} data-field={field}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => updateFormData(field, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(errorId, helperId)}
          className={`${fieldControl} ${fieldControlHeight} ${selectControl} ${
            value === "" ? "text-ub-text-tertiary" : ""
          } ${error ? fieldControlError : ""}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {showUnmatched && (
            <option value={value} disabled>
              {`${value} (not an available option)`}
            </option>
          )}
          {options.map((opt, index) =>
            typeof opt === "object" && opt !== null ? (
              <option
                key={opt.value ?? index}
                value={opt.value ?? ""}
                disabled={opt.disabled}
              >
                {opt.label ?? opt.value ?? ""}
              </option>
            ) : (
              <option key={opt + index} value={opt}>
                {opt}
              </option>
            )
          )}
        </select>
        <SelectChevron />
      </div>

      <FieldError id={errorId}>{error}</FieldError>
      {!error && <FieldHelper id={helperId}>{hint}</FieldHelper>}
    </div>
  );
};

export default SelectField;
