"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, XCircle } from 'lucide-react';

import { useCreatePayment } from "features/knowledge-hub/payment-methods/hooks";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/fields/InputField";
import RichTextEditor from "components/form/fields/RichTextEditor";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface CreatePaymentMethodProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreatePayment({
                                           isOpen,
                                           onClose,
                                           onSuccess,
                                         }: CreatePaymentMethodProps) {
  const { createPayment, paymentLoading } = useCreatePayment();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validateName = (value: string): string => {
    if (!value.trim()) return "Name is required";
    if (value.trim().length < 3) return "Name must be at least 3 characters";
    if (value.trim().length > 100) return "Name must not exceed 100 characters";
    return "";
  };

  const validateDescription = (value: string): string => {
    const text = value.replace(/<[^>]*>/g, "").trim();
    if (!text) return "";
    if (text.length < 10) return "Description must be at least 10 characters";
    return "";
  };

  const isFormValid = !validateName(formData.name) && !validateDescription(formData.description);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setFormData({ name: "", description: "" });
      setErrors({});
      setApiError(null);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    const nameErr = validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;
    const descErr = validateDescription(formData.description);
    if (descErr) newErrors.description = descErr;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setApiError(null);

      await createPayment({ name: formData.name.trim(), description: formData.description.trim() });

      showToast("Payment Method created successfully.", "success");

      onClose();
      setTimeout(() => onSuccess?.(), 1500);
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");

      setApiError(backendMessage);

      showToast(`Failed to create Payment Method. ${backendMessage}`, "error");
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
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
            title="Create Payment Method"
            description="Add a new payment method to the Knowledge Hub system."
            icon={CreditCard}
            iconBg="bg-blue-50"
            iconColor="text-blue-700"
            iconBorder="border-blue-200"
            titleColor="text-blue-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
            <InputField
              label="Payment Method Name"
              field="name"
              placeholder="e.g. Credit Card, PayPal, GrabPay"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => {
                const err = validateName(formData.name);
                if (err) setErrors((prev) => ({ ...prev, name: err }));
              }}
            />

            <RichTextEditor
              label="Description"
              field="description"
              placeholder="Brief description of the payment method (optional)"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

            {apiError && (
              <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
                <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Failed to create payment method
                  </p>
                  <p className="text-sm text-red-700">{apiError}</p>
                </div>
              </div>
            )}

          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Button
              onClick={onClose}
              disabled={paymentLoading}
              icon={<XCircle  className="h-5 w-5" />}
              text={paymentLoading ? "Cancelling..." : "Cancel"}
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              onClick={handleCreate}
              disabled={paymentLoading || !isFormValid}
              icon={<CreditCard  className="h-5 w-5" />}
              text={paymentLoading ? "Creating..." : "Create Payment Method"}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
