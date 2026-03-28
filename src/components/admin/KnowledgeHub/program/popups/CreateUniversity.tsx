"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, PlusCircle, XCircle } from 'lucide-react';

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "../../../../ui/buttons/Button";

import MultipleDatePickerModal from "../../../../form/MultipleDatePickerModal";

import InputField from "../../../../form/InputField";

import { useCreateUniversity } from "../../../../../hooks/knowledge-hub/universities/useCreateUniversity";
import { useToast } from "components/context/ToastContext";
import { router } from 'next/client';

interface CreateUniversityProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateUniversity({
  isOpen,
  onClose,
}: CreateUniversityProps) {
  const { createUniversity, loading } = useCreateUniversity();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    intake_months: [] as string[],
    country: "Malaysia",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormValid =
    formData.name.trim() &&
    formData.description.trim() &&
    formData.intake_months.length > 0;

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
      await createUniversity(formData);

      showToast("University created successfully.", "success");
      onClose();

      setTimeout(() => router.push("admin/knowledge-hub/programs/create"), 1500);

    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Failed to create university. ${backendMessage}`, "error");
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
            title="Create University"
            description="Add a new university to the knowledge hub system."
            icon={PlusCircle}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
            <InputField
              label="University Name"
              field="name"
              placeholder="e.g. Universiti Malaya"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

            <InputField
              label="Description"
              field="description"
              placeholder="Brief university description..."
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

            <MultipleDatePickerModal
              label="Intake Dates"
              field="intake_months"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
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
              disabled={loading || !isFormValid}
              icon={<GraduationCap  className="h-5 w-5" />}
              text={loading ? "Creating..." : "Create University"}
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
