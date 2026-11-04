"use client";

import React, { useId } from "react";
import { fieldControl } from "components/ub/recipes";
import { SelectChevron, selectControl } from "../layout/FieldChrome";

const SORT_OPTIONS = [
  { label: "Commission: high to low", value: "commission_desc" },
  { label: "Commission: low to high", value: "commission_asc" },
  { label: "Tuition: low to high", value: "tuition_asc" },
  { label: "Tuition: high to low", value: "tuition_desc" },
];

interface SortControlProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function SortControl({
  value,
  onChange,
  disabled = false,
}: SortControlProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={id}
        className="shrink-0 text-ub-label-md text-ub-text-secondary"
      >
        Sort by
      </label>
      <div className="relative min-w-0 flex-1">
        <select
          id={id}
          value={value === "all" ? "" : value}
          onChange={(e) => onChange(e.target.value || "all")}
          className={`${fieldControl} h-10 ${selectControl} text-ub-body-sm`}
          disabled={disabled}
        >
          <option value="">Default sort</option>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>
    </div>
  );
}
