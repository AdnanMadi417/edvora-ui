"use client";

import React, { useState, useEffect } from "react";
import { KeyRound } from "lucide-react";
import ModalHeader from "components/ui/modal/ModalHeader";
import PasswordField from "components/form/fields/PasswordField";
import { useToast } from "components/context/ToastContext";
import api from "lib/useApi";

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
  const [apiError, setApiError] = useState("");

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
    setApiError("");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.current_password) e.current_password = "Current password is required";
    if (!formData.new_password) {
      e.new_password = "New password is required";
    } else if (formData.new_password.length < 8) {
      e.new_password = "Password must be at least 8 characters";
    }
    if (!formData.confirm_password) {
      e.confirm_password = "Please confirm your new password";
    } else if (formData.new_password !== formData.confirm_password) {
      e.confirm_password = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleClose = () => {
    setFormData({ current_password: "", new_password: "", confirm_password: "" });
    setErrors({});
    setApiError("");
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
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setApiError(
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? (detail[0]?.msg ?? "Request failed.")
            : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading ||
    !formData.current_password ||
    !formData.new_password ||
    !formData.confirm_password;

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
            />
            <PasswordField
              label="New Password"
              field="new_password"
              placeholder="Min. 8 characters"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
            <PasswordField
              label="Confirm New Password"
              field="confirm_password"
              placeholder="Re-enter new password"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

            {apiError && (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {apiError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDisabled}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
