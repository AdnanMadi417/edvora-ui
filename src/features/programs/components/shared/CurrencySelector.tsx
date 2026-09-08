"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Coins } from "lucide-react";

interface CurrencySelectorProps {
  value: string | null;
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
        className={`flex h-10 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium shadow-sm transition cursor-pointer ${
          open
            ? "border-slate-300 bg-slate-50 text-slate-600"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <Coins className="h-4 w-4 text-slate-500" />
        {value ?? "Currency"}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 max-h-64 w-32 overflow-y-scroll rounded-lg bg-white py-1 shadow-lg divide-y divide-slate-100 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent"
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
              className={`flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                currency === value ? "font-semibold text-slate-800" : "text-slate-700"
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
