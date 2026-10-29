"use client";

import React, { useId } from "react";

const SORT_OPTIONS = [
  { label: "Commission: high to low", value: "commission_desc" },
  { label: "Commission: low to high", value: "commission_asc" },
  { label: "Tuition: low to high", value: "tuition_asc"    },
  { label: "Tuition: high to low", value: "tuition_desc"   },
];

interface SortControlProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SortControl({ value, onChange }: SortControlProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="shrink-0 text-ub-label-md text-ub-text-secondary">Sort by</label>
      <select
        id={id}
        value={value === "all" ? "" : value}
        onChange={(e) => onChange(e.target.value || "all")}
        className="h-10 cursor-pointer rounded-ub-md border border-ub-border-control bg-ub-surface pe-8 ps-3 text-ub-body-sm text-ub-text-primary transition-[border-color,box-shadow] duration-ub-fast ease-ub-standard hover:border-ub-border-control-hover focus:border-ub-border-focus focus:outline-none focus:ring-1 focus:ring-ub-border-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ub-border-focus"
      >
        <option value="">Default sort</option>
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
