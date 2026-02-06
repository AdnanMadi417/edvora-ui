import React from "react";

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(/[\.\[\]]/).filter(Boolean)
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const RadioField = ({
                      label,
                      field,
                      options,
                      formData,
                      errors,
                      updateFormData,
                      required = true,
                    }) => {
  const value = getNestedValue(formData, field);

  return (
    <div className="mb-4">
      <label className="block text-p2 font-medium text-slate-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <div className="mt-2 flex gap-2">
        {options.map((opt) => (
          <label
            key={opt.label}
            className={`flex-1 cursor-pointer rounded-md border p-3 text-center text-p2 text-sm transition-colors focus-within:ring-1 focus-within:ring-blue-500 ${
              getNestedValue(errors, field)
                ? "border-red-500"
                : "border-default"
            } ${value === opt.value ? "bg-blue-100 border-blue-500" : "bg-white"}`}
          >
            <input
              type="radio"
              name={field}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => updateFormData(field, opt.value)}
              className="hidden"
            />
            {opt.label}
          </label>
        ))}
      </div>

      {getNestedValue(errors, field) && (
        <p className="mt-1 text-xs text-red-600">
          {getNestedValue(errors, field)}
        </p>
      )}
    </div>
  );
};

export default RadioField;
