"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Edit3 } from "lucide-react";

import { useUpdateFieldOfStudy } from "hooks/knowledge-hub/field-of-study/useUpdateFieldOfStudy";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/InputField";
import ToggleInput from "components/form/toggle/ToggleInput";

import { useToast } from "components/context/ToastContext";

interface UpdateFieldProps {
  isOpen: boolean;
  onClose: () => void;
  selectedField: {
    id: string;
    name: string;
    is_active?: boolean;
  } | null;
  onSuccess?: () => void;
}

export default function UpdateFieldOfStudy({
                                             isOpen,
                                             onClose,
                                             selectedField,
                                             onSuccess,
                                           }: UpdateFieldProps) {

  const { updateFieldOfStudy, fieldLoading } =
    useUpdateFieldOfStudy(selectedField?.id);
  const [initialFormData, setInitialFormData] = useState<any>(null);

  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) setIsVisible(true);
    else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        is_active: true,
      });
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedField || !isOpen) return;

    const initial = {
      name: selectedField.name || "",
      is_active: selectedField.is_active ?? true,
    };

    setFormData(initial);
    setInitialFormData(initial);
  }, [selectedField, isOpen]);

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

  const isFormChanged = React.useMemo(() => {
    if (!initialFormData) return false;

    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  const handleUpdate = async () => {
    try {
      const payload = {
        name: formData.name.trim(),
        is_active: formData.is_active,
      };

      await updateFieldOfStudy(payload);

      showToast("Field of study updated successfully.", "success");

      onClose();
      onSuccess?.();

    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.detail?.[0]?.msg || "Please try again.";

      showToast(`Update failed. ${backendMessage}`, "error");
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
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">

          <ModalHeader
            title="Update Field of Study"
            description="Edit the details of this field of study."
            icon={Edit3}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">

            <InputField
              label="Name"
              field="name"
              type="text"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

            <ToggleInput
              label="Status"
              field="is_active"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

          </div>

          <div className="flex justify-end gap-3 border-t px-6 py-4">

            <Button
              onClick={onClose}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
            />

            <Button
              onClick={handleUpdate}
              disabled={!isFormChanged || fieldLoading}
              icon={<Edit3 className="h-5 w-5" />}
              text={fieldLoading ? "Updating..." : "Update Field Details"}
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