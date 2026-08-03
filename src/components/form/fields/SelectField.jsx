// components/form/SelectField.jsx
import React from "react";

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(/[\.\[\]]/).filter(Boolean)
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const SelectField = ({ label, field, options, required = true, formData, errors, updateFormData, onBlur = undefined, disabled = false }) => {
  const value = getNestedValue(formData, field) ?? "";

  return (
    <div className="mb-4">
      <label className="block text-p2 font-medium text-slate-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <select
        value={value}
        onChange={(e) => updateFormData(field, e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        className={`mt-2 flex h-12 w-full items-center justify-start rounded-lg border p-3 px-3 py-2 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 ${
          errors?.[field] ? "border-red-500 bg-red-50" : "border-slate-200 bg-white hover:bg-slate-50"
        }`}
      >
        <option value="" disabled>Select ...</option>
        {options.map((opt, index) =>
          typeof opt === "object" && opt !== null ? (
            <option key={opt.value ?? index} value={opt.value ?? ""}>
              {opt.label ?? opt.value ?? ""}
            </option>
          ) : (
            <option key={opt + index} value={opt}>
              {opt}
            </option>
          )
        )}
      </select>

      {errors?.[field] && (
        <p className="mt-1 text-xs text-red-600">{errors?.[field]}</p>
      )}
    </div>
  );
};

export default SelectField;
