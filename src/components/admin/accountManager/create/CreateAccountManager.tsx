"use client";

import React, { useState } from "react";
import { ChevronLeft} from 'lucide-react';
import { MdPersonAdd } from 'react-icons/md';

import InputField from "components/form/InputField";
import PasswordField from "components/form/PasswordField";
import Button from 'components/ui/buttons/Button';

import { useCreateAccountManager } from "hooks/account-managers/useCreateAccountManager";

import { useToast } from "components/context/ToastContext";
import { useRouter } from "next/navigation";

export interface FormData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  is_active: boolean;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function RegisterAccountManager() {
  const { showToast } = useToast();
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    is_active: true,
  });

  const { createAccountManager, loadingCreateAccountManager, errorCreateAccountManager } =
    useCreateAccountManager();

  const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.password.trim() &&
    formData.confirm_password.trim()

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirm_password) newErrors.confirm_password = "Please confirm password";

    if (formData.password && formData.confirm_password && formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (formData.password && !passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters, with at least 1 letter and 1 number";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      is_active: formData.is_active,
    };

    try {
      await createAccountManager(payload);

      showToast("Account Manager created successfully", "success");

      setFormData({
        name: "",
        email: "",
        password: "",
        confirm_password: "",
        is_active: false,
      });
      setErrors({});

      setTimeout(() => {
        router.push("/admin/account-managers");
      }, 1500);
    } catch (error) {

      const backendMessage =
        error?.response?.data?.message ||
        "Failed to create account manager. Please try again.";

      showToast(`Failed to create account manager. ${backendMessage}`, "error");

    }
  };

  const handleBack = () => {
    router.push("/admin/account-managers");
  };

  return (
    <section className="mx-auto mt-5 max-w-5xl">
      <div className="rounded-md border bg-slate-50 shadow-sm">
        <div className="flex items-start gap-x-4 rounded-t-xl border-b px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
            <MdAdminPanelSettings className="text-blue-700" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Create a New Manager
            </h3>
            <p className="text-sm text-slate-500">
              Fill in the required information to create a new account manager.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 px-6 py-5">
          <InputField
            label="Name"
            field="name"
            placeholder="Enter full name"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <InputField
            label="Email"
            field="email"
            type="email"
            placeholder="e.g. user@example.com"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <PasswordField
            label="Password"
            field="password"
            placeholder="At least 8 characters, letters & numbers"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <PasswordField
            label="Confirm Password"
            field="confirm_password"
            placeholder="Repeat your password"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          {errorCreateAccountManager && (
            <p className="text-sm text-red-600">{errorCreateAccountManager}</p>
          )}

        </div>

        <div className="flex justify-end border-t gap-2 rounded-b-xl px-6 py-5">

          <Button
            onClick={handleBack}
            disabled={loadingCreateAccountManager}
            icon={<ChevronLeft className="h-5 w-5" />}
            text="Back"
            bgColor="bg-slate-50"
            textColor="text-slate-700"
            borderColor="border-slate-600"
            hoverTextColor="hover:text-slate-800"
            hoverBorderColor="hover:border-slate-700"
          />

          <Button
            icon={<MdAdminPanelSettings className="h-5 w-5" />}
            text={loadingCreateAccountManager ? "Creating Manager..." : "Create Manager"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
            onClick={handleSubmit}
            disabled={loadingCreateAccountManager || !isFormValid}
          />

        </div>
      </div>
    </section>
  );
}
