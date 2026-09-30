"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check, X } from "lucide-react";

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
    <div className="relative flex-1 sm:flex-none" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition sm:w-auto ${
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
        <>
          {/* Mobile backdrop for the bottom-sheet variant — matches
              ProgramFilterPanel's Filters panel, whose right-anchored fixed
              width panel would otherwise overflow off the left edge of a
              narrow viewport (the button sits well left-of-center there). */}
          <div className="fixed inset-0 z-[90] bg-black/30 sm:hidden" onClick={close} />

          <div
            role="dialog"
            aria-label="Sort by"
            className="fixed inset-x-0 bottom-0 z-[100] max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white p-1.5 shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-64 sm:rounded-xl sm:border sm:shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-3.5 sm:hidden">
              <h4 className="text-sm font-semibold text-slate-900">Sort by</h4>
              <button type="button" onClick={close} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-1.5 sm:p-0">
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
          </div>
        </>
      )}
    </div>
  );
}
