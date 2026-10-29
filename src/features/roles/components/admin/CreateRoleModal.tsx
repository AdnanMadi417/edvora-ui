"use client";

import React, { useState, useEffect } from "react";
import { XCircle, ShieldPlus } from "lucide-react";

import { useCreateRole } from "../../hooks";

import ModalHeader from "components/ub/feedback/ModalHeader";
import Button from "components/ub/core/Button";
import InputField from "components/ub/forms/InputField";
import { useToast } from "components/ub/feedback/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateRoleModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRoleModalProps) {
  const { createRole, loading } = useCreateRole();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ code: "", name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setFormData({ code: "", name: "" });
      setErrors({});
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.code.trim()) next.code = "Role code is required";
    if (!formData.name.trim()) next.name = "Role name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      await createRole({ code: formData.code.trim(), name: formData.name.trim() });
      showToast("Role created successfully.", "success");
      onClose();
      onSuccess?.();
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to create role. ${backendMessage}`, "error");
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
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Create New Role"
            description="Add a new custom role that can be granted permissions."
            icon={ShieldPlus}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-2 overflow-y-auto px-6 py-6">
            <InputField
              label="Role Code"
              field="code"
              placeholder="e.g. finance_reviewer"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              helperText="A unique, unchangeable identifier for this role."
            />
            <InputField
              label="Role Name"
              field="name"
              placeholder="e.g. Finance Reviewer"
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
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              onClick={handleCreate}
              disabled={loading || !formData.code.trim() || !formData.name.trim()}
              icon={<ShieldPlus className="h-5 w-5" />}
              text={loading ? "Creating..." : "Create Role"}
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
