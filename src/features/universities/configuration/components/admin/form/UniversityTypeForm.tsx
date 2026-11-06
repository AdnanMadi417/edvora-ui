"use client";

import React, { useState } from "react";
import {
  useApplicationSubmissionFields,
  useCreateUniversityType,
} from "features/universities/configuration/hooks";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import UniversityTypeEditor from "features/universities/configuration/components/shared/UniversityTypeEditor";
import { useRouter } from "next/navigation";

interface Props {
  basePath?: string;
}

export default function UniversityTypeForm({
  basePath = "/admin/config-universities",
}: Props = {}) {
  const { createUniversityType, loading } = useCreateUniversityType();
  const { showToast } = useToast();
  const {
    submissionFields,
    loading: fieldsLoading,
    error: fieldsError,
    refetch: refetchFields,
  } = useApplicationSubmissionFields();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    required_fields_map: {} as Record<string, boolean>,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApiError = useApiFormErrors({
    fieldMap: (field, loc) => {
      const index = loc.indexOf("required_fields");
      if (index >= 0) {
        const id = Object.keys(formData.required_fields_map)[
          Number(loc[index + 1])
        ];
        if (id) return `required_fields_map.${id}`;
      }
      return field;
    },
    setErrors: (patch) => {
      setErrors((prev) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) =>
      showToast(`Failed to create university type. ${message}`, "error"),
  });

  const validateName = (value: string): string => {
    if (!value.trim()) return "Name is required";
    if (value.trim().length < 3) return "Name must be at least 3 characters";
    if (value.trim().length > 100) return "Name must not exceed 100 characters";
    return "";
  };

  const validateDescription = (value: string): string => {
    if (!value.trim()) return "Description is required";
    if (value.trim().length < 10)
      return "Description must be at least 10 characters";
    return "";
  };

  const isFormValid =
    !validateName(formData.name) && !validateDescription(formData.description);

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
      scrollToFirstError(newErrors);
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

      router.push(basePath);
    } catch (error: unknown) {
      handleApiError(error, "Please try again.");
    }
  };

  const handleBack = () => {
    router.push(basePath);
  };

  return (
    <UniversityTypeEditor
      formData={formData}
      errors={errors}
      submissionFields={submissionFields}
      updateFormData={updateFormData}
      onValidate={(field) =>
        setErrors((previous) => ({
          ...previous,
          [field]:
            field === "name"
              ? validateName(formData.name)
              : validateDescription(formData.description),
        }))
      }
      onSubmit={handleCreate}
      onCancel={handleBack}
      loading={loading}
      fieldsLoading={fieldsLoading}
      fieldsError={fieldsError}
      refetchFields={refetchFields}
      isFormValid={isFormValid}
    />
  );
}
