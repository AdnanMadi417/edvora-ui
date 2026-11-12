"use client";

import React, { useState, useEffect } from "react";
import { Tag } from "lucide-react";

import { useCreateFieldOfStudy } from "features/universities/fields-of-study/hooks";

import FormModal from "components/ub/feedback/dialogs/FormModal";
import InputField from "components/ub/forms/text/InputField";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";

interface CreateFieldOfStudyProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateFieldOfStudy({
  isOpen,
  onClose,
  onSuccess,
}: CreateFieldOfStudyProps) {
  const { CreateFieldOfStudy, fieldLoading } = useCreateFieldOfStudy();

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
    // This form has just one real input — attach any unrecognized error
    // (e.g. a duplicate-name conflict) straight to it rather than only toasting.
    onUnmappedError: (message) => {
      showToast(`Failed to create Field Of Study. ${message}`, "error");
      const e = { name: message };
      setErrors(e);
      scrollToFirstError(e);
    },
  });

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

  const handleCreate = async () => {
    const nameErr = validateName(formData.name);
    if (nameErr) {
      const e = { name: nameErr };
      setErrors(e);
      scrollToFirstError(e);
      return;
    }

    try {
      await CreateFieldOfStudy({
        name: formData.name.trim(),
        is_active: formData.is_active,
      });

      showToast("Field Of Study created successfully.", "success");

      onClose();
      onSuccess?.();
    } catch (error: unknown) {
      handleApiError(error, "Please try again.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        is_active: true,
      });

      setErrors({});
    }
  }, [isOpen]);

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={Tag}
      title="Create field of study"
      description="Add a study area to help advisors find the right programmes."
      onSubmit={async () => {
        await handleCreate();
      }}
      submitLabel="Create field of study"
      submitting={fieldLoading}
      submitDisabled={
        !formData.name.trim() ||
        formData.name.trim().length < 3 ||
        formData.name.trim().length > 100
      }
    >
      <fieldset disabled={fieldLoading} className="min-w-0 space-y-4">
        <InputField
          label="Field of study name"
          field="name"
          placeholder="e.g. Computer Science"
          required
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          onBlur={() => validateField("name")}
        />
      </fieldset>
    </FormModal>
  );
}
