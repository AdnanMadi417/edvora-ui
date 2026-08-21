import React, { useRef, KeyboardEvent, ClipboardEvent } from "react";

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

  return (
    <div className="mb-4" data-field={field}>
      <label className="block text-p2 font-medium text-slate-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <div className="mt-2 flex gap-2">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`h-12 w-full rounded-lg border text-center text-lg font-semibold outline-none transition-colors focus:ring-1 focus:ring-blue-500 ${
              error
                ? "border-red-500 bg-red-50 text-red-700"
                : digit
                ? "border-blue-400 bg-blue-50 text-slate-900"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
            }`}
          />
        ))}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default OtpInputField;
