// components/form/InputField.jsx
import React from "react";

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(/[\.\[\]]/).filter(Boolean)
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const InputField = ({ label, field, type = "text", required = true, placeholder = "", formData, errors, updateFormData, onBlur }) => {
  const value = getNestedValue(formData, field) ?? "";
  const error = errors?.[field];

  const dateProps = type === "date" ? { min: "1900-01-01", max: "2099-12-31" } : {};

  return (
    <div className="mb-4">
      <label className="block text-p2 font-medium text-slate-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => updateFormData(field, type === "email" ? e.target.value.toLowerCase() : e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        {...dateProps}
        className={`mt-2 flex h-12 w-full items-center justify-start rounded-md border p-3 px-3 py-2 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          error ? "border-red-500 bg-red-50" : "border-default"
        }`}
      />

      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default InputField;
