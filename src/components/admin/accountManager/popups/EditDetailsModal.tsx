"use client";

import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import ModalHeader from "../../../ui/modal/ModalHeader";
import { useToast } from "../../../context/ToastContext";
import { useEditAccountManager } from "../../../../hooks/account-managers/useEditAccountManager";
import InputField from '../../../form/InputField';

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
      showToast("success: Account Manager updated successfully");
      onClose();
    } catch {
      showToast("error: Failed to update Account Manager");
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

          <InputField
            label="New Password (optional)"
            field="password"
            placeholder="Enter new password"
            type="password"
            formData={formData}
            errors={errors}
            updateFormData={updateField}
          />

          <InputField
            label="Confirm Password"
            field="confirmPassword"
            placeholder="Re-enter password"
            type="password"
            formData={formData}
            errors={errors}
            updateFormData={updateField}
          />

          <div className="flex items-center justify-between rounded-md border px-4 py-3">
    <span className="text-sm font-medium text-slate-800">
      Active Status
    </span>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => updateField("is_active", e.target.checked)}
            />
          </div>

        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
