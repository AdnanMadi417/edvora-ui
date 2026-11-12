"use client";

import React, { useState, useEffect } from "react";
import { BadgePercent } from "lucide-react";
import { useCreateCommissionType } from "features/knowledge-hub/commission/hooks";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { useRouter } from "next/navigation";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import InputField from "components/ub/forms/text/InputField";

interface CreateCommissionTypeProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCommissionType({
  isOpen,
  onClose,
}: CreateCommissionTypeProps) {
  const { createCommissionType, loading } = useCreateCommissionType();
  const { showToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_default: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", description: "", is_default: false });
      setErrors({});
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCreate = async () => {
    try {
      await createCommissionType(formData);
      showToast("Commission type created successfully.", "success");
      router.push("/admin/knowledge-hub/create");
      onClose();
    } catch (error: unknown) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to create commission type. ${backendMessage}`, "error");
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={BadgePercent}
      title="Create commission type"
      description="Define a commission structure for the Knowledge Hub."
      onSubmit={handleCreate}
      submitLabel="Create commission type"
      submitting={loading}
      submitDisabled={!formData.name.trim() || !formData.description.trim()}
    >
      <InputField
        label="Commission type name"
        field="name"
        placeholder="e.g. Percentage Commission"
        required
        formData={formData}
        errors={errors}
        updateFormData={updateFormData}
      />
      <InputField
        label="Description"
        field="description"
        placeholder="Describe how this commission type works..."
        required
        formData={formData}
        errors={errors}
        updateFormData={updateFormData}
      />
    </FormModal>
  );
}
