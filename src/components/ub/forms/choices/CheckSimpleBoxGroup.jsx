import React, { useId, useState } from "react";
import { Search } from "lucide-react";
import { buttonVariants, card, checkbox, fieldWrapper, focusRing, searchField } from "components/ub/recipes";
import { CheckboxMark, FieldError, FieldLabel, describedBy } from "components/ub/forms/layout/FieldChrome";

const CheckSimpleBoxGroup = ({
  label,
  field,
  options,
  formData,
  updateFormData,
  errors,
  required = false,
}) => {
  const id = useId();
  const error = errors?.[field];
  const errorId = error ? `${id}-error` : undefined;
  const labelId = `${id}-label`;
  const searchId = `${id}-search`;

  const isSelected = (optionId) => {
    const selected = formData[field] || [];
    return selected.includes(optionId);
  };

  const [search, setSearch] = useState("");

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelection = (optionId) => {
    const selected = formData[field] || [];
    let newSelected;
    if (selected.includes(optionId)) {
      newSelected = selected.filter((i) => i !== optionId);
    } else {
      newSelected = [...selected, optionId];
    }
    updateFormData(field, newSelected);
  };

  // Tertiary sm button; disabled keeps a transparent fill instead of the filled disabled pill.
  const tertiarySm =
    `inline-flex h-8 shrink-0 items-center rounded-ub-full px-3 text-ub-label-md transition-colors duration-ub-fast ease-ub-standard ${buttonVariants.tertiary} ${focusRing} ` +
    "disabled:cursor-not-allowed disabled:text-ub-text-disabled disabled:hover:bg-transparent";

  return (
    <div className={fieldWrapper} data-field={field}>
      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={describedBy(errorId)}
        className={`${card} space-y-3 p-4 ${error ? "border-ub-danger-500" : ""}`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <FieldLabel as="span" id={labelId} required={required} className="mb-0">{label}</FieldLabel>

          {filteredOptions.length > 0 && (
            <span className="ub-tabular shrink-0 text-ub-body-sm text-ub-text-tertiary" aria-live="polite">
              {filteredOptions.filter((o) => isSelected(o.id)).length} selected
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search aria-hidden="true" strokeWidth={1.75} className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ub-icon-default" />
            <label htmlFor={searchId} className="sr-only">Search options</label>
            <input
              id={searchId}
              type="text"
              placeholder="Search value..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={searchField}
            />
          </div>

          <button
            type="button"
            onClick={() => setSearch("")}
            disabled={!search}
            className={tertiarySm}
          >
            Clear search
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const selected = isSelected(option.id);

              return (
                <label
                  key={option.id}
                  className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-ub-md border px-3 py-1.5 text-ub-body-sm transition-colors duration-ub-fast ease-ub-standard motion-reduce:transition-none ${
                    selected
                      ? "border-ub-action-primary bg-ub-selected text-ub-text-primary"
                      : "border-ub-border bg-ub-surface text-ub-text-secondary hover:border-ub-border-hover hover:text-ub-text-primary"
                  }`}
                >
                  <span className="relative grid shrink-0 place-items-center">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelection(option.id)}
                      className={checkbox}
                    />
                    <CheckboxMark checked={selected} />
                  </span>
                  {option.name}
                </label>
              );
            })
          ) : (
            <div className="w-full rounded-ub-md border border-dashed border-ub-border-control bg-ub-surface-subtle px-4 py-6 text-center">
              <p className="text-ub-body-sm text-ub-text-secondary">No results found</p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className={`${tertiarySm} mt-2`}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
};

export default CheckSimpleBoxGroup;
