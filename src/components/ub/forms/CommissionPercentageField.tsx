"use client";

import React, { useId } from "react";
import { Info } from "lucide-react";
import Tooltip from "components/ub/feedback/Tooltip";
import { fieldControl, fieldControlError, fieldControlHeight, fieldWrapper } from "components/ub/recipes";
import { FieldError, FieldLabel, SelectChevron, describedBy, selectControl } from "components/ub/forms/FieldChrome";

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
  const id = useId();
  const value = formData[field] ?? "";
  const error = errors?.[field];
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={fieldWrapper} data-field={field}>
      <div className="flex items-center gap-1.5">
        <FieldLabel htmlFor={id} required={required}>Commission display percentage</FieldLabel>
        <span className="mb-1.5 inline-flex">
          <Tooltip
            position="top"
            content="What percentage of the total commission this member sees reflected in their own dashboard — this doesn't change their actual payout."
          >
            <Info aria-hidden="true" strokeWidth={1.75} className="h-4 w-4 text-ub-icon-default" />
          </Tooltip>
        </span>
      </div>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => updateFormData(field, Number(e.target.value))}
          disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(errorId)}
          className={`${fieldControl} ${fieldControlHeight} ${selectControl} ub-tabular ${error ? fieldControlError : ""}`}
        >
          {PERCENTAGE_OPTIONS.map((pct) => (
            <option key={pct} value={pct}>{pct}%</option>
          ))}
        </select>
        <SelectChevron />
      </div>

      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
