"use client";

import React, { useState } from "react";
import { UserPlus } from "lucide-react";

import InputField from "components/ub/forms/text/InputField";
import PasswordField from "components/ub/forms/password/PasswordField";
import PasswordRequirementsChecklist from "components/ub/forms/password/PasswordRequirementsChecklist";
import PasswordMatchIndicator from "components/ub/forms/password/PasswordMatchIndicator";
import FormPage from "components/ub/forms/layout/FormPage";
import { FormSection } from "components/ub/feedback/dialogs/FormModal";
import Alert from "components/ub/feedback/notifications/Alert";

import { useCreateAccountManager } from "../hooks/useCreateAccountManager";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
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

  const {
    createAccountManager,
    loadingCreateAccountManager,
    errorCreateAccountManager,
  } = useCreateAccountManager();

  const updateFormData = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
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

    if (!formData.confirm_password)
      newErrors.confirm_password = "Please confirm password";
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
    <FormPage
      title="Create account manager"
      description="Add a team member to support advisors and manage applications."
      icon={UserPlus}
      onSubmit={handleSubmit}
      onCancel={handleBack}
      submitLabel="Create account manager"
      submitting={loadingCreateAccountManager}
      submitDisabled={!isFormValid}
    >
      <FormSection
        id="manager-details"
        title="Personal details"
        description="The name and email used for this manager's account."
      >
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
      </FormSection>
      <FormSection
        id="manager-security"
        title="Account security"
        description="Choose a strong password for the new account."
      >
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
          <PasswordMatchIndicator
            password={formData.password}
            confirmPassword={formData.confirm_password}
          />
        </div>
      </FormSection>
      {errorCreateAccountManager && (
        <Alert tone="danger" title="Couldn't create account manager">
          {errorCreateAccountManager}
        </Alert>
      )}
    </FormPage>
  );
}
