import React from "react";
import { Trash2,CalendarPlus } from "lucide-react";
import AddDate from "../../ui/buttons/IconButton";

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(/[\.\[\]]/)
    .filter(Boolean)
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const MultipleDateInput = ({
  label,
  field,
  required = true,
  formData,
  errors,
  updateFormData,
}) => {
  const dates = getNestedValue(formData, field) || [];
  const today = new Date().toISOString().split("T")[0];

  const addDate = () => updateFormData(field, [...dates, ""]);

  const updateDate = (index, value) => {
    const newDates = [...dates];
    newDates[index] = value;
    updateFormData(field, newDates);
  };

  const removeDate = (index) => {
    updateFormData(field, dates.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4 rounded-md border border-slate-300 bg-white p-6 text-center">
      <div className="flex items-center justify-between">
        <label className="text-p2 font-medium text-slate-900">
          {label} {required && <span className="text-red-600">*</span>}
        </label>

        <AddDate
          icon={<CalendarPlus className="h-4 w-4" />}
          text="Add Date"
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-blue-800"
          hoverBorderColor="hover:border-blue-700"
          onClick={addDate}
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {dates.length === 0 && (
          <p className="w-full py-2 text-center text-sm text-slate-400">No intake dates added yet.</p>
        )}
        {dates.map((date, i) => (
          <div key={i} className="flex items-center gap-2 rounded-md border p-2">
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => updateDate(i, e.target.value)}
              aria-label={`Intake date ${i + 1}`}
              className={`h-12 flex-1 rounded-md border px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${
                errors?.[`${field}[${i}]`]
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200"
              }`}
            />

            <button
              type="button"
              onClick={() => removeDate(i)}
              aria-label={`Remove intake date ${i + 1}`}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-red-600 text-red-600 transition hover:border-red-700 hover:text-red-700"
              title="Remove this date"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {errors?.[field] && (
        <p className="mt-1 text-xs text-red-600">{errors?.[field]}</p>
      )}
    </div>  );
};

export default MultipleDateInput;
