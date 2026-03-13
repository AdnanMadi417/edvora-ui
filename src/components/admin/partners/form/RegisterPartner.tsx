"use client";

import React, { useState } from "react";
import { ChevronLeft, Handshake } from "lucide-react";
import InputField from "components/form/InputField";
import SelectField from "components/form/SelectField";
import { useToast } from "components/context/ToastContext";
import Button from "components/ui/buttons/Button";
import { useRouter } from "next/navigation";
import { useCreatePartner } from "hooks/partners/useCreatePartner";
import { PARTNER_TYPE } from "constants/lists";

export interface FormData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  is_active: boolean;

  type: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function RegisterPartner() {
  const { showToast } = useToast();
  const router = useRouter();
  const { createPartner, isCreatingPartner, createPartnerError } =
    useCreatePartner();

  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    is_active: true,
    type: "",
  });

  const updateFormData = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.password.trim() &&
    formData.confirm_password.trim() &&
    formData.password === formData.confirm_password &&
    formData.type.trim();

  const handleCreate = async () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirm_password)
      newErrors.confirm_password = "Please confirm password";

    if (
      formData.password &&
      formData.confirm_password &&
      formData.password !== formData.confirm_password
    ) {
      newErrors.confirm_password = "Passwords do not match";
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if (formData.password && !passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters with 1 letter and 1 number";
    }

    if (!formData.type)
      newErrors.type = "Please select type";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      is_active: formData.is_active,
      type: formData.type,
    };

    try {
      await createPartner(payload);

      showToast("Partner created successfully");

      setFormData({
        name: "",
        email: "",
        password: "",
        confirm_password: "",
        is_active: true,
        type: "",
      });

      setErrors({});

      // router.push("/admin/partners");
    } catch (error) {
      showToast(
        createPartnerError ||
        "Failed to create partner. Please try again."
      );
    }
  };

  const handleBack = () => {
    router.push("/admin/partners");
  };

  return (
    <section className="mx-auto mt-5">
      <div className="rounded-md border bg-white shadow-sm">

        <div className="flex items-start gap-x-4 rounded-t-xl border-b px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Handshake className="text-blue-700" size={24} />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Register a New Partner
            </h3>
            <p className="text-sm text-slate-500">
              Complete the required information to add a new partner to the
              system
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-3 px-6 py-5 md:grid-cols-2">
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

          <SelectField
            label="Partner Type"
            field="type"
            options={PARTNER_TYPE.map((t) => ({
              value: t.value,
              label: t.label
            }))}
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <InputField
            label="Password"
            field="password"
            type="password"
            placeholder="At least 8 characters, letters & numbers"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <InputField
            label="Confirm Password"
            field="confirm_password"
            type="password"
            placeholder="Repeat your password"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <div className="col-span-full">
            {createPartnerError && (
              <p className="text-sm text-red-600">{createPartnerError}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 rounded-b-xl border-t px-6 py-5">
          <Button
            onClick={handleBack}
            disabled={isCreatingPartner}
            icon={<ChevronLeft className="h-5 w-5" />}
            text="Back"
            bgColor="bg-slate-50"
            textColor="text-slate-700"
            borderColor="border-slate-600"
            hoverTextColor="hover:text-slate-800"
            hoverBorderColor="hover:border-slate-700"
          />

          <Button
            onClick={handleCreate}
            disabled={isCreatingPartner || !isFormValid}
            icon={<Handshake className="h-5 w-5" />}
            text={isCreatingPartner ? "Creating..." : "Create Partner"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
          />
        </div>
      </div>
    </section>
  );
}