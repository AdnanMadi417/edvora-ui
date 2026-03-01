"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, XCircle, BadgePercent } from 'lucide-react';

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "../../../../ui/buttons/Button";
import InputField from "../../../../form/InputField";
import ToggleInput from '../../../../form/toggle/ToggleInput';

import { useCreateCommissionType } from "hooks/knowledge-hub/commission/useCreateCommissionType";
import { useToast } from "components/context/ToastContext";

interface CreateCommissionTypeProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCommissionType({
                                               isOpen,
                                               onClose,
                                             }: CreateCommissionTypeProps) {

  const { createCommissionType, loading } = useCreateCommissionType();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_default:true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
      const newCommissionType = await createCommissionType(formData);

      showToast("Commission type created successfully.", "success");

      onClose();

      return newCommissionType;

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

      showToast("Failed to create commission type.", "error");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
        is_default: false,
      });

      setErrors({});
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
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">

          <ModalHeader
            title="Create Commission Type"
            description="Define a new commission structure for the Knowledge Hub."
            icon={BadgePercent}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">

            <InputField
              label="Commission Type Name"
              field="name"
              placeholder="e.g. Percentage Commission"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

            <InputField
              label="Description"
              field="description"
              placeholder="Describe how this commission type works..."
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

            {/*<ToggleInput*/}
            {/*  label="Set as Default"*/}
            {/*  field="is_default"*/}
            {/*  formData={formData}*/}
            {/*  errors={errors}*/}
            {/*  updateFormData={updateFormData}*/}
            {/*/>*/}

          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">

            <Button
              onClick={onClose}
              disabled={loading}
              icon={<XCircle  className="h-5 w-5" />}
              text={loading ? "Cancelling..." : "Cancel"}
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              onClick={handleCreate}
              disabled={loading}
              icon={<BadgePercent className="h-5 w-5" />}
              text={loading ? "Creating..." : "Create Commission Type"}
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