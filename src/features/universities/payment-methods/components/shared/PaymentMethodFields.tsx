import InputField from "components/ub/forms/text/InputField";
import RichTextEditor from "components/ub/forms/text/RichTextEditor";
import type { PaymentMethodPayload } from "../../types";
export default function PaymentMethodFields({
  formData,
  errors,
  apiError,
  updateFormData,
}: {
  formData: PaymentMethodPayload;
  errors: Record<string, string>;
  apiError: string;
  updateFormData: (field: string, value: string) => void;
}) {
  return (
    <div className="min-w-0 space-y-6">
      {apiError && (
        <p
          role="alert"
          className="rounded-ub-md border border-ub-tone-danger-border bg-ub-tone-danger-bg p-4 text-ub-tone-danger-text"
        >
          {apiError}
        </p>
      )}
      <InputField
        label="Payment method name"
        field="name"
        required
        placeholder="e.g. Bank transfer"
        formData={formData}
        errors={errors}
        updateFormData={updateFormData}
      />
      <RichTextEditor
        label="Description (optional)"
        field="description"
        placeholder="Explain how this payment method works..."
        formData={formData}
        errors={errors}
        updateFormData={updateFormData}
      />
    </div>
  );
}
