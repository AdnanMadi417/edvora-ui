"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Coins } from "lucide-react";

interface CurrencySelectorProps {
  value: string;
  options: string[];
  onChange: (currency: string) => void;
}

export default function CurrencySelector({ value, options, onChange }: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (options.length <= 1) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex h-10 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition ${
          open
            ? "border-slate-300 bg-slate-100 text-slate-800"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <Coins className="h-4 w-4 text-slate-400" />
        {value}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 max-h-64 w-32 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-100"
        >
          {options.map((currency) => (
            <button
              key={currency}
              type="button"
              role="menuitem"
              onClick={() => {
                onChange(currency);
                setOpen(false);
              }}
              className={`flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                currency === value ? "font-semibold text-blue-600" : "text-slate-700"
              }`}
            >
              {currency}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
