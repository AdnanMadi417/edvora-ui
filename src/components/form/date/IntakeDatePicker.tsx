"use client";

import React from "react";
import { CALENDAR_MONTHS, resolveIntakeDate } from "features/programs/utils/intakeMonths";

interface IntakeDatePickerProps {
  /** Recurring calendar months (1–12) this program takes intakes in. */
  months: number[];
  /** The application's actual chosen intake date — still a real date
   * (Application.intake_date), resolved from whichever month is picked. */
  value: string;
  onChange: (date: string) => void;
  error?: string;
}

/** Purely controlled — the parent form owns resolving a sensible default
 * (see the intake-months effect in ProgramApplicationForm/
 * StudentRegistrationForm), since that has to work even when this picker
 * isn't rendered at all (a program with 0 or 1 recurring months skips it). */
export default function IntakeDatePicker({
  months,
  value,
  onChange,
  error,
}: IntakeDatePickerProps) {
  const selectedMonth = value ? new Date(value).getMonth() + 1 : null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {months.map((month) => {
          const selected = selectedMonth === month;
          return (
            <button
              key={month}
              type="button"
              onClick={() => onChange(resolveIntakeDate(month))}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                selected
                  ? "border border-blue-500 bg-blue-500 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {CALENDAR_MONTHS.find((m) => m.value === month)?.short ?? month}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
