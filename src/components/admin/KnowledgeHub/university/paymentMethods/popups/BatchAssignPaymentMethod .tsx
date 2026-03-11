"use client";

import React, { useState, useEffect } from "react";
import { XCircle, CreditCard } from "lucide-react";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/InputField";
import SearchableDropdown from "components/form/search/SearchableDropdown";

import { useBatchAssignPaymentMethod } from "hooks/knowledge-hub/payment-methods/useBatchAssignPaymentMethod";

import { useToast } from "components/context/ToastContext";
import { useRouter } from 'next/navigation';

interface BatchUniversitiesProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUniversityIds: string[];
  paymentMethods: { id: string; name: string }[];
  onSuccess?: () => void;
}

export default function BatchUniversities({
                                            isOpen,
                                            onClose,
                                            selectedUniversityIds,
                                            paymentMethods,
                                            onSuccess,
                                          }: BatchUniversitiesProps) {

  const { batchAssignPaymentMethod, loading } =
    useBatchAssignPaymentMethod();

  const { showToast } = useToast();
  const router = useRouter();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    payment_method_id: "",
    university_ids: [] as string[],
    instructions: "",
    currency: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormValid =
    formData.payment_method_id !== "" &&
    formData.university_ids.length > 0 &&
    !loading;

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        payment_method_id: "",
        university_ids: selectedUniversityIds || [],
        instructions: "",
        currency: "",
        is_active: true,
      });

      setErrors({});
    }
  }, [isOpen, selectedUniversityIds]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleAssign = async () => {
    try {
      const payload = {
        payment_method_id: formData.payment_method_id,
        university_ids: selectedUniversityIds,
        instructions: formData.instructions?.trim() || undefined,
        currency: formData.currency?.trim() || undefined,
        is_active: formData.is_active,
      };

      await batchAssignPaymentMethod(payload);

      showToast("Payment method assigned successfully.", "success");

      onClose();
      onSuccess?.();

      setTimeout(() =>
        router.refresh()
        , 300);

    } catch (err: any) {

      const apiErrors = err?.response?.data?.detail;

      if (Array.isArray(apiErrors)) {
        const newErrors: Record<string, string> = {};

        apiErrors.forEach((e: any) => {
          if (e?.loc?.[1]) {
            newErrors[e.loc[1]] = e.msg;
          }
        });

        setErrors(newErrors);
      }

      showToast("Failed to assign payment method.", "error");
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">

          <ModalHeader
            title="Assign Payment Method"
            description="Assign a payment method to selected universities."
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
              disabled={!isFormValid || loading}
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