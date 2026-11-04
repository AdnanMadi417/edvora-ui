import React, { useId } from "react";
import { ChevronDown } from "lucide-react";
import { DIAL_CODES } from "constants/lists";
import { fieldWrapper } from "components/ub/recipes";
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

// One bordered control holding the dial-code select and the number input, so
// the pair hovers, focuses and errors as a single field (brief §4.2).
const groupBase =
  "flex h-12 overflow-hidden rounded-ub-md border bg-ub-surface transition-[border-color,box-shadow] duration-ub-fast ease-ub-standard md:h-10 " +
  "focus-within:border-ub-border-focus focus-within:ring-1 focus-within:ring-ub-border-focus";
const groupOk = "border-ub-border-control hover:border-ub-border-control-hover";
const groupError = "border-ub-danger-500 hover:border-ub-danger-500 focus-within:border-ub-danger-500 focus-within:ring-ub-danger-500";

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
      <div dir="ltr" className={`${groupBase} ${error ? groupError : groupOk}`}>
        <span className="relative flex shrink-0 border-e border-ub-border">
        <select
          value={dialCode}
          onChange={(e) => updateFormData(dialCodeField, e.target.value)}
          aria-label="Country dialling code"
          className="ub-tabular cursor-pointer appearance-none bg-transparent ps-3 pe-8 text-ub-body-sm text-ub-text-primary outline-none hover:bg-ub-surface-subtle focus-visible:bg-ub-selected [&>option]:text-ub-text-primary"
        >
          {DIAL_CODES.map((d) => (
            <option key={d.label} value={d.code}>{d.label}</option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" strokeWidth={1.75} className="pointer-events-none absolute end-2 top-1/2 h-4 w-4 -translate-y-1/2 text-ub-icon-default" />
        </span>
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
          className="ub-tabular min-w-0 flex-1 bg-transparent px-3 text-ub-body-md text-ub-text-primary outline-none placeholder:text-ub-text-tertiary"
        />
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
