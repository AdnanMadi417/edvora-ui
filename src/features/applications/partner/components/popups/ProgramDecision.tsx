"use client";

import Alert from "components/ub/feedback/notifications/Alert";
import Combobox from "components/ub/forms/selection/Combobox";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import React, { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { useUniversities } from "hooks/useUniversities";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useChangeProgram } from "features/applications/hooks";

interface ProgramDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string | number;
  universityId: string;
  correctionReason?: string;
  onRefetch?: () => void;
}

export default function ProgramDecisionModal({
                                               isOpen,
                                               onClose,
                                               applicationId,
                                               universityId,
                                               correctionReason,
                                               onRefetch,
                                             }: ProgramDecisionModalProps) {

  const { universities } = useUniversities();
  const { showToast } = useToast();

  const {
    formData,
    errors,
    loading,
    updateFormData,
    submit,
  } = useChangeProgram(applicationId);

  const selectedUniversity = universities?.find((u) => u.id === universityId);
  const programs = selectedUniversity?.programs || [];


  const handleSubmit = async () => {
    const success = await submit();

    if (success) {
      showToast("Program updated successfully", "success");
      onClose();
      onRefetch?.();
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={RefreshCcw}
      title="Select Program"
      description="Choose the new program and provide a reason."
      onSubmit={handleSubmit}
      submitLabel="Confirm"
      submitting={loading}
      submitDisabled={!formData.program_id}
    >
      <div className="grid gap-4">

          <div className="space-y-4">
            <Alert tone="info" icon={RefreshCcw}>
              {correctionReason ?? "The university has requested that this applicant's program be updated. Please select the new program and provide a brief reason."}
            </Alert>

            {errors.api && <Alert tone="danger">{errors.api}</Alert>}

            <Combobox label="Program" options={programs.map((p) => ({
                value: p.id,
                label: p.name,
              }))} value={formData.program_id ? String(formData.program_id) : null} onChange={(v) => updateFormData("program_id", v ?? "")} error={errors.program_id || undefined} />

          </div>
      </div>
    </FormModal>
  );
}
