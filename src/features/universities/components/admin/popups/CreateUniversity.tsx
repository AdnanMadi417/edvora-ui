"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, PlusCircle, XCircle } from 'lucide-react';

const FIELD_LABELS: Record<string, string> = {
  name: "University Name",
  description: "Description",
  intake_months: "Intake Dates",
  country: "Country",
  university_type_id: "University Type",
  branches: "Branches",
};

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import MultipleDatePickerModal from "components/form/MultipleDatePickerModal";
import InputField from "components/form/InputField";
import TextareaField from "components/form/TextareaField";

import { useCreateUniversity } from "features/universities/hooks";
import { useToast } from "components/context/ToastContext";

interface CreateUniversityProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateUniversity({
  isOpen,
  onClose,
  onSuccess,
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
    formData.intake_months.some((m) => m.trim() !== "");

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
      onSuccess?.();
    } catch (err: any) {
      const details = err?.response?.data?.details;
      const code = err?.response?.data?.code;
      const backendMessage = err?.response?.data?.message;

      if (Array.isArray(details)) {
        const newErrors: Record<string, string> = {};
        details.forEach((e: any) => {
          const field = e?.loc?.[1];
          if (field) newErrors[field] = e.msg;
        });
        setErrors(newErrors);
      }

      let message = "Please try again.";
      if (code === "university_name_exists") {
        message = "A university with this name already exists.";
      } else if (Array.isArray(details) && details.length > 0) {
        const first = details[0];
        const field = first?.loc?.[1];
        const label = field ? (FIELD_LABELS[field] ?? field) : null;
        message = label ? `${label}: ${first.msg}` : first.msg;
      } else if (backendMessage) {
        message = backendMessage;
      }

      showToast(`Failed to create university. ${message}`, "error");
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

            <TextareaField
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
