"use client";

import React, { useState } from "react";
import InputField from "../form/InputField";
import PasswordField from "../form/PasswordField";
import Checkbox from "../checkbox";
import { Lock } from "lucide-react";

interface SignInFormProps {
  onSubmit: (email: string, password: string, keepLoggedIn: boolean) => Promise<void> | void;
}

export default function SignInForm({ onSubmit }: SignInFormProps) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      await onSubmit(formData.email, formData.password, keepLoggedIn);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        className="flex w-full max-w-[400px] flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <div className="mb-6 text-center">
          <h1 className="text-xl font-medium text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to your account
          </p>
        </div>

        <div className="block">
          <InputField
            label="Email"
            field="email"
            type="email"
            placeholder="mail@gmail.com"
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <PasswordField
            label="Password"
            field="password"
            placeholder="Min. 8 characters"
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center">
            <Checkbox
              id="remember"
              checked={keepLoggedIn}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeepLoggedIn(e.target.checked)}
            />
            <label
              htmlFor="remember"
              className="ml-2 cursor-pointer text-p2 font-normal text-slate-600"
            >
              Keep me logged in
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 font-semibold text-sm text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Lock className="h-4 w-4 text-white transition-colors group-hover:text-blue-100" />
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
