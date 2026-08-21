"use client";

import React, { useState, useEffect } from "react";
import { XCircle, CreditCard } from "lucide-react";

import { useAllPaymentMethods } from "features/knowledge-hub/payment-methods/hooks";
import { useUniversityPaymentMethods, useAssignUniversityPaymentMethod } from "features/universities/hooks";

import { useToast } from "components/context/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import { CURRENCY } from 'constants/lists';

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import SelectField from "components/form/fields/SelectField";
import RichTextEditor from "components/form/fields/RichTextEditor";
import SearchableDropdown from "components/form/search/SearchableDropdown";

interface AssignPaymentUniversityProps {
  isOpen: boolean;
  onClose: () => void;
  universityId: string;
  onSuccess?: () => void;
}

export default function AssignPaymentUniversity({
  isOpen,
  onClose,
  universityId,
  onSuccess,
}: AssignPaymentUniversityProps) {

  const { paymentMethods } = useAllPaymentMethods();
  const { universityPaymentMethods } = useUniversityPaymentMethods(universityId);
  const { assignPaymentMethod, loading: assigning } = useAssignUniversityPaymentMethod();

  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    payment_method_id: "",
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
      setFormData({ payment_method_id: "", instructions: "", currency: "", is_active: true });
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const isFormValid = React.useMemo(
    () => formData.payment_method_id.trim() !== "" && !assigning,
    [formData.payment_method_id, assigning]
  );

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleAssign = async () => {
    if (!formData.payment_method_id.trim()) {
      const e = { payment_method_id: "Payment method is required" };
      setErrors(e);
      scrollToFirstError(e);
      return;
    }

    try {
      await assignPaymentMethod(universityId, {
        payment_method_id: formData.payment_method_id,
        instructions: formData.instructions?.trim() || undefined,
        currency: formData.currency?.trim() || undefined,
        is_active: formData.is_active,
      });

      showToast("Payment method assigned successfully.", "success");
      onClose();
      onSuccess?.();

    } catch (err: unknown) {
      handleApiError(err, "Failed to assign payment method.");
    }
  };

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

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
            title="Assign Payment Method"
            description="Assign a payment method to the selected university."
            icon={CreditCard}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
            <SearchableDropdown
              label="Payment Method"
              field="payment_method_id"
              required
              options={paymentMethods.map((p) => ({ value: String(p.id), label: p.name }))}
              disabledOptions={universityPaymentMethods.map((p) => String(p.payment_method_id))}
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
              disabled={!isFormValid}
              icon={<CreditCard className="h-5 w-5" />}
              text={assigning ? "Assigning..." : "Assign Payment Method"}
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
