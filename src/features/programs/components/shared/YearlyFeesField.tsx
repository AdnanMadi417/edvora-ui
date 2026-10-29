import React from "react";
import SelectInput from "components/ub/forms/SelectInput";
import ArrayObjectField from "components/ub/forms/ArrayObjectField";
import { CURRENCY_OPTIONS } from "features/programs/types";

interface YearlyFeesFieldProps {
  formData: Record<string, any>;
  errors: Record<string, string>;
  updateFormData: (field: string, value: any) => void;
  currencyField?: string;
  feesField?: string;
  /** Show the currency picker even when there are no fee rows yet. Set to
   * false when this field applies to multiple programs at once (batch
   * update) — the picker should only appear once fees are actually being
   * set, so it can't be sent for programs the admin didn't mean to touch. */
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
  const hasFees = (formData[feesField] || []).length > 0;

  return (
    <ArrayObjectField
      label="Yearly Fees"
      subLabel="Year"
      field={feesField}
      formData={formData}
      errors={errors}
      updateFormData={updateFormData}
      fields={[
        { key: "year", label: "Year", type: "text", placeholder: "Year" },
        { key: "fee", label: "Fee", type: "number", placeholder: "Fee" },
      ]}
      getDefaultRow={(currentArray: Array<{ year?: number | string }>) => {
        const maxYear = currentArray.reduce((max, y) => Math.max(max, Number(y.year) || 0), 0);
        return { year: maxYear + 1, fee: "" };
      }}
      insertPosition="end"
      headerExtra={
        (alwaysShowCurrency || hasFees) && (
          <div className="w-32">
            <SelectInput
              field={currencyField}
              options={CURRENCY_OPTIONS}
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
          </div>
        )
      }
    />
  );
}
