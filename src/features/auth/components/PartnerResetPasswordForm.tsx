"use client";

import React, { useState } from "react";
import { KeyRound } from "lucide-react";
import { usePartnerResetPassword } from "../hooks";
import AuthLayout from "./AuthLayout";
import PasswordField from "components/form/fields/PasswordField";

export default function PartnerResetPasswordForm() {
  const { resetPassword, loading, error, success } = usePartnerResetPassword();

  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await resetPassword(formData.current_password, formData.new_password);
  };

  const isDisabled =
    loading || !formData.current_password || !formData.new_password || !formData.confirm_password;

  if (success) {
    return (
      <AuthLayout hideLogo>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <KeyRound className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Password updated</h2>
          <p className="mt-1 text-sm text-slate-500">Redirecting you to the dashboard…</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout hideLogo>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <KeyRound className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Set your password</h1>
        <p className="mt-1 text-sm text-slate-500">
          A password reset is required before you can continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
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

        {error && (
          <p className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isDisabled}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Updating…" : "Update Password"}
        </button>
      </form>
    </AuthLayout>
  );
}
