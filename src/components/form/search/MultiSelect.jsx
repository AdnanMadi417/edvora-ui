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
  label,
  field,
  options = [],
  required = true,
  formData,
  errors,
  updateFormData,
  placeholder = "Select...",
  disabledOptions = [],
}) => {
  const containerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedValues = getNestedValue(formData, field) ?? [];
  const selectedLabels = options
    .filter((opt) => selectedValues.includes(opt.value))
    .map((opt) => opt.label);

  const filteredOptions = useMemo(() => {
    return options.filter(
      (opt) =>
        opt.label && opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (disabledOptions.includes(option.value)) return;

    let newValues = [...selectedValues];

    if (newValues.includes(option.value)) {
      newValues = newValues.filter((v) => v !== option.value);
    } else {
      newValues.push(option.value);
    }

    updateFormData(field, newValues);
  };

  return (
    <div className="z-[9999] mb-4" ref={containerRef}>
      <label className="block text-sm font-medium text-slate-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`mt-2 flex h-12 w-full items-center justify-between rounded-md border bg-white p-3 px-3 py-2 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          getNestedValue(errors, field) ? "border-red-500" : "border-default"
        }`}
      >
        <span
          className={`${
            selectedLabels.length ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
        </span>

        <span className="text-xs text-slate-500">
          <ChevronDown className="h-5 w-5" />
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
            className={`mt-2 flex h-10 w-full items-start justify-start rounded-md border p-3 px-3 py-2 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1  focus:ring-blue-500 ${
              getNestedValue(errors, field)
                ? "border-red-500"
                : "border-default"
            }`}
          />

          <ul className="max-h-40 overflow-y-auto text-sm">
            {filteredOptions.map((opt) => {
              const isDisabled = disabledOptions.includes(opt.value);

              return (
                <li
                  key={opt.value}
                  onClick={() => !isDisabled && handleSelect(opt)}
                  className={`mt-2 flex h-10 w-full items-center gap-2 rounded-md border px-3 py-2 text-sm
  ${
    isDisabled
      ? "cursor-not-allowed bg-slate-100 text-slate-400"
      : "cursor-pointer hover:bg-blue-50"
  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(opt.value)}
                    readOnly
                  />
                  {opt.label}
                </li>
              );
            })}

            {!filteredOptions.length && (
              <div className="mt-2 border-t pt-2">
                <li className="px-3 py-2 text-slate-400">No results found</li>
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

export default CreatableSelectField;
