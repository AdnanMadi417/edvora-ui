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
            className={`mt-2 flex h-12 w-full items-center justify-start rounded-lg border p-3 px-3 py-2 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              errors?.[field]
                ? "border-red-500 bg-red-50"
                : "border-default"
            } ${value === opt.value ? "bg-blue-100 border-blue-500" : "bg-white hover:bg-slate-50"}`}
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

      {errors?.[field] && (
        <p className="mt-1 text-xs text-red-600">
          {errors?.[field]}
        </p>
      )}
    </div>
  );
};

export default RadioField;
