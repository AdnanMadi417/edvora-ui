// components/form/ArrayObjectField.jsx
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "../../ui/buttons/Button";
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

// Tailwind's JIT compiler needs the full class name present in source, so
// dynamic columns can't be templated (e.g. `md:grid-cols-${columns}`).
const GRID_COLS_CLASS = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
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
  columns = 2,
  headerExtra = null,
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
    // New entries go to the top so they're immediately visible without
    // scrolling past whatever's already been filled in.
    updateFormData(field, [buildDefaultRow(arrayValue), ...arrayValue]);
  };

  const removeRow = (index) => {
    if (arrayValue.length <= 1) return;

    const newArray = arrayValue.filter((_, i) => i !== index);
    updateFormData(field, newArray);
  };

  const addLabel = subLabel ? `Add ${subLabel}` : "Add";

  return (
    <div className="space-y-4 rounded-lg border border-slate-100 bg-slate-50/40 p-4">

      <div className="flex items-center justify-between gap-4">
        <label className="text-sm font-semibold text-slate-900">
          {label}
        </label>

        <div className="flex items-center gap-3">
          {headerExtra}

          <Button
            icon={<Plus className="h-4 w-4" />}
            text={addLabel}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-100"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-200"
            className="hover:bg-blue-100"
            onClick={addRow}
          />
        </div>
      </div>

      {arrayValue.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
          No entries yet. Click &ldquo;{addLabel}&rdquo; to add one.
        </div>
      )}

      {arrayValue.map((item, index) => (
        <div
          key={index}
          className="space-y-4 rounded-lg border border-slate-100 bg-white p-4 shadow-sm"
        >

          <div className="flex items-center justify-between border-b border-slate-100 pb-2">

            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-slate-700">
                {subLabel}
              </span>
            </div>

            <IconButton
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => removeRow(index)}
              disabled={arrayValue.length <= 1}
              bgColor="bg-transparent"
              textColor="text-slate-400"
              borderColor="border-transparent"
              hoverTextColor="hover:text-red-600"
              hoverBorderColor="hover:border-red-200"
              className="hover:bg-red-50"
            />

          </div>

          <div className={`grid grid-cols-1 gap-4 ${GRID_COLS_CLASS[columns] || GRID_COLS_CLASS[2]}`}>

            {fields.map((f) => {
              const errorPath = `${field}[${index}].${f.key}`;
              const errorMessage = errors?.[errorPath];

              return (
                <div key={f.key} className="space-y-1">

                  <label className="block text-xs font-medium text-slate-700">
                    {f.label}
                  </label>

                  {f.type === "select" ? (
                    <select
                      value={item?.[f.key] ?? ""}
                      onChange={(e) =>
                        handleChange(index, f.key, e.target.value)
                      }
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition-colors hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      {(f.options || []).map((opt) => {
                        const optValue = typeof opt === "object" ? opt.value : opt;
                        const optLabel = typeof opt === "object" ? opt.label : opt;
                        return (
                          <option key={optValue} value={optValue}>
                            {optLabel}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type={f.type || "text"}
                      value={item?.[f.key] ?? ""}
                      placeholder={f.placeholder || ""}
                      onChange={(e) =>
                        handleChange(index, f.key, e.target.value)
                      }
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-colors hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  )}

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
