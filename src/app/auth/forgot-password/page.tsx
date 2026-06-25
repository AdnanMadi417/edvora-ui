"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ChevronLeft } from "lucide-react";
import AuthLayout from "features/auth/components/AuthLayout";
import InputField from "components/form/fields/InputField";
import axios, { isAxiosError } from "axios";

const publicApi = axios.create({ baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api` });

type Step = "email" | "sent";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const updateFormData = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.email) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = "Enter a valid email address";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      await publicApi.post("/auth/forgot-password", { email: formData.email });
      setStep("sent");
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data?.detail ?? "Something went wrong. Please try again.")
        : "An unexpected error occurred.";
      setApiError(typeof message === "string" ? message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "sent") {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Check your email</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            We sent a password reset link to{" "}
            <span className="font-medium text-slate-700">{formData.email}</span>
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Didn&apos;t receive it?{" "}
            <button
              onClick={() => { setStep("email"); setApiError(""); }}
              className="font-medium text-blue-600 hover:underline"
            >
              Try again
            </button>
          </p>
          <div className="mt-6">
            <Link
              href="/auth/sign-in"
              className="flex items-center justify-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">Forgot password?</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        <InputField
          label="Email"
          field="email"
          type="email"
          placeholder="Enter your email"
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />

        {apiError && (
          <p className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {apiError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !formData.email}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>

        <Link
          href="/auth/sign-in"
          className="mt-3 flex items-center justify-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </form>
    </AuthLayout>
  );
}
