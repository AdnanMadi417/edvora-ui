import React, { useId } from "react";
import { fieldWrapper, optionCard, optionCardSelected, toggleThumb, toggleTrack } from "components/ub/recipes";
import { FieldError, FieldLabel, describedBy, focusWithinRing } from "components/ub/forms/layout/FieldChrome";

const CheckBoxGroup = ({
  label,
  field,
  options,
  formData,
  updateFormData,
  errors,
  required = false,
}) => {
  const id = useId();
  const error = errors?.[field];
  const errorId = error ? `${id}-error` : undefined;

  const isSelected = (optionId) => {
    const selected = formData[field] || [];
    return selected.includes(optionId);
  };

  const toggleSelection = (optionId) => {
    const selected = formData[field] || [];
    let newSelected;
    if (selected.includes(optionId)) {
      newSelected = selected.filter((i) => i !== optionId);
    } else {
      newSelected = [...selected, optionId];
    }
    updateFormData(field, newSelected);
  };

  return (
    <fieldset className={fieldWrapper} data-field={field} aria-describedby={describedBy(errorId)}>
      <FieldLabel as="legend" required={required}>{label}</FieldLabel>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => {
          const selected = isSelected(option.id);

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center justify-between gap-3 ${optionCard} ${focusWithinRing} ${
                selected ? `${optionCardSelected} p-[15px]` : `p-4 ${error ? "border-ub-danger-500" : ""}`
              }`}
            >
              <span className="flex min-w-0 flex-col">
                <span className="text-ub-label-md text-ub-text-primary">{option.name}</span>
                <span className="text-ub-body-sm text-ub-text-tertiary">{selected ? "Enabled" : "Disabled"}</span>
              </span>

              <input
                type="checkbox"
                role="switch"
                checked={selected}
                onChange={() => toggleSelection(option.id)}
                className="sr-only"
              />
              <span aria-hidden="true" className={`${toggleTrack(selected)} motion-reduce:transition-none`}>
                <span className={`${toggleThumb(selected)} motion-reduce:transition-none`} />
              </span>
            </label>
          );
        })}
      </div>

      <FieldError id={errorId}>{error}</FieldError>
    </fieldset>
  );
};

export default CheckBoxGroup;
