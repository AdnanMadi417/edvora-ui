"use client";

import React, { useEffect } from "react";

interface IntakeDatePickerProps {
  dates: string[];
  value: string;
  onChange: (date: string) => void;
  error?: string;
}

function parseDate(dateStr: string): Date | null {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function isPast(dateStr: string): boolean {
  const d = parseDate(dateStr);
  if (!d) return false;
  const now = new Date();
  return (
    d.getFullYear() < now.getFullYear() ||
    (d.getFullYear() === now.getFullYear() && d.getMonth() < now.getMonth())
  );
}

function formatLabel(dateStr: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short" });
}

export default function IntakeDatePicker({
  dates,
  value,
  onChange,
  error,
}: IntakeDatePickerProps) {
  const nearestUpcoming = dates.find((d) => !isPast(d)) ?? null;

  useEffect(() => {
    if (!dates.length) return;
    const isCurrentValid = value && !isPast(value) && dates.includes(value);
    if (!isCurrentValid && nearestUpcoming) {
      onChange(nearestUpcoming);
    }
  }, [dates]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {dates.map((date) => {
          const past = isPast(date);
          const selected = value === date;
          return (
            <button
              key={date}
              type="button"
              disabled={past}
              onClick={() => onChange(date)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                past
                  ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 line-through"
                  : selected
                  ? "border border-blue-500 bg-blue-500 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {formatLabel(date)}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
