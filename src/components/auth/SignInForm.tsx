"use client";

import React, { useState } from "react";
import InputField from "../form/InputField";
import Checkbox from "../checkbox";
import { Lock } from 'lucide-react';

interface SignInFormProps {
  onSubmit: (email: string, password: string) => Promise<void> | void;
}

export default function SignInForm({ onSubmit }: SignInFormProps) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData.email, formData.password);
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
          <h1 className="text-3xl font-extrabold text-gray-900">Sign In</h1>
          <p className="mt-2 text-slate-600">
            Enter your email and password to access your account
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

          <InputField
            label="Password"
            field="password"
            type="password"
            placeholder="Min. 8 characters"
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center">
            <Checkbox id="remember" />
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
          className="group relative flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 font-semibold text-sm text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Lock className="h-4 w-4 text-white group-hover:text-blue-100 transition-colors" />
          {loading ? "Signing in..." : "Sign In"}
        </button>

      </form>

    </div>

  );
}
