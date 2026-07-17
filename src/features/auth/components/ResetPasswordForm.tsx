"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, CheckCircle, AlertTriangle } from "lucide-react";
import { useResetPassword } from "../hooks";
import AuthLayout from "./AuthLayout";
import PasswordField from "components/form/fields/PasswordField";
import { validateNewPassword } from "utils/passwordValidation";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { resetPassword, loading, error, tokenInvalid, success } = useResetPassword();

  const [formData, setFormData] = useState({ new_password: "", confirm_password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const passwordError = validateNewPassword(formData.new_password);
    if (passwordError) e.new_password = passwordError;
    if (!formData.confirm_password) {
      e.confirm_password = "Please confirm your password";
    } else if (formData.new_password !== formData.confirm_password) {
      e.confirm_password = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await resetPassword(token, formData.new_password);
  };

  // No token in URL
  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Invalid reset link</h2>
          <p className="mt-2 text-sm text-slate-500">
            This link is missing a reset token. Please request a new one.
          </p>
          <Link
            href="/auth/forgot-password"
            className="mt-5 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Token invalid / expired
  if (tokenInvalid) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Link expired or already used</h2>
          <p className="mt-2 text-sm text-slate-500">
            This reset link is invalid, has expired, or has already been used.
            Reset links are valid for 30 minutes and can only be used once.
          </p>
          <Link
            href="/auth/forgot-password"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Success
  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Password reset</h2>
          <p className="mt-1 text-sm text-slate-500">Redirecting you to sign in…</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <KeyRound className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Set new password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose a strong password — at least 8 characters, with a letter and a number.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        <PasswordField
          label="New Password"
          field="new_password"
          placeholder="Min. 8 characters, 1 letter & 1 number"
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />
        <PasswordField
          label="Confirm Password"
          field="confirm_password"
          placeholder="Re-enter new password"
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !formData.new_password || !formData.confirm_password}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </AuthLayout>
  );
}
