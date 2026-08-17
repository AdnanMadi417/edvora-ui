"use client";

import React, { useState, useEffect } from "react";
import { XCircle, UserPlus, Info } from "lucide-react";

import { useInviteAgencyMember } from "../../hooks";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/fields/InputField";
import ToggleInput from "components/form/toggle/ToggleInput";
import { Tooltip } from "components/ui/tooltip";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";

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

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!EMAIL_REGEX.test(formData.email.trim())) next.email = "Enter a valid email address";
    if (formData.commission_visible) {
      const pct = Number(formData.commission_display_percentage);
      if (Number.isNaN(pct) || pct < 1 || pct > 100) next.commission_display_percentage = "Enter a percentage between 1 and 100";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
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
            <ToggleInput
              label="Show Commission to This Member"
              field="commission_visible"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
            {formData.commission_visible && (
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-p2 font-medium text-slate-900">
                    Commission Display Percentage
                    <Tooltip
                      position="top"
                      content="What percentage of the total commission this member sees reflected in their own dashboard — this doesn't change their actual payout."
                    >
                      <Info className="h-3.5 w-3.5 text-slate-400" />
                    </Tooltip>
                  </label>
                  <span className="text-sm font-semibold text-blue-700">
                    {formData.commission_display_percentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={formData.commission_display_percentage}
                  disabled={loading}
                  onChange={(e) => updateFormData("commission_display_percentage", Number(e.target.value))}
                  className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <p className="mt-1 text-xs text-slate-400">
                  What percentage of the commission this member sees.
                </p>
                {errors.commission_display_percentage && (
                  <p className="mt-1 text-xs text-red-600">{errors.commission_display_percentage}</p>
                )}
              </div>
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
