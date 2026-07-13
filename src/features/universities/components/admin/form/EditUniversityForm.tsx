"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";

import { useUniversityTypeDetails, useUpdateUniversityType, useApplicationSubmissionFields } from "features/universities/hooks";

import InputField from "components/form/fields/InputField";
import SettingToggleInput from "components/form/toggle/SettingToggleInput";
import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";

interface UniversityDetailsProps {
  id: string;
}

const UniversityDetails = ({ id }: UniversityDetailsProps) => {
  const router = useRouter();
  const { showToast } = useToast();
  const { university, error } = useUniversityTypeDetails(id);
  const { submissionFields } = useApplicationSubmissionFields();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialFormData, setInitialFormData] = useState<Record<string, any> | null>(null);

  const { updateUniversityType, loading } = useUpdateUniversityType(id);

  const fieldSource = React.useMemo(() => {
    const universityFields = university?.required_fields || [];

    if (universityFields.length > 0) return universityFields;

    return submissionFields || [];
  }, [university, submissionFields]);

  const normalizePayload = (data: Record<string, any>) => ({
    name: data?.name?.trim() || "",
    description: data?.description?.trim() || "",
    required_fields_map: data?.required_fields_map || {},
  });

  const validateName = (value: string): string => {
    if (!value?.trim()) return "Name is required";
    if (value.trim().length < 3) return "Name must be at least 3 characters";
    if (value.trim().length > 100) return "Name must not exceed 100 characters";
    return "";
  };

  const validateDescription = (value: string): string => {
    if (!value?.trim()) return "Description is required";
    if (value.trim().length < 10) return "Description must be at least 10 characters";
    return "";
  };

  const isFormValid =
    !validateName(formData.name) &&
    !validateDescription(formData.description);

  const updateFormData = (field: string, value: any) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    setFormData((prev: any) => {
      const clone = structuredClone(prev);

      const path = field.replace(/\[(\w+)\]/g, ".$1").split(".");

      let current = clone;

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;

      return clone;
    });
  };

  const handleUpdate = async () => {
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
      const payload = {
        name: formData.name?.trim() || "",
        description: formData.description?.trim() || "",

        required_fields: university.required_fields.map((field) => ({
          id: field.id,
          is_required: formData.required_fields_map?.[field.id] === true,
        })),
      };

      await updateUniversityType(payload);

      showToast("University type updated successfully", "success");

      router.push(`/admin/config-universities/${id}`);

    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || "Please try again.";
      showToast(`Update failed. ${backendMessage}`, "error");
    }
  };

  useEffect(() => {
    if (!university) return;

    const map: Record<string, boolean> = {};

    university.required_fields?.forEach((f) => {
      map[f.id] = Boolean(f.is_required);
    });

    const initial = {
      name: university.name || "",
      description: university.description || "",
      required_fields_map: map,
    };

    setFormData(initial);
    setInitialFormData(initial);
  }, [university]);

  const isFormChanged = React.useMemo(() => {
    if (!initialFormData) return false;

    const current = normalizePayload(formData);
    const initial = normalizePayload(initialFormData);

    return JSON.stringify(current) !== JSON.stringify(initial);
  }, [formData, initialFormData]);

  const handleBack = () => {
    router.push(`/admin/config-universities/${id}`);
  };

  const handleUpdateLink = () => {
    router.push(`/admin/config-universities/${id}`);
  };

  if (loading) {
    return <Loading text="Loading university details..." />;
  }

  if (error || !university) {
    return <EmptyData />;
  }

  return (
    <>
      <div className="mt-6 max-w-5xl mx-auto">
        <div className="rounded-md border bg-card shadow-sm">
          <div className="flex justify-between rounded-tl-md rounded-tr-md border-b  p-6">
            <div className="block">
              <h2 className="text-lg font-semibold">
                Application Required Fields
              </h2>

              <p className="mt-1 text-xs text-slate-700">
                Configure which fields are enabled in application submission
                form.
              </p>
            </div>

          </div>

          <div className="px-6 py-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Overview
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 ">
              <InputField
                label="University Name"
                field="name"
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
                label="University Description"
                field="description"
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
          </div>

          <div className="space-y-6 border-b border-slate-200 px-6">
            <div className="border-b border-slate-100 py-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Required at Submission
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Fields the partner must fill before submitting
              </p>
            </div>

            {fieldSource.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-3 md:grid-cols-2 lg:grid-cols-3">
                {fieldSource.map((field) => (
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

          <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
            <Button
              onClick={handleBack}
              icon={<ChevronLeft className="h-5 w-5" />}
              text="Back"
              bgColor="bg-white"
              textColor="text-slate-600"
              borderColor="border-slate-300"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-400"
              className="flex-1 hover:bg-slate-50"
            />
            <Button
              icon={<Pencil className="h-5 w-5" />}
              text={loading ? "Updating..." : "Save Changes"}
              bgColor="bg-blue-600"
              textColor="text-white"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-white"
              hoverBorderColor="hover:border-blue-700"
              onClick={handleUpdate}
              disabled={loading || !isFormChanged || !isFormValid}
              className="flex-1 hover:bg-blue-700"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default UniversityDetails;
