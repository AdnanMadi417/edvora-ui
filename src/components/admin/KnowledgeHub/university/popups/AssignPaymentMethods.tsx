"use client";

import React, { useState, useEffect } from "react";
import { XCircle, CreditCard } from "lucide-react";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/InputField";
import SearchableDropdown from "components/form/search/SearchableDropdown";
import { useToast } from "components/context/ToastContext";
import { useRouter } from "next/navigation";
import { useAllPaymentMethods } from "hooks/knowledge-hub/payment-methods/usePaymentMethods";
import { useUniversityPaymentMethods } from "hooks/knowledge-hub/universities/payment-methods/useUniversityPaymentMethods";
import { useAssignPaymentMethod } from "hooks/knowledge-hub/universities/payment-methods/useAssignUniversityPayment";

interface AssignPaymentUniversityProps {
  isOpen: boolean;
  onClose: () => void;
  universityId: string;
}

export default function AssignPaymentUniversity({
                                                  isOpen,
                                                  onClose,
                                                  universityId,
                                                }: AssignPaymentUniversityProps) {

  const { paymentMethods,loading } = useAllPaymentMethods();
  const { universityPaymentMethods } = useUniversityPaymentMethods(universityId);
  const { assignPaymentMethod, loading: assigning } = useAssignPaymentMethod();

  const { showToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    payment_method_id: "",
    instructions: "",
    currency: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        payment_method_id: "",
        instructions: "",
        currency: "",
        is_active: true,
      });
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAssign = async () => {
    if (!formData.payment_method_id) return;

    try {
      await assignPaymentMethod(universityId, {
        payment_method_id: formData.payment_method_id,
        instructions: formData.instructions?.trim() || undefined,
        currency: formData.currency?.trim() || undefined,
        is_active: formData.is_active,
      });

      showToast("Payment method assigned successfully.", "success");

      router.refresh();
      onClose();

    } catch (err: any) {
      const apiErrors = err?.response?.data?.detail;

      if (Array.isArray(apiErrors)) {
        const newErrors: Record<string, string> = {};

        apiErrors.forEach((e: any) => {
          if (e?.loc?.[1]) newErrors[e.loc[1]] = e.msg;
        });

        setErrors(newErrors);
      }

      showToast("Failed to assign payment method.", "error");
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
            description={`Assign a payment method to the selected university.`}
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
              options={paymentMethods.map((p) => ({
                value: String(p.id),
                label: p.name,
              }))}
              disabledOptions={universityPaymentMethods.map(p => String(p.payment_method_id))}
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

            <InputField
              label="Currency"
              field="currency"
              placeholder="e.g. USD"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

            <InputField
              label="Instructions"
              field="instructions"
              placeholder="Optional payment instructions..."
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
              disabled={!formData.payment_method_id || assigning}
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