"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import { fieldControl, fieldError, fieldLabel, fieldControlError, popover, searchField, focusRing } from "components/ub/recipes";

// Unibexs combobox styling (brief §4.2, §4.7 dropdown): control-height
// trigger, radius-12 popover with shadow-md, pill search, 40px option rows.
const triggerBase = `${fieldControl} flex items-center justify-between gap-2 text-start ${focusRing}`;
const optionBase =
  "flex min-h-10 w-full items-center gap-2 rounded-ub-md px-3 py-2 text-start text-ub-body-sm text-ub-text-primary transition-colors duration-ub-fast ease-ub-standard";
const optionEnabled = "cursor-pointer hover:bg-ub-surface-subtle";
const optionDisabled = "cursor-not-allowed text-ub-text-disabled";
const noResults = "px-3 py-2 text-ub-body-sm text-ub-text-tertiary";

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(/[\.\[\]]/)
    .filter(Boolean)
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const CreatableSelectField = ({
                                label = "",
                                field,
                                dataField = undefined,
                                options = [],
                                required = true,
                                formData,
                                errors,
                                updateFormData,
                                placeholder = "Select...",
                                disabledOptions = [],
                                onSelect = undefined,
                                onBlur = undefined,
                                // Matches the plain <select>-based FilterSelectField's height/padding
                                // (h-10, py-2.5) for use alongside it in a filter/toolbar row, instead
                                // of the taller h-12 sizing that matches InputField/SelectField in a
                                // full form. Also drops the outer mb-4 and the trigger's mt-2, which
                                // exist to space a field from its label/neighbors inside a form but
                                // double up on the gap a filter row's own flex/gap already provides.
                                compact = false,
                              }) => {
  const containerRef = useRef(null);

  const selectedValue = getNestedValue(formData, field) ?? "";

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedOption = options.find(
    (opt) => opt.value === selectedValue
  );

  const selectedLabel = selectedOption?.label ?? selectedValue ?? "";

  const filteredOptions = useMemo(() => {
    return options.filter(
      (opt) => opt.label && opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setSearch("");
        onBlur?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  const handleSelect = (option) => {
    if (disabledOptions.includes(option.value)) return;

    updateFormData(field, option.value);
    setIsOpen(false);
    setSearch("");
    onSelect?.(option.value);
  };

  return (
    <div className={compact ? "" : "mb-4"} ref={containerRef} data-field={dataField ?? field}>

      {label && (
        <label className={fieldLabel}>
          {label} {required && <span className="text-ub-tone-danger-text" aria-hidden="true">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`${triggerBase} ${compact ? "h-10" : "h-12 md:h-10"} ${errors?.[field] ? fieldControlError : ""}`}
      >
        <span className={`truncate ${selectedLabel ? "text-ub-text-primary" : "text-ub-text-tertiary"}`}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 text-ub-text-tertiary transition-transform duration-ub-fast motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (

        <div
          className={`animate-in fade-in slide-in-from-top-2 motion-reduce:animate-none absolute z-[9999] mt-1 p-2 ${popover}`}
          style={{
            width: containerRef.current
              ? containerRef.current.offsetWidth
              : "100%",
          }}
        >

          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ub-text-tertiary" />
            <input
              type="text"
              placeholder="Search"
              aria-label="Search options"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsOpen(false);
                  setSearch("");
                }
              }}
              className={searchField}
            />
          </div>

          <ul role="listbox" className="mt-2 max-h-60 space-y-0.5 overflow-y-auto">

            {filteredOptions.map((opt) => {
              const isDisabled = disabledOptions.includes(opt.value);

              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === selectedValue}
                  aria-disabled={isDisabled || undefined}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!isDisabled) handleSelect(opt);
                  }}
                  className={`${optionBase} ${isDisabled ? optionDisabled : optionEnabled} ${opt.value === selectedValue ? "bg-ub-selected font-medium" : ""}`}
                >
                  {opt.label}
                </li>
              );
            })}

            {!filteredOptions.length && (
              <li className={noResults}>No results found</li>
            )}

          </ul>
        </div>
      )}

      {errors?.[field] && (
        <p className={fieldError} role="alert">
          {errors?.[field]}
        </p>
      )}
    </div>
  );
};

export default CreatableSelectField;