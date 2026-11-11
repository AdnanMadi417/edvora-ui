"use client";

import React from "react";
import { CALENDAR_MONTHS } from "features/programs/utils/intakeMonths";

interface IntakeMonthsFieldProps {
  field: string;
  formData: Record<string, any>;
  errors: Record<string, string>;
  updateFormData: (field: string, value: any) => void;
  label?: string;
  required?: boolean;
}

/** Recurring calendar-month picker — replaces the old day-precision date
 * pickers everywhere a program or university's intake months are set.
 * There's no year or day anymore: a month here just means "this program
 * takes a new intake every year in this month." */
export default function IntakeMonthsField({
  field,
  formData,
  errors,
  updateFormData,
  label = "Intake Months",
  required = false,
}: IntakeMonthsFieldProps) {
  const selected: number[] = formData[field] || [];

  const toggleMonth = (month: number) => {
    updateFormData(field, selected.includes(month) ? selected.filter((m) => m !== month) : [...selected, month].sort((a, b) => a - b));
  };

  return (
    <div data-field={field}>
      <label className="mb-2 block text-sm font-semibold text-ub-text-primary">
        {label} {required && <span className="text-ub-tone-danger-text">*</span>}
      </label>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {CALENDAR_MONTHS.map((m) => {
          const isSelected = selected.includes(m.value);
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => toggleMonth(m.value)}
              aria-pressed={isSelected}
              className={`rounded-ub-full border px-3 py-2 text-sm font-medium transition ${
                isSelected
                  ? "border-ub-action-primary bg-ub-tone-brand-bg text-ub-text-link"
                  : "border-ub-border bg-ub-surface text-ub-text-secondary hover:border-ub-border hover:bg-ub-surface-subtle"
              }`}
            >
              {m.short}
            </button>
          );
        })}
      </div>

      <p className="mt-1.5 text-xs text-ub-text-tertiary">Programs recur every year in the months you select here.</p>

      {errors?.[field] && <p className="mt-1 text-xs text-ub-tone-danger-text">{errors[field]}</p>}
    </div>
  );
}
