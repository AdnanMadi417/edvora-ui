"use client";

import React, { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";

import { useInviteStaffUser } from "../../hooks";

import FormModal from "components/ub/feedback/dialogs/FormModal";
import InputField from "components/ub/forms/text/InputField";
import SelectField from "components/ub/forms/selection/SelectField";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface InviteStaffUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "reviewer", label: "Reviewer" },
  { value: "data_entry", label: "Data entry" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteStaffUserModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteStaffUserModalProps) {
  const { inviteStaffUser, loading } = useInviteStaffUser();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ name: "", email: "", role: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", email: "", role: "" });
      setErrors({});
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!EMAIL_REGEX.test(formData.email.trim()))
      next.email = "Enter a valid email address";
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

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title="Invite staff user"
      description="Send an email invitation with a one-time verification code."
      icon={UserPlus}
      size="md"
      submitLabel={loading ? "Sending..." : "Send Invitation"}
      submitting={loading}
      onSubmit={(event) => {
        event.preventDefault();
        if (!loading) return handleInvite();
      }}
    >
      <div className="space-y-4">
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
    </FormModal>
  );
}
