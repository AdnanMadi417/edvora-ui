import React from "react";
import ArrayObjectField from "components/form/fields/ArrayObjectField";
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
      label="One Time Fees"
      subLabel="Fees"
      field={field}
      formData={formData}
      errors={errors}
      updateFormData={updateFormData}
      columns={3}
      fields={[
        { key: "description", label: "Description", type: "text", placeholder: "One Time Fees" },
        { key: "fee", label: "Fee", type: "number", placeholder: "Fee" },
        { key: "currency", label: "Currency", type: "select", options: CURRENCY_OPTIONS },
      ]}
      getDefaultRow={() => ({ description: "", fee: "", currency: "MYR" })}
    />
  );
}
