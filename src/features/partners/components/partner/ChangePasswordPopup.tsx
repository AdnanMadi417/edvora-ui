"use client";

import React, { useState, useEffect } from "react";
import { KeyRound } from "lucide-react";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import PasswordField from "components/ub/forms/password/PasswordField";
import PasswordRequirementsChecklist from "components/ub/forms/password/PasswordRequirementsChecklist";
import PasswordMatchIndicator from "components/ub/forms/password/PasswordMatchIndicator";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import api from "lib/useApi";
import { validateNewPassword, isPasswordValid } from "utils/passwordValidation";
import { parseApiError } from "utils/parseApiError";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordPopup({ isOpen, onClose }: Props) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const computeErrors = () => {
    const e: Record<string, string> = {};
    if (!formData.current_password)
      e.current_password = "Current password is required";

    const passwordError = validateNewPassword(formData.new_password);
    if (passwordError) e.new_password = passwordError;
    else if (
      formData.current_password &&
      formData.new_password === formData.current_password
    ) {
      e.new_password =
        "New password must be different from your current password";
    }

    if (!formData.confirm_password) {
      e.confirm_password = "Please confirm your new password";
    } else if (formData.new_password !== formData.confirm_password) {
      e.confirm_password = "Passwords do not match";
    }
    return e;
  };

  const validate = () => {
    const e = computeErrors();
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateField = (field: string) => {
    const e = computeErrors();
    setErrors((p) => ({ ...p, [field]: e[field] ?? "" }));
  };

  const handleClose = () => {
    setFormData({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/partners/reset-password", {
        current_password: formData.current_password,
        new_password: formData.new_password,
      });
      showToast("Password updated successfully.", "success");
      handleClose();
    } catch (err: unknown) {
      setErrors((p) => ({
        ...p,
        current_password: parseApiError(err, "Current password is incorrect."),
      }));
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading ||
    !formData.current_password ||
    !isPasswordValid(formData.new_password) ||
    !formData.confirm_password ||
    formData.new_password !== formData.confirm_password;

  return (
    <FormModal
      open={isOpen}
      onClose={handleClose}
      title="Change password"
      description="Set a new password for your account."
      icon={KeyRound}
      onSubmit={handleSubmit}
      submitLabel="Update password"
      submitting={loading}
      submitDisabled={isDisabled}
    >
      <fieldset disabled={loading} className="min-w-0 space-y-4">
        <PasswordField
          label="Current password"
          field="current_password"
          placeholder="Enter your current password"
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          onBlur={() => validateField("current_password")}
        />
        <PasswordField
          label="New password"
          field="new_password"
          placeholder="Min. 12 characters, 1 letter & 1 number"
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          onBlur={() => validateField("new_password")}
        />
        <PasswordRequirementsChecklist password={formData.new_password} />
        <PasswordField
          label="Confirm new password"
          field="confirm_password"
          placeholder="Re-enter new password"
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          onBlur={() => validateField("confirm_password")}
        />
        <PasswordMatchIndicator
          password={formData.new_password}
          confirmPassword={formData.confirm_password}
        />
      </fieldset>
    </FormModal>
  );
}
