"use client";

import React, { useState, useEffect } from "react";
import { Building2 } from "lucide-react";

import FormModal from "components/ub/feedback/dialogs/FormModal";

import InputField from "components/ub/forms/text/InputField";
import TextareaField from "components/ub/forms/text/TextareaField";

import { useCreateUniversityType } from "features/universities/configuration/hooks";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";

interface CreateUniversityProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateUniversityType({
  isOpen,
  onClose,
  onSuccess,
}: CreateUniversityProps) {
  const { createUniversityType, loading } = useCreateUniversityType();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApiError = useApiFormErrors({
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

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", description: "" });
      setErrors({});
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
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
      await createUniversityType({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      showToast("University type created successfully.", "success");

      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      handleApiError(err, "Please try again.");
    }
  };
  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={Building2}
      title="Create university type"
      description="Define an institution category for the Knowledge Hub."
      onSubmit={async () => {
        await handleCreate();
      }}
      submitLabel="Create university type"
      submitting={loading}
      submitDisabled={!isFormValid}
    >
      <fieldset disabled={loading} className="min-w-0 space-y-4">
        <InputField
          label="University type name"
          field="name"
          placeholder="e.g. Public university"
          required
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          onBlur={() => {
            const err = validateName(formData.name);
            if (err) setErrors((prev) => ({ ...prev, name: err }));
          }}
        />

        <TextareaField
          label="Description"
          field="description"
          placeholder="Describe the institutions in this category"
          required
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          onBlur={() => {
            const err = validateDescription(formData.description);
            if (err) setErrors((prev) => ({ ...prev, description: err }));
          }}
        />
      </fieldset>
    </FormModal>
  );
}
