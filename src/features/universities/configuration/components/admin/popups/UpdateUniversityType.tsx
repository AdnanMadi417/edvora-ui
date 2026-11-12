"use client";

import React, { useEffect, useState } from "react";
import { Layers } from "lucide-react";

import {
  useAssignUniversityType,
  useUniversityTypes,
} from "features/universities/configuration/hooks";

import FormModal from "components/ub/feedback/dialogs/FormModal";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import SelectField from "components/ub/forms/selection/SelectField";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  universityId: string | null;
  initialData?: {
    university_type_id?: string | null;
  } | null;
  onSuccess?: () => void;
}

export default function AssignUniversityTypeModal({
  isOpen,
  onClose,
  universityId,
  initialData,
  onSuccess,
}: Props) {
  const { assignUniversityType, loading } =
    useAssignUniversityType(universityId);

  const { showToast } = useToast();

  const { universities: universityTypes } = useUniversityTypes();

  const [formData, setFormData] = useState({
    university_type_id: "" as string | "",
  });
  const [initialFormData, setInitialFormData] = useState({
    university_type_id: "" as string | "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApiError = useApiFormErrors({
    setErrors: (patch) => {
      setErrors((prev) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) =>
      showToast(`Update failed. ${message}`, "error"),
  });

  const isFormValid = formData.university_type_id.trim() !== "";

  useEffect(() => {
    if (initialData) {
      const initial = {
        university_type_id: initialData.university_type_id || "",
      };

      setFormData(initial);
      setInitialFormData(initial);
    }
  }, [initialData]);

  const isFormChanged =
    formData.university_type_id !== initialFormData.university_type_id;

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

  const handleSubmit = async () => {
    if (!isFormValid) {
      const e = { university_type_id: "University type is required" };
      setErrors(e);
      scrollToFirstError(e);
      return;
    }

    try {
      await assignUniversityType({
        university_type_id: formData.university_type_id || null,
      });

      showToast("University type assigned successfully", "success");

      onClose();
      onSuccess?.();
    } catch (error: unknown) {
      handleApiError(error, "Please try again.");
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={Layers}
      title="Assign university type"
      description="Choose the category that best describes this institution."
      onSubmit={async () => {
        await handleSubmit();
      }}
      submitLabel="Save changes"
      submitting={loading}
      submitDisabled={!isFormValid || !isFormChanged}
    >
      <fieldset disabled={loading} className="min-w-0 space-y-4">
        <SelectField
          label="University type"
          field="university_type_id"
          required
          options={universityTypes.map((type) => ({
            value: String(type.id),
            label: type.name,
          }))}
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />
      </fieldset>
    </FormModal>
  );
}
