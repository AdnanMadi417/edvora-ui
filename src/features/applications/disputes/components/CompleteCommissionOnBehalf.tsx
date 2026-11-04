"use client";

import Textarea from "components/ub/forms/text/Textarea";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

import { useCompleteCommission } from "../hooks";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

interface CompleteCommissionOnBehalfProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onSuccess?: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  application_not_found: "This application could not be found — it may have been removed.",
  application_inactive: "This application is no longer active.",
  invalid_status_for_confirm:
    "This application isn't at Commission Paid or Dispute Response Received — it may already be complete.",
  commission_not_paid: "This commission hasn't been marked as paid yet.",
};

export default function CompleteCommissionOnBehalf({
  isOpen,
  onClose,
  applicationId,
  onSuccess,
}: CompleteCommissionOnBehalfProps) {
  const { completeOnBehalf, loading } = useCompleteCommission();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ reason: "" });
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ reason: "" });
      setFormErrors({});
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };


  const handleSubmit = async () => {
    if (!formData.reason.trim()) {
      setFormErrors({ reason: "A reason is required" });
      return;
    }

    try {
      await completeOnBehalf(applicationId, { reason: formData.reason.trim() });
      showToast("Application marked complete.", "success");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      const msg = (code && ERROR_MESSAGES[code]) || parseApiError(err, "Failed to complete commission.");
      showToast(msg, "error");
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={CheckCircle}
      title="Complete on Advisor's Behalf"
      description="Marks the application complete when the advisor hasn't confirmed receipt. The payout stays as recorded."
      onSubmit={handleSubmit}
      submitLabel="Mark Complete"
      submitTone="positive"
      submitting={loading}
      submitDisabled={!formData.reason.trim()}
    >
      <div className="grid gap-4">

          <div className="space-y-5">
            <Textarea label="Reason" placeholder="e.g. Advisor confirmed receipt by email on 20 Oct..." value={String(formData.reason ?? "")} onChange={(v) => updateFormData("reason", v)} error={formErrors.reason || undefined} />
          </div>
      </div>
    </FormModal>
  );
}
