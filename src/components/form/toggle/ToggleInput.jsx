import React from "react";

const ToggleInput = ({
                       label,
                       field,
                       formData,
                       updateFormData,
                       errors,
                       required = false,
                     }) => {
  const selected = Boolean(formData[field]);

  const toggle = () => {
    updateFormData(field, !selected);
  };

  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-semibold text-slate-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <label
        className={`group relative flex cursor-pointer items-center justify-between rounded-md border px-4 py-4 transition-all
        ${
          selected
            ? "border-blue-600 bg-blue-50 shadow-sm"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
        }
      `}
      >
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-800">
            {selected ? "Enabled" : "Disabled"}
          </span>
          <span className="text-xs text-slate-400">
            Click to toggle
          </span>
        </div>

        <div className="relative">
          <input
            type="checkbox"
            checked={selected}
            onChange={toggle}
            className="peer sr-only"
          />
          <div className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-600" />
          <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </div>

        {selected && (
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-blue-600" />
        )}
      </label>

      {errors?.[field] && (
        <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
      )}
    </div>
  );
};

export default ToggleInput;