"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

export interface RadioCardOption<T extends string> {
  value: T;
  label: string;
  hint: string;
  icon: LucideIcon;
}

interface RadioCardGroupProps<T extends string> {
  ariaLabel: string;
  options: RadioCardOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A row of selectable cards acting as a single-choice radio group (e.g. "Transfer vs Share"). */
export default function RadioCardGroup<T extends string>({
  ariaLabel,
  options,
  value,
  onChange,
}: RadioCardGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map(({ value: optionValue, label, hint, icon: Icon }) => {
        const active = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(optionValue)}
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition ${
              active
                ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-blue-600" : "text-slate-400"}`} />
            <span>
              <span className={`block text-sm font-medium ${active ? "text-blue-800" : "text-slate-900"}`}>{label}</span>
              <span className="block text-xs text-slate-500">{hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
