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
  // A controlled <select> whose value matches no option makes React select the
  // first enabled option instead, silently showing the wrong choice (UBX-395:
  // "RM" programs rendered as USD). Surface the raw value as a disabled option
  // so the mismatch is visible and the user has to pick a real option to move on.
  const hasMatchingOption = options.some(
    (opt) => String(typeof opt === "object" && opt !== null ? opt.value ?? "" : opt) === String(value)
  );
  const showUnmatched = value !== "" && !hasMatchingOption;

  return (
    <div className="mb-4" data-field={field}>
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
        {showUnmatched && (
          <option value={value} disabled>
            {`${value} (not an available option)`}
          </option>
        )}
        {options.map((opt, index) =>
          typeof opt === "object" && opt !== null ? (
            <option key={opt.value ?? index} value={opt.value ?? ""} disabled={opt.disabled}>
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
