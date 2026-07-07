"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectFilterFieldProps {
  value: string[];
  onChange: (vals: string[]) => void;
  options: Option[];
  icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  className?: string;
}

export default function MultiSelectFilterField({
  value,
  onChange,
  options,
  icon: Icon,
  placeholder = "Select...",
  className = "",
}: MultiSelectFilterFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val: string) => {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  };

  const label =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? (options.find((o) => o.value === value[0])?.label ?? value[0])
        : `${value.length} selected`;

  return (
    <div ref={ref} className={`relative flex-1 sm:flex-none ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 outline-none transition-colors hover:bg-slate-50 focus:ring-1 focus:ring-blue-500"
      >
        {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-500" />}
        <span className={`truncate ${value.length === 0 ? "text-slate-500" : "text-slate-700"}`}>
          {label}
        </span>
        {value.length > 0 && (
          <span className="ml-auto mr-4 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
            {value.length}
          </span>
        )}
        <ChevronDown
          className={`absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[180px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {options.map((opt) => {
            const checked = value.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt.value)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600"
                />
                {opt.label}
              </label>
            );
          })}
          {value.length > 0 && (
            <div className="border-t border-slate-100 px-3 py-2">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-medium text-red-500 hover:text-red-700"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
