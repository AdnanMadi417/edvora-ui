import {
  Pencil,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import InputField from "components/form/InputField";
import PasswordField from "components/form/PasswordField";
import ToggleInput from "components/form/toggle/ToggleInput";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";

import { AccountManager } from "hooks/account-managers/useAccountManagerDetails";
import { useEditAccountManager } from "hooks/account-managers/useEditAccountManager";
import { useRouter } from "next/navigation";

interface EditProfileDetailsProps {
  manager: AccountManager;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
}

export default function EditProfileDetails({
  manager,
}: EditProfileDetailsProps) {
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

    if (formData.password && formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
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

      setTimeout(() => {
        router.back();
      }, 3000);

    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ||
        "Please try again.";

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
    router.back();
  };

  return (
    <section>

      <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm transition-all duration-300">

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

                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                  <Pencil className="h-3 w-3" />
                  Editing
                </span>
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
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">

            <PasswordField
              label="Password"
              field="password"
              placeholder="At least 8 characters, letters & numbers"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateField}
            />

            <PasswordField
              label="Confirm Password"
              field="confirm_password"
              placeholder="Repeat your password"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateField}
            />

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
            disabled={loading || !isFormChanged()}
          />
        </div>
      </div>
    </section>
  );
}
