"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";

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
        <label className="block text-sm font-medium text-slate-900">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <div
        onClick={() => setIsOpen((prev) => !prev)}

        className={`${compact ? "h-10 py-2.5" : "mt-2 h-12 p-3 py-2"} flex w-full items-center justify-between rounded-lg border px-3 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          errors?.[field] ? "border-red-500 bg-red-50" : "border-slate-200 bg-white hover:bg-slate-50"
        }`}

      >
        <span
          className={`${
            selectedLabel ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {selectedLabel || placeholder}
        </span>
        <span className="text-xs text-slate-500">
          <ChevronDown   className="h-5 w-5" />
        </span>
      </div>

      {isOpen && (

        <div
          className="animate-in fade-in slide-in-from-top-2 absolute z-[9999] mt-1 rounded-md border bg-white p-3"
          style={{
            width: containerRef.current
              ? containerRef.current.offsetWidth
              : "100%",
          }}
        >

          <input
            type="text"
            placeholder="Search..."
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`mt-2 flex h-10 w-full items-start justify-start rounded-md border p-3 px-3 py-2 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white hover:bg-slate-50 ${
              errors?.[field] ? "border-red-500" : "border-slate-200"
            }`}
          />

          <ul className="max-h-40 overflow-y-auto text-sm">

            {filteredOptions.map((opt) => {
              const isDisabled = disabledOptions.includes(opt.value);

              return (
                <li
                  key={opt.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!isDisabled) handleSelect(opt);
                  }}
                  className={`mt-2 flex h-10 w-full items-center justify-start rounded-md border p-3 px-3 py-2 text-sm transition-colors
        ${isDisabled
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "cursor-pointer hover:bg-blue-50"
                  }
      `}
                >
                  {opt.label}
                </li>
              );
            })}

            {!filteredOptions.length && (
              <div className="border-t mt-2 pt-2">

                <li className="px-3 py-2 text-slate-400">
                  No results found
                </li>

              </div>
            )}

          </ul>
        </div>
      )}

      {errors?.[field] && (
        <p className="mt-1 text-xs text-red-600">
          {errors?.[field]}
        </p>
      )}
    </div>
  );
};

export default CreatableSelectField;