"use client";

import React, { useEffect, useState } from "react";
import { KeyRound, XCircle } from "lucide-react";
import { useAdminResendRegistrationOtp } from "features/partners/hooks";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/fields/InputField";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResendRegistrationOtpModal({ isOpen, onClose }: Props) {
  const { showToast } = useToast();
  const { resendRegistrationOtp, loading } = useAdminResendRegistrationOtp();

  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setFormData({ email: "" });
        setErrors({});
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async () => {
    const email = formData.email.trim();
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setErrors({ email: "Enter a valid email address" });
      return;
    }
    try {
      const res = await resendRegistrationOtp(email);
      showToast(res?.message || "Verification code resent successfully", "success");
      onClose();
    } catch (err: unknown) {
      showToast(parseApiError(err, "Failed to resend verification code"), "error");
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Resend Verification Code"
            description="Resend a partner registration OTP by email"
            icon={KeyRound}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="space-y-4 px-7 py-6">
            <p className="text-sm text-slate-500">
              For registrations still stuck at email verification — enter the email the
              partner registered with and a new code will be sent.
            </p>

            <InputField
              label="Email"
              field="email"
              type="email"
              placeholder="partner@example.com"
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
              icon={<KeyRound className="h-5 w-5" />}
              text={loading ? "Sending..." : "Resend Code"}
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
    </div>
  );
}
