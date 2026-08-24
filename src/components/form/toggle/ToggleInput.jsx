import React from "react";

const ToggleInput = ({
                       label,
                       field,
                       formData,
                       updateFormData,
                       errors,
                       required = false,
                       enabledText = "Enabled",
                       disabledText = "Disabled",
                       enabledDescription = "Click to toggle",
                       disabledDescription = "Click to toggle",
                     }) => {
  const selected = Boolean(formData[field]);

  const toggle = () => {
    updateFormData(field, !selected);
  };

  return (
    <div className="mb-5" data-field={field}>
      <label className="mb-2 block text-sm font-semibold text-slate-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <label
        className={`group relative flex cursor-pointer items-center justify-between rounded-lg border px-4 py-4 transition-all
        ${
          selected
            ? "border-blue-600 bg-blue-50 shadow-sm"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
        }
      `}
      >
        <div className="flex min-w-0 flex-col pr-3">
          <span className="truncate text-sm font-medium text-slate-800">
            {selected ? enabledText : disabledText}
          </span>
          <span className="truncate text-xs text-slate-400">
            {selected ? enabledDescription : disabledDescription}
          </span>
        </div>

        <div className="relative flex-shrink-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={toggle}
            className="peer sr-only"
          />
          <div className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-600" />
          <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </div>

      </label>

      {errors?.[field] && (
        <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
      )}
    </div>
  );
};

export default ToggleInput;