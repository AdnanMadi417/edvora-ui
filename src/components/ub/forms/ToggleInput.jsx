import React, { useId } from "react";
import { fieldLabel, fieldWrapper, optionCard, optionCardSelected, toggleThumb, toggleTrack } from "components/ub/recipes";
import { FieldError, describedBy, focusWithinRing } from "components/ub/forms/FieldChrome";

// A labelled switch card for one boolean. Toggles always hold a value, so they
// carry no "(optional)" marker; `required` is kept for API compatibility.
const ToggleInput = ({
                       label,
                       field,
                       formData,
                       updateFormData,
                       errors,
                       // eslint-disable-next-line no-unused-vars
                       required = false,
                       enabledText = "Enabled",
                       disabledText = "Disabled",
                       enabledDescription = "Click to toggle",
                       disabledDescription = "Click to toggle",
                     }) => {
  const id = useId();
  const selected = Boolean(formData[field]);
  const error = errors?.[field];
  const labelId = `${id}-label`;
  const stateId = `${id}-state`;
  const errorId = error ? `${id}-error` : undefined;

  const toggle = () => {
    updateFormData(field, !selected);
  };

  return (
    <div className={fieldWrapper} data-field={field}>
      {label && (
        <span id={labelId} className={fieldLabel}>
          {label}
        </span>
      )}

      <label
        className={`flex cursor-pointer items-center justify-between gap-3 ${optionCard} ${focusWithinRing} ${
          selected ? `${optionCardSelected} p-[15px]` : `p-4 ${error ? "border-ub-danger-500" : ""}`
        }`}
      >
        <span id={stateId} className="flex min-w-0 flex-col pe-3">
          <span className="truncate text-ub-label-md text-ub-text-primary">
            {selected ? enabledText : disabledText}
          </span>
          <span className="truncate text-ub-body-sm text-ub-text-tertiary">
            {selected ? enabledDescription : disabledDescription}
          </span>
        </span>

        <input
          type="checkbox"
          role="switch"
          checked={selected}
          onChange={toggle}
          aria-labelledby={label ? labelId : stateId}
          aria-describedby={describedBy(label && stateId, errorId)}
          aria-invalid={error ? true : undefined}
          className="sr-only"
        />
        <span aria-hidden="true" className={`${toggleTrack(selected)} motion-reduce:transition-none`}>
          <span className={`${toggleThumb(selected)} motion-reduce:transition-none`} />
        </span>
      </label>

      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
};

export default ToggleInput;
