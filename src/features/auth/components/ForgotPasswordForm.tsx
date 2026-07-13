"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useForgotPassword } from "../hooks";
import AuthLayout from "./AuthLayout";
import InputField from "components/form/fields/InputField";

export default function ForgotPasswordForm() {
  const { forgotPassword, loading, submitted } = useForgotPassword();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!email.trim()) { setError("Email is required"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address"); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await forgotPassword(email.trim());
  };

  if (submitted) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Check your email</h2>
          <p className="mt-2 text-sm text-slate-500">
            If <span className="font-medium text-slate-700">{email}</span> is registered,
            you&apos;ll receive a reset link shortly.
          </p>
          <p className="mt-1 text-xs text-slate-400">The link expires in 30 minutes.</p>
          <Link
            href="/auth/sign-in"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Forgot your password?</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        <InputField
          label="Email address"
          field="email"
          type="email"
          placeholder="you@example.com"
          formData={{ email }}
          errors={{ email: error }}
          updateFormData={(_, val) => { setEmail(val); setError(""); }}
        />

        <button
          type="submit"
          disabled={loading || !email}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <Link
        href="/auth/sign-in"
        className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </AuthLayout>
  );
}
