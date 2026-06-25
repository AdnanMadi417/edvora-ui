import React from "react";
import { DIAL_CODES } from "constants/lists";

interface PhoneInputFieldProps {
  label?: string;
  dialCodeField: string;
  numberField: string;
  formData: Record<string, any>;
  errors?: Record<string, string>;
  updateFormData: (field: string, value: unknown) => void;
  required?: boolean;
  placeholder?: string;
}

export default function PhoneInputField({
  label = "Phone Number",
  dialCodeField,
  numberField,
  formData,
  errors,
  updateFormData,
  required = true,
  placeholder = "12-345 6789",
}: PhoneInputFieldProps) {
  const dialCode = formData[dialCodeField] ?? "+60";
  const number = formData[numberField] ?? "";
  const error = errors?.[numberField];

  return (
    <div className="mb-4">
      <label className="block text-p2 font-medium text-slate-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className={`mt-2 flex h-12 overflow-hidden rounded-lg border transition ${error ? "border-red-500" : "border-default"}`}>
        <select
          value={dialCode}
          onChange={(e) => updateFormData(dialCodeField, e.target.value)}
          className="shrink-0 border-r border-slate-200 px-2 text-xs text-slate-700 outline-none hover:bg-slate-50"
        >
          {DIAL_CODES.map((d) => (
            <option key={d.code} value={d.code}>{d.label}</option>
          ))}
        </select>
        <input
          type="tel"
          value={number}
          onChange={(e) => updateFormData(numberField, e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-white px-3 text-sm outline-none hover:bg-slate-50"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
