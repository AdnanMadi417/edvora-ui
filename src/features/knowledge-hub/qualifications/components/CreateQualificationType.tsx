"use client";

import React, { useState, useEffect } from "react";
import { Award } from "lucide-react";
import { useCreateQualificationsType } from "features/knowledge-hub/qualifications/hooks";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { useRouter } from "next/navigation";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import InputField from "components/ub/forms/text/InputField";

interface CreateQualificationTypeProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateQualificationType({
  isOpen,
  onClose,
}: CreateQualificationTypeProps) {
  const { createQualificationType, loading } = useCreateQualificationsType();
  const { showToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "" });
      setErrors({});
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCreate = async () => {
    try {
      await createQualificationType({ name: formData.name });
      showToast("Qualification Type created successfully.", "success");
      setTimeout(() => router.refresh(), 1500);
      onClose();
    } catch (error: unknown) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(
        `Failed to create Qualification Type. ${backendMessage}`,
        "error"
      );
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={Award}
      title="Create qualification type"
      description="Add a qualification to the Knowledge Hub."
      onSubmit={handleCreate}
      submitLabel="Create qualification type"
      submitting={loading}
      submitDisabled={!formData.name.trim()}
    >
      <InputField
        label="Qualification type"
        field="name"
        placeholder="e.g. Foundation"
        required
        formData={formData}
        errors={errors}
        updateFormData={updateFormData}
      />
    </FormModal>
  );
}
