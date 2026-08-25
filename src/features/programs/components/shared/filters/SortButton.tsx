"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

const SORT_OPTIONS: Option[] = [
  { label: "Commission: High → Low", value: "commission_desc" },
  { label: "Commission: Low → High", value: "commission_asc" },
  { label: "Tuition: Low → High", value: "tuition_asc" },
  { label: "Tuition: High → Low", value: "tuition_desc" },
];

interface SortButtonProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortButton({ value, onChange }: SortButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);
  const isActive = value !== "all";
  const activeLabel = SORT_OPTIONS.find((o) => o.value === value)?.label;

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    close();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex h-10 shrink-0 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${
          open || isActive
            ? "border-blue-300 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        <ArrowUpDown className="h-4 w-4" />
        <span className="hidden sm:inline">{isActive ? activeLabel : "Sort"}</span>
        <span className="sm:hidden">Sort</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Sort by"
          className="absolute right-0 top-full z-[100] mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          <button
            type="button"
            role="menuitemradio"
            aria-checked={!isActive}
            onClick={() => handleSelect("all")}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            Default sort
            {!isActive && <Check className="h-4 w-4 text-blue-600" />}
          </button>
          <div className="my-1 h-px bg-slate-100" />
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="menuitemradio"
              aria-checked={value === opt.value}
              onClick={() => handleSelect(opt.value)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
            >
              {opt.label}
              {value === opt.value && <Check className="h-4 w-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
