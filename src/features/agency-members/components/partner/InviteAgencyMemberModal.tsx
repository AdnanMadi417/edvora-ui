"use client";

import React, { useState, useEffect } from "react";
import { XCircle, UserPlus } from "lucide-react";

import { useInviteAgencyMember } from "../../hooks";

import ModalHeader from "components/ub/feedback/ModalHeader";
import Button from "components/ub/core/Button";
import InputField from "components/ub/forms/InputField";
import ToggleInput from "components/ub/forms/ToggleInput";
import CommissionPercentageField from "components/ub/forms/CommissionPercentageField";
import { useToast } from "components/ub/feedback/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";

interface InviteAgencyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteAgencyMemberModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteAgencyMemberModalProps) {
  const { inviteMember, loading } = useInviteAgencyMember();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    commission_visible: true,
    commission_display_percentage: 10,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApiError = useApiFormErrors({
    emailField: "email",
    setErrors: (patch) => {
      setErrors((prev) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) => showToast(`Failed to send invitation. ${message}`, "error"),
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setFormData({ name: "", email: "", commission_visible: true, commission_display_percentage: 10 });
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

  const computeErrors = () => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!EMAIL_REGEX.test(formData.email.trim())) next.email = "Enter a valid email address";
    if (formData.commission_visible) {
      const pct = Number(formData.commission_display_percentage);
      if (Number.isNaN(pct) || pct < 1 || pct > 100) next.commission_display_percentage = "Enter a percentage between 1 and 100";
    }
    return next;
  };

  const validate = () => {
    const next = computeErrors();
    setErrors(next);
    if (Object.keys(next).length > 0) scrollToFirstError(next);
    return Object.keys(next).length === 0;
  };

  const validateField = (field: string) => {
    const next = computeErrors();
    setErrors((prev) => ({ ...prev, [field]: next[field] ?? "" }));
  };

  const handleInvite = async () => {
    if (!validate()) return;

    try {
      const res = await inviteMember({
        name: formData.name.trim(),
        email: formData.email.trim(),
        commission_visible: formData.commission_visible,
        ...(formData.commission_visible && { commission_display_percentage: Number(formData.commission_display_percentage) }),
      });
      showToast(res?.message || "Invitation sent successfully.", "success");
      onClose();
      onSuccess?.();
    } catch (error: unknown) {
      handleApiError(error, "Please try again.");
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
            title="Invite Team Member"
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
              onBlur={() => validateField("name")}
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
              onBlur={() => validateField("email")}
            />
            <ToggleInput
              label="Show Commission to This Member"
              field="commission_visible"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              enabledText="Visible to member"
              disabledText="Hidden from member"
              enabledDescription="This member can see their commission details."
              disabledDescription="This member cannot see their commission details."
            />
            {formData.commission_visible && (
              <CommissionPercentageField
                field="commission_display_percentage"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                disabled={loading}
              />
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
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
              className="w-full sm:w-auto"
              onClick={handleInvite}
              disabled={loading || !formData.name.trim() || !formData.email.trim()}
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
