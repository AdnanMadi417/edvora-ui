import React, { useId } from "react";
import Combobox from "components/ub/forms/selection/Combobox";
import { DIAL_CODES } from "constants/lists";
import { fieldControlError, fieldGroup, fieldWrapper } from "components/ub/recipes";
import { FieldError, FieldLabel, describedBy } from "components/ub/forms/layout/FieldChrome";

interface PhoneInputFieldProps {
  label?: string;
  dialCodeField: string;
  numberField: string;
  formData: Record<string, any>;
  errors?: Record<string, string>;
  updateFormData: (field: string, value: unknown) => void;
  required?: boolean;
  placeholder?: string;
  onBlur?: () => void;
}

// One control holding the dial-code select and the number input, so the pair
// hovers, focuses and errors as a single field. Same pill, height, fill,
// outline and text as fieldControl, so it lines up with the fields beside it.
const group = `flex h-[50px] w-full items-stretch ${fieldGroup}`;

export default function PhoneInputField({
  label = "Phone number",
  dialCodeField,
  numberField,
  formData,
  errors,
  updateFormData,
  required = true,
  placeholder = "12-345 6789",
  onBlur,
}: PhoneInputFieldProps) {
  const id = useId();
  // +60 (Malaysia) is the default dial code when none is stored yet.
  const dialCode = formData[dialCodeField] ?? "+60";
  const number = formData[numberField] ?? "";
  const error = errors?.[numberField];
  const errorId = error ? `${id}-error` : undefined;

  const handleNumberChange = (value: string) => {
    updateFormData(numberField, value.replace(/[^\d\s()-]/g, ""));
  };

  return (
    <div className={fieldWrapper} data-field={numberField}>
      <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>
      {/* Phone numbers always read left to right, dial code first. */}
      <div dir="ltr" className={`${group} ${error ? fieldControlError : ""}`}>
        <span className="relative flex shrink-0">
          <Combobox compact ariaLabel="Country dialling code" value={dialCode} options={DIAL_CODES.map(d => ({ value: d.code, label: d.label }))} onChange={value => updateFormData(dialCodeField, value ?? "+60")} triggerClassName="!h-full !w-28 !rounded-none !rounded-s-[33px] !bg-transparent !outline-none" className="h-full" />
        </span>
        <span aria-hidden="true" className="my-3 w-px shrink-0 bg-[var(--ub-field-ring)]" />
        <input
          id={id}
          type="tel"
          autoComplete="tel-national"
          value={number}
          onChange={(e) => handleNumberChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(errorId)}
          className="min-w-0 flex-1 rounded-e-[33px] bg-transparent ps-3 pe-[17px] text-inherit outline-none placeholder:text-[var(--ub-field-placeholder)]"
        />
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
