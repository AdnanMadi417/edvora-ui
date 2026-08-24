"use client";

import React, { useState, useEffect } from "react";
import { XCircle, CreditCard } from "lucide-react";
import { useAllPaymentMethods, useBatchAssignPaymentMethod } from "features/knowledge-hub/payment-methods/hooks";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import SelectField from "components/form/fields/SelectField";
import RichTextEditor from "components/form/fields/RichTextEditor";
import MultiSelect from "components/form/search/MultiSelect";
import { useToast } from "components/context/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import { CURRENCY } from 'constants/lists';

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
    onUnmappedError: (message) => showToast(`Failed to assign payment method. ${message}`, "error"),
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
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleAssign = async () => {
    if (!formData.payment_method_ids.length) {
      const e = { payment_method_ids: "At least one payment method is required" };
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg md:max-w-xl transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Batch Assign Payment Method"
            description={`Assign a payment method to ${selectedUniversityIds.length} selected universities.`}
            icon={CreditCard}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
            <MultiSelect
              label="Payment Method"
              field="payment_method_ids"
              required
              options={paymentMethods.map((p) => ({ value: String(p.id), label: p.name }))}
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
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
            />
            <Button
              onClick={handleAssign}
              disabled={!formData.payment_method_ids.length || loading}
              icon={<CreditCard className="h-5 w-5" />}
              text={loading ? "Assigning..." : "Assign Payment Method"}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
