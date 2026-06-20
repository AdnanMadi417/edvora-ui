import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  label: string;
  field: string;
  required?: boolean;
  placeholder?: string;
  formData: Record<string, any>;
  errors: Record<string, any>;
  updateFormData: (field: string, value: string) => void;
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
}: PasswordFieldProps) => {
  const [show, setShow] = useState(false);
  const value = getNestedValue(formData, field) ?? "";
  const error = errors?.[field];

  return (
    <div className="mb-4">
      <label className="block text-p2 font-medium text-slate-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <div className="relative mt-2">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => updateFormData(field, e.target.value)}
          placeholder={placeholder}
          className={`flex h-12 w-full items-center rounded-md border p-3 pr-10 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-default"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default PasswordField;
