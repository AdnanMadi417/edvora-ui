"use client";

import React, { useId } from "react";
import { CALENDAR_MONTHS, resolveIntakeDate } from "features/programs/utils/intakeMonths";
import { focusRing } from "components/ub/recipes";
import { FieldError } from "components/ub/forms/FieldChrome";

interface IntakeDatePickerProps {
  /** Recurring calendar months (1–12) this program takes intakes in. */
  months: number[];
  /** The application's actual chosen intake date — still a real date
   * (Application.intake_date), resolved from whichever month is picked. */
  value: string;
  onChange: (date: string) => void;
  error?: string;
}

// Month-year chips (brief §4.2 "Intake"): 6px-radius selectable chips; the
// selected one gets the selected fill and a 2px primary border.
const chip = (selected: boolean, invalid: boolean) =>
  `ub-tabular inline-flex h-10 items-center rounded-ub-md px-4 text-ub-label-md transition-colors duration-ub-fast ease-ub-standard motion-reduce:transition-none ${focusRing} ${
    selected
      ? "border-2 border-ub-action-primary bg-ub-selected px-[15px] text-ub-text-link"
      : `border bg-ub-surface text-ub-text-primary hover:border-ub-border-hover ${invalid ? "border-ub-danger-500" : "border-ub-border-control"}`
  }`;

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
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  const parsed = value ? new Date(value) : null;
  const selectedMonth = parsed ? parsed.getMonth() + 1 : null;

  return (
    <div>
      <div role="group" aria-label="Intake" aria-describedby={errorId} className="flex flex-wrap gap-2">
        {months.map((month) => {
          const selected = selectedMonth === month;
          // The chip names the intake it resolves to (e.g. "Sep 2026"); the
          // selected chip shows the stored date's own year.
          const year = selected && parsed ? parsed.getFullYear() : Number(resolveIntakeDate(month).slice(0, 4));
          const short = CALENDAR_MONTHS.find((m) => m.value === month)?.short ?? month;
          return (
            <button
              key={month}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(resolveIntakeDate(month))}
              className={chip(selected, Boolean(error))}
            >
              {`${short} ${year}`}
            </button>
          );
        })}
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
