"use client";

import React, { useState, useEffect } from "react";
import { GitBranch } from "lucide-react";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import { useCreateBranch } from "features/universities/hooks";
import { useStates } from "features/programs/hooks/configuration/useStates";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import InputField from "components/ub/forms/text/InputField";
import SelectField from "components/ub/forms/selection/SelectField";

interface CreateBranchProps {
  isOpen: boolean;
  onClose: () => void;
  universityId: string;
  onSuccess?: () => void;
}

export default function CreateBranch({
  isOpen,
  onClose,
  universityId,
  onSuccess,
}: CreateBranchProps) {
  const { createBranch, branchLoading } = useCreateBranch();
  const { states } = useStates();
  const { showToast } = useToast();

  const stateOptions =
    states?.map((c) => ({ value: String(c.id), label: c.name })) || [];

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    state_id: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApiError = useApiFormErrors({
    setErrors: (patch) => {
      setErrors((prev) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) =>
      showToast(`Failed to create branch. ${message}`, "error"),
  });

  const isFormValid =
    formData.name.trim() && formData.location.trim() && formData.state_id;

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", location: "", state_id: "" });
      setErrors({});
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCreate = async () => {
    try {
      const newBranch = await createBranch(universityId, formData);
      showToast("Branch created successfully.", "success");
      onClose();
      onSuccess?.();
      return newBranch;
    } catch (error: unknown) {
      handleApiError(error, "Please try again.");
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={GitBranch}
      title="Create branch"
      description="Add a campus and its location to this institution."
      onSubmit={async () => {
        await handleCreate();
      }}
      submitLabel="Create branch"
      submitting={branchLoading}
      submitDisabled={!isFormValid}
    >
      <fieldset disabled={branchLoading} className="min-w-0 space-y-4">
        <InputField
          label="Branch name"
          field="name"
          placeholder="e.g. Main Campus"
          required
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />
        <InputField
          label="Location"
          field="location"
          placeholder="e.g. Kuala Lumpur"
          required
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />
        <SelectField
          label="State"
          field="state_id"
          required
          options={stateOptions}
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />
      </fieldset>
    </FormModal>
  );
}
