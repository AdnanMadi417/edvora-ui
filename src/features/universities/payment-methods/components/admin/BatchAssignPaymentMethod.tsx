"use client";

import React, { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import {
  useAllPaymentMethods,
  useBatchAssignPaymentMethod,
} from "features/universities/payment-methods/hooks";

import FormModal from "components/ub/feedback/dialogs/FormModal";
import SelectField from "components/ub/forms/selection/SelectField";
import RichTextEditor from "components/ub/forms/text/RichTextEditor";
import MultiSelect from "components/ub/forms/selection/MultiSelect";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import { CURRENCY } from "constants/lists";

interface BatchUniversitiesProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUniversityIds: string[];
  onSuccess?: () => void;
}

interface FormData {
  payment_method_ids: string[];
  university_ids: string[];
  instructions: string;
  currency: string;
  is_active: boolean;
}

export default function BatchUniversities({
  isOpen,
  onClose,
  selectedUniversityIds,
  onSuccess,
}: BatchUniversitiesProps) {
  const { paymentMethods } = useAllPaymentMethods();
  const { batchAssignPaymentMethod, loading } = useBatchAssignPaymentMethod();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    payment_method_ids: [],
    university_ids: [],
    instructions: "",
    currency: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApiError = useApiFormErrors({
    setErrors: (patch) => {
      setErrors((prev) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) =>
      showToast(`Failed to assign payment method. ${message}`, "error"),
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        payment_method_ids: [],
        university_ids: selectedUniversityIds || [],
        instructions: "",
        currency: "",
        is_active: true,
      });
      setErrors({});
    }
  }, [isOpen, selectedUniversityIds]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
  };

  const handleAssign = async () => {
    if (!formData.payment_method_ids.length) {
      const e = {
        payment_method_ids: "At least one payment method is required",
      };
      setErrors(e);
      scrollToFirstError(e);
      return;
    }

    if (!formData.university_ids.length) return;

    try {
      await batchAssignPaymentMethod({
        payment_method_ids: formData.payment_method_ids,
        university_ids: formData.university_ids,
        instructions: formData.instructions?.trim() || undefined,
        currency: formData.currency?.trim() || undefined,
        is_active: formData.is_active,
      });

      showToast("Payment method assigned successfully.", "success");
      onClose();
      onSuccess?.();
    } catch (error: unknown) {
      handleApiError(error, "Please try again.");
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title="Assign payment methods"
      description={`Assign payment options to ${selectedUniversityIds.length} selected universities.`}
      icon={CreditCard}
      onSubmit={handleAssign}
      submitLabel="Assign payment methods"
      submitting={loading}
      submitDisabled={
        !formData.payment_method_ids.length || !formData.university_ids.length
      }
    >
      <fieldset disabled={loading} className="min-w-0 space-y-6">
        <MultiSelect
          label="Payment method"
          field="payment_method_ids"
          required
          options={paymentMethods.map((p) => ({
            value: String(p.id),
            label: p.name,
          }))}
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />

        <SelectField
          label="Currency"
          field="currency"
          required={false}
          options={CURRENCY.map((c) => ({ value: c.value, label: c.label }))}
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />

        <RichTextEditor
          label="Instructions"
          field="instructions"
          placeholder="Optional payment instructions..."
          required={false}
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />
      </fieldset>
    </FormModal>
  );
}
