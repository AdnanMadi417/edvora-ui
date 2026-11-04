import React, { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { fieldControl, fieldControlError, fieldControlHeight, fieldWrapper, focusRing } from "components/ub/recipes";
import { FieldError, FieldLabel, describedBy } from "components/ub/forms/layout/FieldChrome";

interface PasswordFieldProps {
  label: string;
  field: string;
  required?: boolean;
  placeholder?: string;
  formData: Record<string, any>;
  errors: Record<string, any>;
  updateFormData: (field: string, value: string) => void;
  onBlur?: () => void;
  /** Optional autocomplete hint, e.g. "new-password" or "current-password". */
  autoComplete?: string;
}

const getNestedValue = (obj: Record<string, any>, path: string) => {
  if (!path) return undefined;
  return path
    .split(/[\.\[\]]/)
    .filter(Boolean)
    .reduce((acc: any, key: string) => (acc ? acc[key] : undefined), obj);
};

const PasswordField = ({
  label,
  field,
  required = true,
  placeholder = "",
  formData,
  errors,
  updateFormData,
  onBlur,
  autoComplete,
}: PasswordFieldProps) => {
  const id = useId();
  const [show, setShow] = useState(false);
  const value = getNestedValue(formData, field) ?? "";
  const error = errors?.[field];
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={fieldWrapper} data-field={field}>
      <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>

      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => updateFormData(field, e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(errorId)}
          className={`${fieldControl} ${fieldControlHeight} pe-12 ${error ? fieldControlError : ""}`}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className={`absolute end-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-ub-full text-ub-icon-default transition-colors duration-ub-fast ease-ub-standard hover:bg-ub-action-secondary-hover hover:text-ub-text-primary md:h-8 md:w-8 ${focusRing}`}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
        >
          {show ? <EyeOff aria-hidden="true" strokeWidth={1.75} className="h-5 w-5" /> : <Eye aria-hidden="true" strokeWidth={1.75} className="h-5 w-5" />}
        </button>
      </div>

      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
};

export default PasswordField;
