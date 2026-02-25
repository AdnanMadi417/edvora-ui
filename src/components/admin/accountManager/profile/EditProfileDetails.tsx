import {
  Pencil,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { AccountManager } from "hooks/account-managers/useAccountManagerDetails";
import InputField from "../../../form/InputField";
import ToggleInput from "../../../form/ToggleInput";
import UpdatedBtn from "../../../ui/buttons/Button";
import CancelBtn from "../../../ui/buttons/Button";
import { useToast } from "../../../context/ToastContext";
import { useEditAccountManager } from "../../../../hooks/account-managers/useEditAccountManager";
import { useRouter } from "next/navigation";

interface EditProfileDetailsProps {
  manager: AccountManager;
}

interface EditAccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  manager: any;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
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
    confirmPassword: "",
    is_active: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (manager) {
      setFormData({
        name: manager.name || "",
        email: manager.email || "",
        password: "",
        confirmPassword: "",
        is_active: manager.is_active ?? false,
      });
    }
  }, [manager]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      name: formData.name,
      email: formData.email,
      is_active: formData.is_active,
      ...(formData.password && { password: formData.password }),
    };

    try {
      await editAccountManager(payload);
      showToast("Account Manager updated successfully");

      setTimeout(() => {
        router.back();
      }, 3000);
    } catch {
      showToast("Failed to update Account Manager");
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
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-slate-200 bg-card px-6 py-4">

          <CancelBtn
            icon={<XCircle className="h-4 w-4" />}
            text={loading ? "Cancel..." : "Cancel Changes"}
            bgColor="bg-slate-50"
            textColor="text-slate-500"
            borderColor="border-slate-500"
            hoverTextColor="hover:text-slate-700"
            hoverBorderColor="hover:border-slate-700"
            onClick={handleCancel}

          />

          <UpdatedBtn
            icon={<Pencil className="h-4 w-4" />}
            text={loading ? "Saving..." : "Save Changes"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
            onClick={handleSubmit}
            disabled={loading}
          />
        </div>
      </div>
    </section>
  );
}
