"use client";

import React, { useId } from "react";
import Combobox from "./Combobox";

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
        <Combobox compact id={id} ariaLabel="Sort by" value={value === "all" ? "" : value} onChange={next => onChange(next || "all")} options={[{ value: "", label: "Default sort" }, ...SORT_OPTIONS]} disabled={disabled} />
      </div>
    </div>
  );
}
