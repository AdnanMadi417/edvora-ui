"use client";

import React, { useState, useEffect } from "react";
import { XCircle, UserPlus } from "lucide-react";

import { useInviteStaffUser } from "../../hooks";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/fields/InputField";
import SelectField from "components/form/fields/SelectField";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface InviteStaffUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "reviewer", label: "Reviewer" },
  { value: "data_entry", label: "Data Entry" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteStaffUserModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteStaffUserModalProps) {
  const { inviteStaffUser, loading } = useInviteStaffUser();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setFormData({ name: "", email: "", role: "" });
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
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!EMAIL_REGEX.test(formData.email.trim())) next.email = "Enter a valid email address";
    if (!formData.role) next.role = "Role is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleInvite = async () => {
    if (!validate()) return;

    try {
      const res = await inviteStaffUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role as "admin" | "reviewer" | "data_entry",
      });
      showToast(res?.message || "Invitation sent successfully.", "success");
      onClose();
      onSuccess?.();
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to send invitation. ${backendMessage}`, "error");
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
            title="Invite Staff User"
            description="Send an email invitation with a one-time verification code."
            icon={UserPlus}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-2 overflow-y-auto px-6 py-6">
            <InputField
              label="Name"
              field="name"
              placeholder="e.g. Jordan Lee"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              disabled={loading}
            />
            <InputField
              label="Email"
              field="email"
              type="email"
              placeholder="e.g. jordan@example.com"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              disabled={loading}
            />
            <SelectField
              label="Role"
              field="role"
              options={ROLE_OPTIONS}
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              disabled={loading}
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
              onClick={handleInvite}
              disabled={loading || !formData.name.trim() || !formData.email.trim() || !formData.role}
              icon={<UserPlus className="h-5 w-5" />}
              text={loading ? "Sending..." : "Send Invitation"}
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
