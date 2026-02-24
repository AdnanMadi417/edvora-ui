"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, XCircle,ScrollText  } from "lucide-react";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "../../../../ui/buttons/Button";

import InputField from "../../../../form/InputField";

import { useCreateFieldOfStudy } from "hooks/knowledge-hub/useCreateFieldOfStudy";
import { useToast } from "components/context/ToastContext";

interface CreateFieldOfStudyProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateFieldOfStudy({
  isOpen,
  onClose,
}: CreateFieldOfStudyProps) {

  const {
    CreateFieldOfStudy,
    fieldLoading
  } = useCreateFieldOfStudy();

  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    is_active: true,
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
      await CreateFieldOfStudy({
        name: formData.name,
        is_active: formData.is_active,
      });

      showToast("Field Of Study created successfully.");

      onClose();
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

      showToast("Failed to create Field Of Study.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        is_active: true,
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
            title="Create New Field of Study"
            description="Add a new field of study into the knowledge hub."
            icon={ScrollText }
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
            <InputField
              label="Field Of Study Name"
              field="name"
              placeholder="e.g. Computer Science"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-600 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </button>

            <Button
              onClick={handleCreate}
              disabled={fieldLoading}
              icon={<PlusCircle className="h-5 w-5" />}
              text={fieldLoading ? "Creating..." : "Create Field of Study"}
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
