import React, { useId } from "react";
import { fieldWrapper, optionCard, optionCardSelected } from "components/ub/recipes";
import { FieldError, FieldLabel, RadioMark, describedBy } from "components/ub/forms/FieldChrome";

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(/[\.\[\]]/).filter(Boolean)
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const RadioField = ({
                      label,
                      field,
                      options,
                      formData,
                      errors,
                      updateFormData,
                      required = true,
                    }) => {
  const id = useId();
  const value = getNestedValue(formData, field);
  const error = errors?.[field];
  const errorId = error ? `${id}-error` : undefined;

  return (
    <fieldset
      className={fieldWrapper}
      data-field={field}
      aria-describedby={describedBy(errorId)}
    >
      <FieldLabel as="legend" required={required}>{label}</FieldLabel>

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.label}
              className={`flex h-12 min-w-[8rem] flex-1 cursor-pointer items-center gap-3 text-ub-body-md text-ub-text-primary md:h-10 ${optionCard} ${
                checked ? `${optionCardSelected} px-[11px]` : `px-3 ${error ? "border-ub-danger-500" : ""}`
              }`}
            >
              <input
                type="radio"
                name={field}
                value={opt.value}
                checked={checked}
                onChange={() => updateFormData(field, opt.value)}
                className="peer sr-only"
              />
              <RadioMark checked={checked} invalid={Boolean(error)} />
              {opt.label}
            </label>
          );
        })}
      </div>

      <FieldError id={errorId}>{error}</FieldError>
    </fieldset>
  );
};

export default RadioField;
