
import React, { useState } from "react";

import { Building2, GraduationCap, XCircle } from "lucide-react";
import { useToast } from "components/context/ToastContext";

import Loading from "components/loading/Loading";

import Button from "../../../ui/buttons/Button";

import SettingToggleInput from "../../../form/toggle/SettingToggleInput";
import InputField from "../../../form/InputField";

import { useRouter } from "next/navigation";

import { useCreateUniversityType } from "../../../../hooks/knowledge-hub/config-universities/useCreateUniversityType";
import {
  useApplicationSubmissionFields,
} from "../../../../hooks/knowledge-hub/config-universities/useApplicationSubmissionFields";

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

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.description.trim() !== "" &&
    Object.keys(formData.required_fields_map || {}).length > 0;

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
    try {
      const required_fields = Object.entries(
        formData.required_fields_map
      ).map(([id, is_required]) => ({
        application_submission_field_id: id,
        is_required: Boolean(is_required),
      }));

      await createUniversityType({
        name: formData.name,
        description: formData.description,
        required_fields,
      });

      showToast("University type created successfully.");
      router.push("/admin/config-universities");
    } catch (err: any) {
      const apiErrors = err?.response?.data?.detail;

      if (Array.isArray(apiErrors)) {
        const newErrors: Record<string, string> = {};

        apiErrors.forEach((e: any) => {
          if (e?.loc?.[1]) {
            newErrors[e.loc[1]] = e.msg;
          }
        });

        setErrors(newErrors);
      }

      showToast("Failed to create university type.");
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
    <section className="mx-auto mt-5">
      <div className="rounded-md border bg-white">
        <div className="flex items-start gap-x-4 bg-gray-50 rounded-t-md border-b px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="text-blue-700" size={24} />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 px-6 py-5">
          <InputField
            label="Type Name"
            field="name"
            placeholder="e.g. Public University"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <InputField
            label="Description"
            field="description"
            placeholder="Brief description..."
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
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

        <div className="flex justify-end gap-2 bg-gray-50 border-t rounded-b-md px-6 py-5">

          <Button
            onClick={handleBack}
            icon={<XCircle  className="h-5 w-5" />}
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
            icon={<GraduationCap  className="h-5 w-5" />}
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