// components/form/TextareaField.jsx
import React from "react";

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(/[\.\[\]]/).filter(Boolean)
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const TextareaField = ({ label, field, required = true, placeholder = "", formData, errors, updateFormData }) => {
  const value = getNestedValue(formData, field) ?? "";

  return (
    <div className="mb-4">
      <label className="block text-p2 font-medium text-slate-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <textarea
        value={value}
        onChange={(e) => updateFormData(field, e.target.value)}
        placeholder={placeholder}
        className={`mt-2 min-h-[96px] w-full rounded-md border p-3 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y ${
          errors?.[field] ? "border-red-500" : "border-default"
        }`}
      />

      {errors?.[field] && (
        <p className="mt-1 text-xs text-red-600">{errors?.[field]}</p>
      )}
    </div>
  );
};

export default TextareaField;
