"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSignIn } from "../hooks";

import InputField from "components/form/fields/InputField";
import PasswordField from "components/form/fields/PasswordField";

export default function SignInForm() {
  const { signIn, loading, error } = useSignIn();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDisabled = loading || !formData.email || !formData.password;

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await signIn(formData.email, formData.password);
  };

  return (
    <div>
      <form className="flex w-full max-w-[400px] flex-col gap-4" onSubmit={handleSubmit}>
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>
          <p className="mt-1.5 text-sm text-slate-500">Welcome back! Sign in to get started</p>
        </div>

        <div className="block">
          <InputField
            label="Email"
            field="email"
            type="email"
            placeholder="Enter your email"
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <PasswordField
            label="Password"
            field="password"
            placeholder="Enter your password"
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
          <div className="mt-1 flex flex-col items-end gap-1">
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </Link>
            <Link
              href="/auth/register?showCodeEntry=1"
              className="text-xs font-medium text-slate-400 hover:text-blue-600 hover:underline"
            >
              Already have a verification code?
            </Link>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isDisabled}
          className="mt-2 flex w-full items-center justify-center rounded-full bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Want to become a partner?{" "}
          <Link href="/auth/register" className="font-medium text-blue-600 hover:underline">
            Join Now
          </Link>
        </p>
      </form>
    </div>
  );
}
