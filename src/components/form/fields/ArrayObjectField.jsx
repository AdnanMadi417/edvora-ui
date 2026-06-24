// components/form/ArrayObjectField.jsx
import React from "react";
import AddDate from "../../ui/buttons/IconButton";
import { CalendarPlus, Trash2 } from "lucide-react";
import IconButton from "../../ui/buttons/IconButton";

const getNestedValue = (obj, path) => {
  if (!path) return undefined;

  return path
    .split(/[\.\[\]]/)
    .filter(Boolean)
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const setArrayFieldValue = (array, index, key, value) => {
  const newArray = [...(array || [])];

  newArray[index] = {
    ...newArray[index],
    [key]: value,
  };

  return newArray;
};

const ArrayObjectField = ({
  label,
  subLabel,
  field,
  formData,
  errors,
  updateFormData,
  fields = [],
  getDefaultRow = undefined,
}) => {
  const arrayValue = getNestedValue(formData, field) || [];

  const buildDefaultRow = (currentArray) => {
    if (getDefaultRow) return getDefaultRow(currentArray);
    return fields.reduce((acc, f) => {
      acc[f.key] = "";
      return acc;
    }, {});
  };

  const handleChange = (index, key, value) => {
    updateFormData(field, setArrayFieldValue(arrayValue, index, key, value));
  };

  const addRow = () => {
    updateFormData(field, [...arrayValue, buildDefaultRow(arrayValue)]);
  };

  const removeRow = (index) => {
    if (arrayValue.length <= 1) return;

    const newArray = arrayValue.filter((_, i) => i !== index);
    updateFormData(field, newArray);
  };

  return (
    <div className="space-y-4 rounded-lg border border-default p-4">

      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-900">
          {label}
        </label>

        <AddDate
          icon={<CalendarPlus className="h-4 w-4" />}
          text="Add Date"
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-blue-800"
          hoverBorderColor="hover:border-blue-700"
          onClick={addRow}
        />
      </div>

      {arrayValue.length === 0 && (
        <p className="py-2 text-center text-sm text-slate-400">No entries yet. Click + to add one.</p>
      )}

      {arrayValue.map((item, index) => (
        <div
          key={index}
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"
        >

          <div className="flex items-center justify-between border-b border-slate-100 pb-2">

        <span className="text-sm font-medium text-slate-700">
          {subLabel} {index + 1}
        </span>

            <IconButton
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => removeRow(index)}
              disabled={arrayValue.length <= 1}
              bgColor="bg-red-50"
              textColor="text-red-600"
              borderColor="border-red-200"
              hoverTextColor="hover:text-red-700"
              hoverBorderColor="hover:border-red-300"
            />

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {fields.map((f) => {
              const errorPath = `${field}[${index}].${f.key}`;
              const errorMessage = errors?.[errorPath];

              return (
                <div key={f.key} className="space-y-1">

                  <label className="block text-xs font-medium text-slate-700">
                    {f.label}
                  </label>

                  <input
                    type={f.type || "text"}
                    value={item?.[f.key] ?? ""}
                    placeholder={f.placeholder || ""}
                    onChange={(e) =>
                      handleChange(index, f.key, e.target.value)
                    }
                    className="h-11 w-full rounded-lg border border-default px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  {errorMessage && (
                    <p className="text-xs text-red-600">{errorMessage}</p>
                  )}

                </div>
              );
            })}

          </div>
        </div>
      ))}

    </div>
  );
};

export default ArrayObjectField;
