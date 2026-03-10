"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, XCircle } from 'lucide-react';

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";

import InputField from "components/form/InputField";

import { useCreatePayment } from "hooks/knowledge-hub/payment-methods/useCreatePayment";
import { useToast } from "components/context/ToastContext";

interface CreatePaymentMethodProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePayment({
                                           isOpen,
                                           onClose,
                                         }: CreatePaymentMethodProps) {
  const { createPayment, paymentLoading } = useCreatePayment();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormValid =
    formData.name.trim() &&
    formData.description.trim()

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
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
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleCreate = async () => {
    try {
      await createPayment(formData);

      showToast("Payment Method created successfully.");

      onClose();
      setTimeout(() => location.reload(), 1500);
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
      showToast("Failed to create Payment Method.");
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
            />

            <InputField
              label="Description"
              field="description"
              placeholder="Brief description of the payment method (optional)"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
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
