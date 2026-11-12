"use client";

import React, { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { useResendStaffInvitationOtp } from "../../hooks";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import InputField from "components/ub/forms/text/InputField";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResendStaffInvitationOtpModal({
  isOpen,
  onClose,
}: Props) {
  const { showToast } = useToast();
  const { resendStaffInvitationOtp, loading } = useResendStaffInvitationOtp();

  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ email: "" });
      setErrors({});
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
      const res = await resendStaffInvitationOtp(email);
      showToast(
        res?.message || "Verification code resent successfully",
        "success"
      );
      onClose();
    } catch (err: unknown) {
      showToast(
        parseApiError(err, "Failed to resend verification code"),
        "error"
      );
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title="Resend verification code"
      description="Send a new verification code to an invited staff member."
      icon={KeyRound}
      size="md"
      submitLabel={loading ? "Sending..." : "Resend Code"}
      submitting={loading}
      onSubmit={(event) => {
        event.preventDefault();
        if (!loading) return handleSubmit();
      }}
    >
      <div className="space-y-4">
        <p className="text-sm text-ub-text-secondary">
          For invitations still stuck at email verification — enter the invited
          email and a new code will be sent.
        </p>

        <InputField
          label="Email"
          field="email"
          type="email"
          placeholder="staff@example.com"
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          disabled={loading}
        />
      </div>
    </FormModal>
  );
}
