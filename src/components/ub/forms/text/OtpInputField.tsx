import React, { useId, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { fieldControl, fieldControlError, fieldWrapper } from "components/ub/recipes";
import { FieldError, FieldLabel, describedBy } from "components/ub/forms/layout/FieldChrome";

interface OtpInputFieldProps {
  label: string;
  field: string;
  required?: boolean;
  formData: Record<string, any>;
  errors: Record<string, any>;
  updateFormData: (field: string, value: string) => void;
  length?: number;
}

const OtpInputField = ({
  label,
  field,
  required = true,
  formData,
  errors,
  updateFormData,
  length = 6,
}: OtpInputFieldProps) => {
  const value: string = formData[field] ?? "";
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");
  const error = errors?.[field];
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const update = (next: string[]) => {
    updateFormData(field, next.join(""));
  };

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    update(next);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        update(next);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = "";
        update(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    const next = Array.from({ length }, (_, i) => pasted[i] ?? "");
    update(next);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  const id = useId();
  const labelId = `${id}-label`;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={fieldWrapper} data-field={field}>
      <FieldLabel as="span" id={labelId} required={required}>{label}</FieldLabel>

      {/* Codes read left to right in every locale, so arrow keys match the boxes. */}
      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={describedBy(errorId)}
        dir="ltr"
        className="flex gap-2"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-invalid={error ? true : undefined}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`${fieldControl} ub-tabular h-12 min-w-0 px-0 text-center text-ub-heading-sm ${
              error ? fieldControlError : digit ? "border-ub-border-control-hover bg-ub-selected" : ""
            }`}
          />
        ))}
      </div>

      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
};

export default OtpInputField;
