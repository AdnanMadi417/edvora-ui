"use client";

import { Pencil, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

import InputField from "components/form/fields/InputField";
import PasswordField from "components/form/fields/PasswordField";
import PasswordRequirementsChecklist from "components/form/fields/PasswordRequirementsChecklist";
import PasswordMatchIndicator from "components/form/fields/PasswordMatchIndicator";
import ToggleInput from "components/form/toggle/ToggleInput";
import Button from "components/ui/buttons/Button";
import { StatusBadge } from "components/ui/badges";
import { useToast } from "components/context/ToastContext";
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

export default function EditAccountManager({ manager }: EditAccountManagerProps) {
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
    <section>
      <div className="group relative max-w-5xl mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm transition-all duration-300">
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-light text-xl font-semibold text-slate-700 transition-transform group-hover:scale-105">
              {manager.name?.charAt(0).toUpperCase() ?? "?"}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">
                  Edit Account Manager
                </h1>

                <StatusBadge variant="info" icon={<Pencil className="h-3 w-3" />}>
                  Editing
                </StatusBadge>
              </div>

              <p className="text-sm text-slate-500">
                Update account manager profile and settings
              </p>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-slate-200" />

        <div className="space-y-6 p-6">
          <InputField
            label="Name"
            field="name"
            placeholder="e.g. FastTrack Logistics"
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

          <ToggleInput
            label="Active Status"
            field="is_active"
            formData={formData}
            errors={errors}
            updateFormData={updateField}
            enabledText="Active"
            disabledText="Suspended"
            enabledDescription="This account manager can log in and access the platform."
            disabledDescription="This account manager cannot log in until reactivated."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
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
                label="Confirm Password"
                field="confirm_password"
                placeholder="Repeat your new password"
                required={false}
                formData={formData}
                errors={errors}
                updateFormData={updateField}
              />
              {formData.password && (
                <PasswordMatchIndicator password={formData.password} confirmPassword={formData.confirm_password} />
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-slate-200 bg-card px-6 py-4">
          <Button
            icon={<XCircle className="h-4 w-4" />}
            text={loading ? "Cancelling..." : "Cancel"}
            bgColor="bg-slate-50"
            textColor="text-slate-500"
            borderColor="border-slate-500"
            hoverTextColor="hover:text-slate-700"
            hoverBorderColor="hover:border-slate-700"
            onClick={handleCancel}
          />

          <Button
            icon={<Pencil className="h-4 w-4" />}
            text={loading ? "Saving..." : "Save Changes"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
            onClick={handleSubmit}
            disabled={
              loading ||
              !isFormChanged() ||
              (!!formData.password &&
                (!isPasswordValid(formData.password) || formData.password !== formData.confirm_password))
            }
          />
        </div>
      </div>
    </section>
  );
}
