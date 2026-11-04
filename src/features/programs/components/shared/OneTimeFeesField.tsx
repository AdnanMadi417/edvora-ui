import React from "react";
import ArrayObjectField from "components/ub/forms/layout/ArrayObjectField";
import { CURRENCY_OPTIONS } from "features/programs/types";

interface OneTimeFeesFieldProps {
  formData: Record<string, any>;
  errors: Record<string, string>;
  updateFormData: (field: string, value: any) => void;
  field?: string;
}

export default function OneTimeFeesField({
  formData,
  errors,
  updateFormData,
  field = "one_time_fees",
}: OneTimeFeesFieldProps) {
  return (
    <ArrayObjectField
      label="One-time fees"
      description="Add application, registration, or other charges paid once. Each charge can have its own currency."
      allowRemoveAll
      subLabel="charge"
      field={field}
      formData={formData}
      errors={errors}
      updateFormData={updateFormData}
      columns={3}
      fields={[
        {
          key: "description",
          label: "Description",
          type: "text",
          placeholder: "e.g. Registration fee",
        },
        { key: "fee", label: "Amount", type: "number", placeholder: "Fee" },
        {
          key: "currency",
          label: "Currency",
          type: "select",
          options: CURRENCY_OPTIONS,
        },
      ]}
      getDefaultRow={() => ({ description: "", fee: "", currency: "MYR" })}
    />
  );
}
