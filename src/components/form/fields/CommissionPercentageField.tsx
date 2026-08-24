"use client";

import React from "react";
import { Info } from "lucide-react";
import { Tooltip } from "components/ui/tooltip";

interface CommissionPercentageFieldProps {
  field: string;
  formData: Record<string, any>;
  errors?: Record<string, string>;
  updateFormData: (field: string, value: unknown) => void;
  disabled?: boolean;
  required?: boolean;
}

const PERCENTAGE_OPTIONS = Array.from({ length: 100 }, (_, i) => i + 1);

export default function CommissionPercentageField({
  field,
  formData,
  errors,
  updateFormData,
  disabled = false,
  required = true,
}: CommissionPercentageFieldProps) {
  const value = formData[field] ?? "";

  return (
    <div className="mb-4" data-field={field}>
      <label className="flex items-center gap-1.5 text-p2 font-medium text-slate-900">
        Commission Display Percentage {required && <span className="text-red-600">*</span>}
        <Tooltip
          position="top"
          content="What percentage of the total commission this member sees reflected in their own dashboard — this doesn't change their actual payout."
        >
          <Info className="h-3.5 w-3.5 text-slate-400" />
        </Tooltip>
      </label>

      <select
        value={value}
        onChange={(e) => updateFormData(field, Number(e.target.value))}
        disabled={disabled}
        className={`mt-2 flex h-12 w-full items-center justify-start rounded-lg border p-3 px-3 py-2 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 ${
          errors?.[field] ? "border-red-500 bg-red-50" : "border-slate-200 bg-white hover:bg-slate-50"
        }`}
      >
        {PERCENTAGE_OPTIONS.map((pct) => (
          <option key={pct} value={pct}>{pct}%</option>
        ))}
      </select>

      {errors?.[field] && (
        <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
      )}
    </div>
  );
}
