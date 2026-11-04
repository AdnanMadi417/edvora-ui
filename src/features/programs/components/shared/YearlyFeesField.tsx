"use client";

import React, { useId, useLayoutEffect, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import Amount from "components/ub/core/typography/Amount";
import Input from "components/ub/forms/text/Input";
import SelectField from "components/ub/forms/selection/SelectField";
import { FieldError } from "components/ub/forms/layout/FieldChrome";
import { CURRENCY_OPTIONS } from "features/programs/types";

interface YearlyFeesFieldProps {
  formData: Record<string, any>;
  errors: Record<string, string>;
  updateFormData: (field: string, value: any) => void;
  currencyField?: string;
  feesField?: string;
  alwaysShowCurrency?: boolean;
}

export default function YearlyFeesField({
  formData,
  errors,
  updateFormData,
  currencyField = "yearly_fee_currency",
  feesField = "yearly_fees",
  alwaysShowCurrency = true,
}: YearlyFeesFieldProps) {
  const id = useId();
  const root = useRef<HTMLElement>(null);
  const addButton = useRef<HTMLDivElement>(null);
  const rows: Array<{ year: number | string; fee: number | string }> =
    formData[feesField] || [];
  const pendingFocus = useRef<number | "add" | null>(null);
  useLayoutEffect(() => {
    if (pendingFocus.current === "add")
      addButton.current?.querySelector("button")?.focus();
    else if (typeof pendingFocus.current === "number")
      root.current
        ?.querySelector<HTMLInputElement>(
          `[data-row="${pendingFocus.current}"] input`
        )
        ?.focus();
    pendingFocus.current = null;
  }, [rows.length]);
  const currency = formData[currencyField] || "MYR";
  const change = (index: number, field: "year" | "fee", value: string) =>
    updateFormData(
      feesField,
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  const total = rows.reduce(
    (sum, row) =>
      sum + (Number.isFinite(Number(row.fee)) ? Number(row.fee) : 0),
    0
  );
  const add = () => {
    const nextYear =
      Math.max(0, ...rows.map((row) => Number(row.year) || 0)) + 1;
    pendingFocus.current = rows.length;
    updateFormData(feesField, [...rows, { year: nextYear, fee: "" }]);
  };
  return (
    <section
      ref={root}
      aria-labelledby={`${id}-title`}
      className="space-y-4 rounded-ub-lg border border-ub-border bg-ub-surface p-4 md:p-5"
      data-field={feesField}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3
            id={`${id}-title`}
            className="text-ub-heading-sm text-ub-text-primary"
          >
            Yearly Fees
          </h3>
          <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
            Enter tuition for each study year. Leave empty if fees are not
            available.
          </p>
        </div>
        <div ref={addButton}>
          <Button
            size="sm"
            variant="secondary"
            text="Add year"
            icon={<Plus className="h-4 w-4" aria-hidden="true" />}
            onClick={add}
          />
        </div>
      </div>
      {(alwaysShowCurrency || rows.length > 0) && (
        <div className="max-w-xs">
          <SelectField
            label="Tuition currency"
            field={currencyField}
            options={CURRENCY_OPTIONS}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            required={false}
          />
        </div>
      )}
      {!rows.length && (
        <p className="rounded-ub-md bg-ub-surface-subtle p-4 text-ub-body-sm text-ub-text-secondary">
          No yearly fees added. Choose Add year to enter tuition.
        </p>
      )}
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            data-row={index}
            role="group"
            aria-label={`Tuition entry ${index + 1}`}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-ub-md bg-ub-surface-subtle p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"
          >
            <div
              className="col-start-1 row-start-1"
              data-field={`${feesField}[${index}].year`}
            >
              <Input
                label="Study year"
                type="number"
                min={1}
                step={1}
                value={String(row.year)}
                onChange={(value) => change(index, "year", value)}
                error={errors[`${feesField}[${index}].year`]}
                required
                wrapperClassName=""
              />
            </div>
            <div
              className="col-span-2 col-start-1 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1"
              data-field={`${feesField}[${index}].fee`}
            >
              <Input
                label={`Tuition (${currency})`}
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                value={String(row.fee)}
                onChange={(value) => change(index, "fee", value)}
                error={errors[`${feesField}[${index}].fee`]}
                required
                wrapperClassName=""
              />
            </div>
            <div className="col-start-2 row-start-1 pt-6 sm:col-start-3">
              <IconButton
                title={`Remove year ${row.year || index + 1}`}
                variant="tertiary"
                icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                onClick={() => {
                  pendingFocus.current = "add";
                  updateFormData(
                    feesField,
                    rows.filter((_, i) => i !== index)
                  );
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <FieldError>{errors[feesField]}</FieldError>
      {rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ub-border pt-4 text-ub-body-sm">
          <span className="text-ub-text-secondary">
            Total entered tuition · {rows.length}{" "}
            {rows.length === 1 ? "year" : "years"}
          </span>
          <Amount
            value={total}
            currency={currency}
            className="text-ub-label-lg text-ub-text-primary"
          />
        </div>
      )}
    </section>
  );
}
