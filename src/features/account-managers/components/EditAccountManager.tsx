"use client";

import { UserRound } from "lucide-react";
import React, { useEffect, useState } from "react";

import InputField from "components/ub/forms/text/InputField";
import PasswordField from "components/ub/forms/password/PasswordField";
import PasswordRequirementsChecklist from "components/ub/forms/password/PasswordRequirementsChecklist";
import PasswordMatchIndicator from "components/ub/forms/password/PasswordMatchIndicator";
import ToggleInput from "components/ub/forms/choices/ToggleInput";
import FormPage from "components/ub/forms/layout/FormPage";
import { FormSection } from "components/ub/feedback/dialogs/FormModal";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

import { useEditAccountManager } from "../hooks/useEditAccountManager";
import type { AccountManager } from "../types";
import { useRouter } from "next/navigation";
import { validateNewPassword, isPasswordValid } from "utils/passwordValidation";

interface EditAccountManagerProps {
  manager: AccountManager;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
}

export default function EditAccountManager({
  manager,
}: EditAccountManagerProps) {
  const { showToast } = useToast();
  const { editAccountManager, loading } = useEditAccountManager(manager?.id);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    is_active: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (manager) {
      setFormData({
        name: manager.name || "",
        email: manager.email || "",
        password: "",
        confirm_password: "",
        is_active: manager.is_active ?? false,
      });
    }
  }, [manager]);

  const isFormChanged = () => {
    if (!manager) return false;
    return (
      formData.name !== manager.name ||
      formData.email !== manager.email ||
      formData.is_active !== (manager.is_active ?? false) ||
      formData.password.trim() !== ""
    );
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";

    if (formData.password) {
      const passwordError = validateNewPassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
      else if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload: any = {
      name: formData.name,
      email: formData.email,
      is_active: formData.is_active,
    };

    if (formData.password.trim()) {
      payload.password = formData.password;
    }

    try {
      await editAccountManager(payload);
      showToast("Account Manager updated successfully", "success");
      router.push(`/admin/account-managers/profile/${manager.id}`);
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to update Account Manager. ${backendMessage}`, "error");

      if (error?.response?.data?.code === "email_already_exists") {
        setErrors((prev) => ({
          ...prev,
          email: error.response.data.message,
        }));
      }
    }
  };

  const handleCancel = () => {
    router.push(`/admin/account-managers/profile/${manager.id}`);
  };

  return (
    <FormPage
      title="Edit account manager"
      description="Update the profile, password, and platform access for this account."
      icon={UserRound}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel="Save changes"
      submitting={loading}
      submitDisabled={
        !isFormChanged() ||
        (!!formData.password &&
          (!isPasswordValid(formData.password) ||
            formData.password !== formData.confirm_password))
      }
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
          updateFormData={updateField}
        />

        <InputField
          label="Email"
          field="email"
          placeholder="e.g. manager@example.com"
          type="email"
          required
          formData={formData}
          errors={errors}
          updateFormData={updateField}
        />
      </FormSection>
      <FormSection
        id="manager-security"
        title="Change password"
        description="Leave both fields blank to keep the current password."
      >
        <div>
          <PasswordField
            label="Password"
            field="password"
            placeholder="Leave blank to keep current password"
            required={false}
            formData={formData}
            errors={errors}
            updateFormData={updateField}
          />
          <PasswordRequirementsChecklist password={formData.password} />
        </div>

        <div>
          <PasswordField
            label="Confirm password"
            field="confirm_password"
            placeholder="Repeat your new password"
            required={false}
            formData={formData}
            errors={errors}
            updateFormData={updateField}
          />
          {formData.password && (
            <PasswordMatchIndicator
              password={formData.password}
              confirmPassword={formData.confirm_password}
            />
          )}
        </div>
      </FormSection>
      <FormSection id="manager-access" title="Account access" columns={1}>
        <ToggleInput
          label="Active status"
          field="is_active"
          formData={formData}
          errors={errors}
          updateFormData={updateField}
          enabledText="Active"
          disabledText="Suspended"
          enabledDescription="This account manager can log in and access the platform."
          disabledDescription="This account manager cannot log in until reactivated."
        />
      </FormSection>
    </FormPage>
  );
}
