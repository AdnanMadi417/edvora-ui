"use client";

import React, { useState, useEffect } from "react";
import { Plus, XCircle, Truck } from 'lucide-react';
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/InputField";
import { useCreateLogisticService } from "features/logistical-service/hooks";
import { useToast } from "components/context/ToastContext";

interface CreateLogisticalPartnersPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateLogisticalPartnersPopup({
  isOpen,
  onClose,
  onCreated,
}: CreateLogisticalPartnersPopupProps) {
  const { showToast } = useToast();
  const { createLogisticService, loadingCreateLogisticService } = useCreateLogisticService();

  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setFormData({ name: "" });
      setErrors({});
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const validateName = (value: string): string => {
    if (!value.trim()) return "Service name is required";
    if (value.trim().length < 5) return "Name must be at least 5 characters";
    if (value.trim().length > 255) return "Name must not exceed 255 characters";
    return "";
  };

  const updateFormData = (_: string, value: string) => {
    setFormData({ name: value });
    if (errors.name) setErrors({});
  };

  const handleSubmit = async () => {
    const error = validateName(formData.name);
    if (error) {
      setErrors({ name: error });
      return;
    }

    try {
      await createLogisticService({ name: formData.name.trim() });
      showToast("Logistic service created successfully", "success");
      onCreated();
      onClose();
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Failed to create service. ${backendMessage}`, "error");
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-md transform transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="New Logistic Service"
            description="Add a new service type to the system."
            icon={Truck}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="px-7 py-6">
            <InputField
              label="Service Name"
              field="name"
              placeholder="e.g. Airport Transfer"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => setErrors({ name: validateName(formData.name) })}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              disabled={loadingCreateLogisticService}
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
              disabled={loadingCreateLogisticService || formData.name.trim().length < 5}
              icon={<Plus className="h-5 w-5" />}
              text={loadingCreateLogisticService ? "Creating..." : "Create Service"}
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
