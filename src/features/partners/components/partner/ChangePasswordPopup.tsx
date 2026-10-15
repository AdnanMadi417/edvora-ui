"use client";

import React, { useState, useEffect } from "react";
import { KeyRound } from "lucide-react";
import ModalHeader from "components/ui/modal/ModalHeader";
import PasswordField from "components/form/fields/PasswordField";
import PasswordRequirementsChecklist from "components/form/fields/PasswordRequirementsChecklist";
import PasswordMatchIndicator from "components/form/fields/PasswordMatchIndicator";
import { useToast } from "components/context/ToastContext";
import api from "lib/useApi";
import { validateNewPassword, isPasswordValid } from "utils/passwordValidation";
import Button from "components/ui/buttons/Button";
import { parseApiError } from "utils/parseApiError";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordPopup({ isOpen, onClose }: Props) {
  const { showToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const t = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const updateFormData = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const computeErrors = () => {
    const e: Record<string, string> = {};
    if (!formData.current_password) e.current_password = "Current password is required";

    const passwordError = validateNewPassword(formData.new_password);
    if (passwordError) e.new_password = passwordError;
    else if (formData.current_password && formData.new_password === formData.current_password) {
      e.new_password = "New password must be different from your current password";
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
    setFormData({ current_password: "", new_password: "", confirm_password: "" });
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setErrors((p) => ({ ...p, current_password: parseApiError(err, "Current password is incorrect.") }));
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
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm transition-all duration-300"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-xl bg-white shadow-xl">
          <ModalHeader
            title="Change Password"
            description="Set a new password for your account"
            icon={KeyRound}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            onClose={handleClose}
          />

          <form onSubmit={handleSubmit} className="p-5">
            <PasswordField
              label="Current Password"
              field="current_password"
              placeholder="Enter your current password"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => validateField("current_password")}
            />
            <PasswordField
              label="New Password"
              field="new_password"
              placeholder="Min. 12 characters, 1 letter & 1 number"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => validateField("new_password")}
            />
            <PasswordRequirementsChecklist password={formData.new_password} />
            <PasswordField
              label="Confirm New Password"
              field="confirm_password"
              placeholder="Re-enter new password"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => validateField("confirm_password")}
            />
            <PasswordMatchIndicator password={formData.new_password} confirmPassword={formData.confirm_password} />

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleClose}
                text="Cancel"
                bgColor="bg-white"
                textColor="text-slate-700"
                borderColor="border-slate-200"
                hoverTextColor="hover:text-slate-700"
                hoverBorderColor="hover:border-slate-200"
                className="flex-1 hover:bg-slate-50"
              />
              <Button
                type="submit"
                disabled={isDisabled}
                text={loading ? "Updating…" : "Update Password"}
                bgColor="bg-blue-600"
                textColor="text-white"
                borderColor="border-blue-600"
                hoverTextColor="hover:text-white"
                hoverBorderColor="hover:border-blue-600"
                className="flex-1 font-semibold hover:bg-blue-700"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
