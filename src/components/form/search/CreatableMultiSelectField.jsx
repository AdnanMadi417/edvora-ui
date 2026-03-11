
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

const CreatableMultiSelectField = ({
                                     label,
                                     field,
                                     options = [],
                                     required = true,
                                     formData,
                                     errors,
                                     updateFormData,
                                     placeholder = "Select...",
                                     actions = []
                                   }) => {

  const containerRef = useRef(null);

  const selectedValues = getNestedValue(formData, field) ?? [];

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedOptions = options.filter(opt =>
    selectedValues.includes(opt.value)
  );

  const filteredOptions = useMemo(() => {
    return options.filter(opt =>
      opt.label.toLowerCase().includes(search.toLowerCase())
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
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    let updatedValues;

    if (selectedValues.includes(option.value)) {
      updatedValues = selectedValues.filter(v => v !== option.value);
    } else {
      updatedValues = [...selectedValues, option.value];
    }

    updateFormData(field, updatedValues);
  };

  return (
    <div className="mb-4 relative" ref={containerRef}>

      <label className="block text-sm font-medium text-slate-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      {/* Select box */}
      <div
        onClick={() => setIsOpen(prev => !prev)}
        className={`mt-2 flex min-h-12 w-full items-center justify-between bg-white rounded-md border p-3 text-sm transition-colors focus:ring-1 focus:ring-blue-500 ${
          getNestedValue(errors, field) ? "border-red-500" : "border-default"
        }`}
      >

        <span
          className={`flex flex-wrap gap-1 ${
            selectedOptions.length ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {selectedOptions.length
            ? selectedOptions.map(opt => opt.label).join(", ")
            : placeholder}
        </span>

        <ChevronDown className="h-5 w-5 text-slate-500" />

      </div>

      {isOpen && (

        <div
          className="animate-in fade-in slide-in-from-top-2 absolute z-[9999] mt-1 rounded-md border bg-white p-3 shadow-lg"
          style={{
            width: containerRef.current
              ? containerRef.current.offsetWidth
              : "100%",
          }}
        >

          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`mt-2 flex h-10 w-full rounded-md border p-2 text-sm focus:ring-1 focus:ring-blue-500 ${
              getNestedValue(errors, field)
                ? "border-red-500"
                : "border-default"
            }`}
          />

          <ul className="max-h-60 overflow-y-auto text-sm">

            {filteredOptions.map((opt) => (

              <li
                key={opt.value}
                onClick={() => handleSelect(opt)}
                className="mt-2 flex h-10 w-full cursor-pointer items-center gap-2 rounded-md border px-3 text-sm hover:bg-gray-50"
              >

                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt.value)}
                  readOnly
                />

                {opt.label}

              </li>

            ))}

            {actions.length > 0 && !filteredOptions.length && (

              <div className="border-t mt-2 pt-2">

                <li className="px-3 py-2 text-slate-400">
                  No results found
                </li>

                {actions.map((action, index) => (

                  <li
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick?.();
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className="mt-2 flex h-10 w-full cursor-pointer items-center gap-2 rounded-md border p-3 text-sm hover:bg-slate-50"
                  >

                    {action.icon}
                    <span>{action.label}</span>

                  </li>

                ))}

              </div>

            )}

          </ul>

        </div>

      )}

      {getNestedValue(errors, field) && (
        <p className="mt-1 text-xs text-red-600">
          {getNestedValue(errors, field)}
        </p>
      )}

    </div>
  );
};

export default CreatableMultiSelectField;