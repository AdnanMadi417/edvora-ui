import React, { useId } from "react";
import { fieldWrapper, focusRing, optionCard, optionCardSelected, toggleThumb, toggleTrack } from "components/ub/recipes";
import { FieldError, describedBy } from "components/ub/forms/FieldChrome";

// A whole-card switch for one setting (brief §4.2: toggles are for settings
// that apply instantly). The card itself is the switch, so it is keyboard
// operable and announced as on/off.
const ToggleInput = ({
                       label,
                       field,
                       formData,
                       updateFormData,
                       errors,
                     }) => {
  const id = useId();

  const selected = Boolean(
    field.split(".").reduce((acc, key) => acc?.[key], formData)
  );
  const error = errors?.[field];
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const errorId = error ? `${id}-error` : undefined;

  const toggle = () => {
    updateFormData(field, !selected);
  };

  return (
    <div className={fieldWrapper} data-field={field}>
      <button
        type="button"
        role="switch"
        aria-checked={selected}
        aria-labelledby={labelId}
        aria-describedby={describedBy(hintId, errorId)}
        aria-invalid={error ? true : undefined}
        onClick={toggle}
        className={`flex w-full cursor-pointer items-center justify-between gap-4 text-start ${optionCard} ${focusRing} ${
          selected ? `${optionCardSelected} px-[19px] py-[15px]` : `px-5 py-4 ${error ? "border-ub-danger-500" : ""}`
        }`}
      >
        {/* Text Section */}
        <span className="flex min-w-0 flex-col">
          <span id={labelId} className="text-ub-label-md text-ub-text-primary">
            {label}
          </span>

          <span id={hintId} className="mt-0.5 text-ub-body-sm text-ub-text-tertiary">
            Click to toggle configuration
          </span>
        </span>

        {/* Toggle Switch */}
        <span aria-hidden="true" className={`${toggleTrack(selected)} motion-reduce:transition-none`}>
          <span className={`${toggleThumb(selected)} motion-reduce:transition-none`} />
        </span>
      </button>

      {/* Error Message */}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
};

export default ToggleInput;
