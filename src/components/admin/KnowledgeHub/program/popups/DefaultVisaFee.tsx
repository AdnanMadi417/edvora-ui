"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Landmark } from "lucide-react";

import { useUpdateDefaultVisaFee } from "hooks/knowledge-hub/programs/useBatchUpdateVisaAmounts";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/InputField";

import { useToast } from "components/context/ToastContext";

interface DefaultVisaFeeProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DefaultVisaFee({
  isOpen,
  onClose,
  onSuccess,
}: DefaultVisaFeeProps) {
  const { updateDefaultVisaFee, loading } = useUpdateDefaultVisaFee();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ amount: "" });

  const isFormValid = formData.amount !== "" && Number(formData.amount) >= 0;

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
      setFormData({ amount: "" });
      setErrors({});
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    try {
      await updateDefaultVisaFee({ amount: Number(formData.amount) });

      showToast("Default visa fee updated successfully.", "success");

      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1500);
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || "Please try again.";
      showToast(`Update failed. ${backendMessage}`, "error");
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
            title="Default Visa Fee"
            description="Set the global default visa fee amount used during visa setup."
            icon={Landmark}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            iconBorder="border-indigo-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="px-6 py-6">
            <InputField
              label="Amount"
              field="amount"
              type="number"
              placeholder="e.g. 500"
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
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
              icon={<Landmark className="h-5 w-5" />}
              text={loading ? "Updating..." : "Set Visa Fee"}
              bgColor="bg-indigo-50"
              textColor="text-indigo-700"
              borderColor="border-indigo-600"
              hoverTextColor="hover:text-indigo-800"
              hoverBorderColor="hover:border-indigo-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
