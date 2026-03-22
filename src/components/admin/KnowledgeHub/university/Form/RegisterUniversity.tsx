"use client";

import React, { useState } from "react";
import { GraduationCap, School, ChevronLeft } from "lucide-react";

import { useCreateUniversity } from "hooks/knowledge-hub/universities/useCreateKnowledgeHubUniversity";
import InputField from "components/form/InputField";
import MultipleDatePickerModal from "components/form/MultipleDatePickerModal";
import { useToast } from "components/context/ToastContext";
import Button from "components/ui/buttons/Button";
import { useRouter } from "next/navigation";

export default function RegisterUniversity() {
  const { createUniversity, loading } = useCreateUniversity();
  const { showToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    intake_months: [] as string[],
    country: "Malaysia",
    is_active: true,

  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormValid = formData.name.trim() && formData.intake_months.length > 0;

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleCreate = async () => {
    try {
      await createUniversity(formData);
      showToast("University created successfully.", "success");

      setTimeout(() => {
        router.push("/admin/universities");
      }, 2000);
    } catch (error: any) {
      const code = error?.response?.data?.code;
      let message = "Please try again.";

      if (code === "university_name_exists") {
        message =
          "A university with this name already exists. Please use a different name.";
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      }

      showToast(`Failed to create university. ${message}`, "error");
    }
  };

  const handleBack = () => {
    router.push("/admin/universities");
  };

  return (
    <section className="mx-auto mt-5">
      <div className="mt-6 rounded-md border bg-white">
        <div className="flex justify-between border-b p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700">
              <School className="h-6 w-6 text-white" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Register a new university
              </h2>
              <p className="text-sm text-slate-500">
                Complete the required information to register a new knowledge
                hub university
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <InputField
            label="University Name"
            field="name"
            placeholder="e.g. Universiti Malaya"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <InputField
            label="Description"
            field="description"
            placeholder="Brief university description..."
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            required={false}
          />

          <MultipleDatePickerModal
            label="Intake Dates"
            field="intake_months"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        </div>

        <div className="flex justify-end gap-2 border-t p-6">
          <Button
            onClick={handleBack}
            disabled={loading}
            icon={<ChevronLeft className="h-5 w-5" />}
            text={"Back"}
            bgColor="bg-slate-50"
            textColor="text-slate-700"
            borderColor="border-slate-600"
            hoverTextColor="hover:text-slate-800"
            hoverBorderColor="hover:border-slate-700"
          />

          <Button
            onClick={handleCreate}
            disabled={loading || !isFormValid}
            icon={<GraduationCap className="h-5 w-5" />}
            text={loading ? "Creating..." : "Create University"}
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
