"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, Building2, XCircle } from 'lucide-react';

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";

import InputField from "components/form/fields/InputField";

import { useCreateUniversityType } from "features/universities/hooks";
import { useToast } from "components/context/ToastContext";

interface CreateUniversityProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateUniversityType({
  isOpen,
  onClose,
  onSuccess,
}: CreateUniversityProps) {

  const { createUniversityType, loading } = useCreateUniversityType();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateName = (value: string): string => {
    if (!value.trim()) return "Name is required";
    if (value.trim().length < 3) return "Name must be at least 3 characters";
    if (value.trim().length > 100) return "Name must not exceed 100 characters";
    return "";
  };

  const validateDescription = (value: string): string => {
    if (!value.trim()) return "Description is required";
    if (value.trim().length < 10) return "Description must be at least 10 characters";
    return "";
  };

  const isFormValid =
    !validateName(formData.name) &&
    !validateDescription(formData.description);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setFormData({ name: "", description: "" });
      setErrors({});
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
      await createUniversityType({ name: formData.name.trim(), description: formData.description.trim() });

      showToast("University type created successfully.", "success");

      onClose();
      onSuccess?.();
    } catch (err: any) {
      const apiErrors = err?.response?.data?.detail;

      if (Array.isArray(apiErrors)) {
        const newErrors: Record<string, string> = {};
        apiErrors.forEach((e: any) => {
          if (e?.loc?.[1]) newErrors[e.loc[1]] = e.msg;
        });
        setErrors(newErrors);
      }
      showToast("Failed to create university.", "error");
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
            icon={Building2}
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
              onBlur={() => {
                const err = validateName(formData.name);
                if (err) setErrors((prev) => ({ ...prev, name: err }));
              }}
            />

            <InputField
              label="Description"
              field="description"
              placeholder="Brief university description..."
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => {
                const err = validateDescription(formData.description);
                if (err) setErrors((prev) => ({ ...prev, description: err }));
              }}
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
              icon={<GraduationCap  className="h-5 w-5" />}
              disabled={loading || !isFormValid}
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
