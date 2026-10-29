// components/form/ArrayObjectField.jsx
import React, { useId } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  buttonBase,
  buttonSizes,
  buttonVariants,
  card,
  fieldControl,
  fieldControlError,
  fieldControlHeight,
  fieldLabel,
  focusRing,
  iconButtonSizes,
} from "components/ub/recipes";
import { FieldError, SelectChevron, describedBy, selectControl } from "components/ub/forms/FieldChrome";

// Remove-row icon button: neutral at rest, danger tint on hover (brief §4.1:
// no filled destructive outside dialogs).
const removeButton =
  `grid shrink-0 place-items-center rounded-ub-full text-ub-icon-default transition-colors duration-ub-fast ease-ub-standard ${iconButtonSizes.md} ${focusRing} ` +
  "hover:bg-ub-tone-danger-bg hover:text-ub-tone-danger-text disabled:cursor-not-allowed disabled:text-ub-text-disabled disabled:hover:bg-transparent";

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
  // "start" keeps new rows immediately visible without scrolling; "end"
  // appends instead, for fields (like yearly fees) where array position
  // is read as meaningful order elsewhere and shouldn't get scrambled.
  insertPosition = "start",
}) => {
  const baseId = useId();
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
    const newRow = buildDefaultRow(arrayValue);
    updateFormData(field, insertPosition === "end" ? [...arrayValue, newRow] : [newRow, ...arrayValue]);
  };

  const removeRow = (index) => {
    if (arrayValue.length <= 1) return;

    const newArray = arrayValue.filter((_, i) => i !== index);
    updateFormData(field, newArray);
  };

  const addLabel = subLabel ? `Add ${subLabel}` : "Add";

  return (
    <div className="space-y-4 rounded-ub-lg border border-ub-border bg-ub-surface-subtle p-4">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <span id={`${baseId}-label`} className="text-ub-label-lg text-ub-text-primary">
          {label}
        </span>

        <div className="flex items-center gap-3">
          {headerExtra}

          <button
            type="button"
            onClick={addRow}
            className={`${buttonBase} ${buttonVariants.secondary} ${buttonSizes.sm}`}
          >
            <Plus aria-hidden="true" strokeWidth={2} className="h-4 w-4" />
            <span className="truncate">{addLabel}</span>
          </button>
        </div>
      </div>

      {arrayValue.length === 0 && (
        <div className="rounded-ub-md border-ub-strong border-dashed border-ub-border-control py-6 text-center text-ub-body-sm text-ub-text-secondary">
          No entries yet. Click &ldquo;{addLabel}&rdquo; to add one.
        </div>
      )}

      {arrayValue.map((item, index) => (
        <div
          key={index}
          role="group"
          aria-label={`${subLabel || label || "Entry"} ${index + 1}`}
          className={`${card} space-y-4 p-4`}
        >

          <div className="flex items-center justify-between border-b border-ub-border pb-2">

            <div className="flex items-center gap-2.5">
              <span className="ub-tabular grid h-6 w-6 shrink-0 place-items-center rounded-ub-full bg-ub-tone-brand-bg text-ub-label-sm text-ub-tone-brand-text">
                {index + 1}
              </span>
              <span className="text-ub-label-md text-ub-text-primary">
                {subLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={arrayValue.length <= 1}
              aria-label={`Remove ${subLabel || "entry"} ${index + 1}`}
              title={`Remove ${subLabel || "entry"} ${index + 1}`}
              className={removeButton}
            >
              <Trash2 aria-hidden="true" strokeWidth={1.75} className="h-5 w-5" />
            </button>

          </div>

          <div className={`grid grid-cols-1 gap-4 ${GRID_COLS_CLASS[columns] || GRID_COLS_CLASS[2]}`}>

            {fields.map((f) => {
              const errorPath = `${field}[${index}].${f.key}`;
              const errorMessage = errors?.[errorPath];
              const inputId = `${baseId}-${index}-${f.key}`;
              const errorId = errorMessage ? `${inputId}-error` : undefined;
              const controlClass = `${fieldControl} ${fieldControlHeight} ${errorMessage ? fieldControlError : ""}`;
              const a11y = {
                id: inputId,
                "aria-invalid": errorMessage ? true : undefined,
                "aria-describedby": describedBy(errorId),
              };

              return (
                <div key={f.key} data-field={errorPath}>

                  <label htmlFor={inputId} className={fieldLabel}>
                    {f.label}
                  </label>

                  {f.type === "select" ? (
                    <div className="relative">
                      <select
                        {...a11y}
                        value={item?.[f.key] ?? ""}
                        onChange={(e) =>
                          handleChange(index, f.key, e.target.value)
                        }
                        className={`${controlClass} ${selectControl}`}
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
                      <SelectChevron />
                    </div>
                  ) : (
                    <input
                      {...a11y}
                      type={f.type || "text"}
                      value={item?.[f.key] ?? ""}
                      placeholder={f.placeholder || ""}
                      onChange={(e) =>
                        handleChange(index, f.key, e.target.value)
                      }
                      className={`${controlClass} ${f.type === "number" ? "ub-tabular" : ""}`}
                    />
                  )}

                  <FieldError id={errorId}>{errorMessage}</FieldError>

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
