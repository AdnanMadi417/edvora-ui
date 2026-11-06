"use client";

import React, { useState, useEffect } from "react";
import { Edit3 } from "lucide-react";

import { useUpdateFieldOfStudy } from "features/universities/fields-of-study/hooks";

import FormModal from "components/ub/feedback/dialogs/FormModal";
import InputField from "components/ub/forms/text/InputField";
import ToggleInput from "components/ub/forms/choices/ToggleInput";

import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";

interface UpdateFieldProps {
  isOpen: boolean;
  onClose: () => void;
  selectedField: {
    id: string;
    name: string;
    is_active?: boolean;
  } | null;
  onSuccess?: () => void;
}

export default function UpdateFieldOfStudy({
  isOpen,
  onClose,
  selectedField,
  onSuccess,
}: UpdateFieldProps) {
  const { updateFieldOfStudy, fieldLoading } = useUpdateFieldOfStudy(
    selectedField?.id
  );
  const [initialFormData, setInitialFormData] = useState<any>(null);

  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    is_active: true,
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

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        is_active: true,
      });
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedField || !isOpen) return;

    const initial = {
      name: selectedField.name || "",
      is_active: selectedField.is_active ?? true,
    };

    setFormData(initial);
    setInitialFormData(initial);
  }, [selectedField, isOpen]);

  const validateName = (name: string): string => {
    if (!name.trim()) return "Field of study name is required";
    if (name.trim().length < 3) return "Name must be at least 3 characters";
    if (name.trim().length > 100) return "Name must not exceed 100 characters";
    return "";
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const validateField = (field: string) => {
    if (field === "name") {
      const err = validateName(formData.name);
      setErrors((prev) => ({ ...prev, name: err }));
    }
  };

  const isFormChanged = React.useMemo(() => {
    if (!initialFormData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  const handleUpdate = async () => {
    const nameErr = validateName(formData.name);
    if (nameErr) {
      const e = { name: nameErr };
      setErrors(e);
      scrollToFirstError(e);
      return;
    }

    try {
      await updateFieldOfStudy({
        name: formData.name.trim(),
        is_active: formData.is_active,
      });

      showToast("Field of study updated successfully.", "success");

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
      icon={Edit3}
      title="Edit field of study"
      description="Update the study area and whether it is available for selection."
      onSubmit={async () => {
        await handleUpdate();
      }}
      submitLabel="Save changes"
      submitting={fieldLoading}
      submitDisabled={
        !isFormChanged ||
        !formData.name.trim() ||
        formData.name.trim().length < 3 ||
        formData.name.trim().length > 100
      }
    >
      <fieldset disabled={fieldLoading} className="min-w-0 space-y-4">
        <InputField
          label="Field Of Study Name"
          field="name"
          required
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          onBlur={() => validateField("name")}
        />

        <ToggleInput
          label="Status"
          field="is_active"
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          enabledText="Active"
          disabledText="Inactive"
          enabledDescription="This field of study is visible and selectable."
          disabledDescription="This field of study is hidden from selection."
        />
      </fieldset>
    </FormModal>
  );
}
