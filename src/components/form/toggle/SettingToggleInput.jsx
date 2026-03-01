import React from "react";

const ToggleInput = ({
                       label,
                       field,
                       formData,
                       updateFormData,
                       errors,
                     }) => {

  const selected = Boolean(
    field.split(".").reduce((acc, key) => acc?.[key], formData)
  );

  const toggle = () => {
    updateFormData(field, !selected);
  };

  return (
    <div className="mb-4">
      <label
        onClick={toggle}
        className={`
      flex cursor-pointer items-center justify-between gap-4 rounded-xl border
      px-5 py-4 transition-all duration-300 ease-out
      ${
          selected
            ? "border-blue-500 bg-blue-50/70 shadow-sm"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
        }
    `}
      >
        {/* Text Section */}
        <div className="flex flex-col">
      <span className="text-sm font-semibold text-slate-800">
        {label}
      </span>

          <span className="mt-0.5 text-xs text-slate-400">
        Click to toggle configuration
      </span>
        </div>

        {/* Toggle Switch */}
        <div
          className={`
        relative h-6 w-11 shrink-0 rounded-full transition-all duration-300
        ${selected ? "bg-blue-600 shadow-md shadow-blue-200" : "bg-slate-300"}
      `}
        >
          <div
            className={`
          absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md
          transition-transform duration-300 ease-out
          ${selected ? "translate-x-5" : "translate-x-0.5"}
        `}
          />
        </div>
      </label>

      {/* Error Message */}
      {errors?.[field] && (
        <p className="mt-1 text-xs font-medium text-red-600">
          {errors[field]}
        </p>
      )}
    </div>
  );
};

export default ToggleInput;