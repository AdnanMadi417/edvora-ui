"use client";

import React from "react";

const SORT_OPTIONS = [
  { label: "Commission: High → Low", value: "commission_desc" },
  { label: "Commission: Low → High", value: "commission_asc" },
  { label: "Tuition: Low → High",    value: "tuition_asc"    },
  { label: "Tuition: High → Low",    value: "tuition_desc"   },
];

interface SortControlProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-sm font-medium text-slate-500">Sort by</span>
      <select
        value={value === "all" ? "" : value}
        onChange={(e) => onChange(e.target.value || "all")}
        className="cursor-pointer rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 outline-none transition hover:bg-slate-50 focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Default sort</option>
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
