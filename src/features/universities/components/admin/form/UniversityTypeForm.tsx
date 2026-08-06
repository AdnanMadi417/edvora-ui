import React, { useState } from "react";

import { ArrowLeft, Layers, } from 'lucide-react';

import { useApplicationSubmissionFields, useCreateUniversityType } from "features/universities/hooks";

import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import InputField from "components/form/fields/InputField";
import Loading from "components/loading/Loading";
import Button from "components/ui/buttons/Button";
import SettingToggleInput from "components/form/toggle/SettingToggleInput";
import { useRouter } from "next/navigation";

export default function UniversityTypeForm() {
  const { createUniversityType, loading } = useCreateUniversityType();
  const { showToast } = useToast();
  const { submissionFields, loading: fieldsLoading } =
    useApplicationSubmissionFields();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    required_fields_map: {} as Record<string, boolean>,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateName = (value: string): string => {
    if (!value.trim()) return "Name is required";
    if (value.trim().length < 3) return "Name must be at least 3 characters";
    if (value.trim().length > 100) return "Name must not exceed 100 characters";
    return "";
  };

  const validateDescription = (value: string): string => {
    if (!value.trim()) return "Description is required";
    if (value.trim().length < 10) return "Description must be at least 10 characters";
    return "";
  };

  const isFormValid =
    !validateName(formData.name) &&
    !validateDescription(formData.description);

  const updateFormData = (field: string, value: any) => {
    if (field.startsWith("required_fields_map.")) {
      const fieldId = field.split(".")[1];

      setFormData((prev) => ({
        ...prev,
        required_fields_map: {
          ...prev.required_fields_map,
          [fieldId]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    const nameErr = validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;
    const descErr = validateDescription(formData.description);
    if (descErr) newErrors.description = descErr;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const required_fields = Object.entries(formData.required_fields_map).map(
        ([id, is_required]) => ({
          application_submission_field_id: id,
          is_required: Boolean(is_required),
        })
      );

      await createUniversityType({
        name: formData.name.trim(),
        description: formData.description.trim(),
        required_fields,
      });

      showToast("University type created successfully.", "success");

      router.push("/admin/config-universities");
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to create university type. ${backendMessage}`, "error");
    }
  };

  const handleBack = () => {
    router.push("/admin/config-universities");
  };

  if (fieldsLoading) {
    return (
      <section className="mx-auto mt-5 max-w-5xl">
        <div className="rounded-lg border border-slate-200 bg-card p-6">
          <Loading text="Fetching application fields..." />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-5 max-w-5xl">
      <div className="rounded-md border bg-white">
        <div className="flex items-start gap-x-4 rounded-t-md border-b px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
            <Layers className="text-blue-700" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Create University Type
            </h3>
            <p className="text-sm text-slate-500">
              Configure required fields for application submissions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-3 px-6 py-5 md:grid-cols-2">
          <InputField
            label="Category Type"
            field="name"
            placeholder="e.g. Type 1 - Minimal Submission"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            onBlur={() => {
              const err = validateName(formData.name);
              if (err) setErrors((prev) => ({ ...prev, name: err }));
            }}
          />

          <InputField
            label="Description"
            field="description"
            placeholder="Brief description..."
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            onBlur={() => {
              const err = validateDescription(formData.description);
              if (err) setErrors((prev) => ({ ...prev, description: err }));
            }}
          />
        </div>

        <div className="grid grid-cols-1 px-6 py-5">
          {submissionFields?.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-3 md:grid-cols-2 lg:grid-cols-3">
              {submissionFields.map((field) => (
                <SettingToggleInput
                  key={field.id}
                  label={field.field_name}
                  field={`required_fields_map.${field.id}`}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No submission fields available.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 rounded-b-md border-t px-6 py-5">
          <Button
            onClick={handleBack}
            icon={<ArrowLeft className="h-5 w-5" />}
            text={loading ? "Cancelling..." : "Cancel"}
            bgColor="bg-slate-50"
            textColor="text-slate-700"
            borderColor="border-slate-600"
            hoverTextColor="hover:text-slate-800"
            hoverBorderColor="hover:border-slate-700"
          />

          <Button
            onClick={handleCreate}
            disabled={loading || !isFormValid}
            icon={<Layers className="h-5 w-5" />}
            text={loading ? "Creating..." : "Create University Type"}
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
