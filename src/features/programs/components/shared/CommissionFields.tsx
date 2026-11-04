"use client";

import InputField from "components/ub/forms/text/InputField";
import SelectField from "components/ub/forms/selection/SelectField";
import TextareaField from "components/ub/forms/text/TextareaField";
import { CURRENCY, MONTHS } from "constants/lists";

interface Props {
  formData: Record<string, any>;
  errors: Record<string, string>;
  updateFormData: (field: string, value: any) => void;
  validateField?: (field: string) => void;
  showTiming?: boolean;
}

export default function CommissionFields({
  formData,
  errors,
  updateFormData,
  validateField,
  showTiming = true,
}: Props) {
  return (
    <section
      aria-label="Commission"
      className="space-y-5 rounded-ub-lg border border-ub-border bg-ub-surface p-4 md:p-5"
    >
      <div>
        <h3 className="text-ub-heading-sm text-ub-text-primary">Commission</h3>
        <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
          Set the advisor commission separately from student tuition and
          charges.
        </p>
      </div>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <InputField
          label="Commission amount"
          field="commission_amount"
          type="number"
          required={false}
          placeholder="0.00"
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          onBlur={() => validateField?.("commission_amount")}
          hint="Maximum 29,999. Leave at zero if not set."
        />
        <SelectField
          label="Commission currency"
          field="commission_currency"
          required={false}
          options={CURRENCY.map((item) => ({
            value: item.value,
            label: item.label,
          }))}
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />
      </div>
      {showTiming && (
        <div className="border-t border-ub-border pt-5">
          <h4 className="text-ub-label-md text-ub-text-primary">
            Expected payment window
          </h4>
          <p className="mb-4 mt-1 text-ub-body-sm text-ub-text-secondary">
            Optional estimate of when commission is expected.
          </p>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <SelectField
              label="Expected from"
              field="expected_commission_from"
              required={false}
              options={MONTHS.map((month) => ({
                value: month.value,
                label: month.label,
              }))}
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
            <SelectField
              label="Expected to"
              field="expected_commission_to"
              required={false}
              options={MONTHS.map((month) => ({
                value: month.value,
                label: month.label,
              }))}
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
          </div>
        </div>
      )}
      <TextareaField
        label="Commission notes"
        field="commission_notes"
        required={false}
        placeholder="Add payment terms or important conditions"
        formData={formData}
        errors={errors}
        updateFormData={updateFormData}
        onBlur={() => validateField?.("commission_notes")}
      />
    </section>
  );
}
