"use client";

import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { MdPersonAdd } from "react-icons/md";

import InputField from "components/form/fields/InputField";
import PasswordField from "components/form/fields/PasswordField";
import PasswordRequirementsChecklist from "components/form/fields/PasswordRequirementsChecklist";
import PasswordMatchIndicator from "components/form/fields/PasswordMatchIndicator";
import Button from "components/ui/buttons/Button";

import { useCreateAccountManager } from "../hooks/useCreateAccountManager";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { useRouter } from "next/navigation";
import { validateNewPassword, isPasswordValid } from "utils/passwordValidation";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  is_active: boolean;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function CreateAccountManager() {
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
    !!formData.name.trim() &&
    !!formData.email.trim() &&
    isPasswordValid(formData.password) &&
    !!formData.confirm_password.trim() &&
    formData.password === formData.confirm_password;

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";

    const passwordError = validateNewPassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (!formData.confirm_password) newErrors.confirm_password = "Please confirm password";
    else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await createAccountManager({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        is_active: formData.is_active,
      });

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
    } catch (error: unknown) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to create account manager. ${backendMessage}`, "error");
    }
  };

  const handleBack = () => {
    router.push("/admin/account-managers");
  };

  return (
    <section className="mx-auto mt-5 max-w-5xl">
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-start gap-x-4 rounded-t-xl border-b px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
            <MdPersonAdd className="text-blue-700" size={24} />
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

          <div>
            <PasswordField
              label="Password"
              field="password"
              placeholder="At least 12 characters, letters & numbers"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
            <PasswordRequirementsChecklist password={formData.password} />
          </div>

          <div>
            <PasswordField
              label="Confirm Password"
              field="confirm_password"
              placeholder="Repeat your password"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
            <PasswordMatchIndicator password={formData.password} confirmPassword={formData.confirm_password} />
          </div>

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
            icon={<MdPersonAdd className="h-5 w-5" />}
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
