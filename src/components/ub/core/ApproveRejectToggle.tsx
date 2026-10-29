"use client";

import React from "react";
import { Building2, CheckCircle, XCircle } from "lucide-react";
import { focusRing } from "components/ub/recipes";

interface Props {
  value: "approved" | "rejected" | null;
  onChange: (value: "approved" | "rejected") => void;
  disabled?: boolean;
  companyName?: string;
}

const optionBase =
  `flex flex-col items-center justify-center gap-2 rounded-ub-lg border-ub-strong px-4 py-5 text-ub-label-md ${focusRing} ` +
  "transition-[background-color,border-color,color] duration-ub-fast ease-ub-standard motion-reduce:transition-none disabled:cursor-not-allowed";
// Unselected options grey out when disabled; the selected one keeps its colour
// (dimmed) so the recorded decision stays readable.
const optionIdle =
  "border-ub-border bg-ub-surface text-ub-text-secondary disabled:border-ub-border disabled:bg-ub-disabled disabled:text-ub-text-disabled";

export default function ApproveRejectToggle({ value, onChange, disabled, companyName }: Props) {
  return (
    <div className="space-y-3">
      {companyName && (
        <div className="flex items-center gap-2 rounded-ub-md border border-ub-border bg-ub-surface-subtle px-3 py-2">
          <Building2 className="h-4 w-4 shrink-0 text-ub-icon" aria-hidden />
          <div className="min-w-0">
            <p className="text-ub-label-sm text-ub-text-tertiary">Stakeholder</p>
            <p className="truncate text-ub-label-md text-ub-text-primary">{companyName}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Decision">
        <button
          type="button"
          disabled={disabled}
          aria-pressed={value === "approved"}
          onClick={() => onChange("approved")}
          className={`${optionBase} ${
            value === "approved"
              ? "border-ub-success-600 bg-ub-success-600 text-ub-text-on-action disabled:opacity-60"
              : `${optionIdle} hover:border-ub-tone-success-border hover:bg-ub-tone-success-bg hover:text-ub-tone-success-text`
          }`}
        >
          <CheckCircle className="h-6 w-6" aria-hidden />
          Approve
        </button>

        <button
          type="button"
          disabled={disabled}
          aria-pressed={value === "rejected"}
          onClick={() => onChange("rejected")}
          className={`${optionBase} ${
            value === "rejected"
              ? "border-ub-danger-600 bg-ub-danger-600 text-ub-text-on-action disabled:opacity-60"
              : `${optionIdle} hover:border-ub-tone-danger-border hover:bg-ub-tone-danger-bg hover:text-ub-tone-danger-text`
          }`}
        >
          <XCircle className="h-6 w-6" aria-hidden />
          Reject
        </button>
      </div>
    </div>
  );
}
