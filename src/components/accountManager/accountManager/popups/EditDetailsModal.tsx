"use client";

import React, { useState, useEffect } from "react";
import { Pencil, User, XCircle } from "lucide-react";
import ModalHeader from "../../../ui/modal/ModalHeader";
import { useToast } from "../../../context/ToastContext";
import { useEditAccountManager } from "../../../../hooks/account-managers/useEditAccountManager";
import InputField from "../../../form/InputField";
import UpdatedBtn from "../../../ui/buttons/Button";
import ToggleInput from '../../../form/toggle/ToggleInput';

interface EditAccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  manager: any;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function EditAccountManagerModal({
  isOpen,
  onClose,
  manager,
}: EditAccountManagerModalProps) {
  const { showToast } = useToast();
  const { editAccountManager, loading } = useEditAccountManager(manager?.id);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    is_active: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (manager) {
      setFormData({
        name: manager.name || "",
        email: manager.email || "",
        password: "",
        confirmPassword: "",
        is_active: manager.is_active ?? false,
      });
    }
  }, [manager]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      name: formData.name,
      email: formData.email,
      is_active: formData.is_active,
      ...(formData.password && { password: formData.password }),
    };

    try {
      await editAccountManager(payload);
      showToast("Account Manager updated successfully");
      onClose();

      setTimeout(() => {
        location.reload();
      }, 3000);
    } catch {
      showToast("Failed to update Account Manager");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <ModalHeader
          title="Edit Account Manager"
          description="Update account manager information"
          icon={User}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          iconBorder="border-indigo-200"
          titleColor="text-gray-900"
          onClose={onClose}
        />

        <div className="max-h-[60vh] space-y-6 overflow-y-auto px-4 py-5">
          <InputField
            label="Name"
            field="name"
            placeholder="e.g. FastTrack Logistics"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateField}
          />

          <InputField
            label="Email"
            field="email"
            placeholder="e.g. manager@example.com"
            type="email"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateField}
          />

          <ToggleInput
            label="Active Status"
            field="is_active"
            formData={formData}
            errors={errors}
            updateFormData={updateField}
          />

        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-md border border-gray-600 px-4  py-2 text-sm font-medium text-gray-600 shadow-md transition hover:scale-105 hover:border-gray-700  hover:text-gray-700 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </button>

          <UpdatedBtn
            icon={<Pencil className="h-5 w-5" />}
            text={loading ? "Saving..." : "Save Changes"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
            onClick={handleSubmit}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
