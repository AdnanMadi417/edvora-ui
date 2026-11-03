"use client";

import Textarea from "components/ub/forms/Textarea";
import FormModal from "components/ub/feedback/FormModal";
import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

import { useResolveNoIssue } from "../hooks";
import { useToast } from "components/ub/feedback/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

interface ResolveNoIssueProps {
  isOpen: boolean;
  onClose: () => void;
  disputeId: string;
  onSuccess?: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  dispute_not_found: "This dispute could not be found — it may have already been removed.",
  dispute_already_resolved: "This dispute has already been resolved.",
};

export default function ResolveNoIssue({ isOpen, onClose, disputeId, onSuccess }: ResolveNoIssueProps) {
  const { resolveNoIssue, loading } = useResolveNoIssue();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ report: "" });
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ report: "" });
      setFormErrors({});
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };


  const handleSubmit = async () => {
    if (!formData.report.trim()) {
      setFormErrors({ report: "A report is required" });
      return;
    }

    try {
      await resolveNoIssue(disputeId, { report: formData.report.trim() });
      showToast("Dispute resolved — no correction needed.", "success");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      const msg = (code && ERROR_MESSAGES[code]) || parseApiError(err, "Failed to resolve dispute.");
      showToast(msg, "error");
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={CheckCircle}
      title="Resolve Dispute: No Issue"
      description="The payout and commission stay exactly as they are — explain why no correction is needed."
      onSubmit={handleSubmit}
      submitLabel="Resolve"
      submitTone="positive"
      submitting={loading}
      submitDisabled={!formData.report.trim()}
    >
      <div className="grid gap-4">

          <div className="space-y-5">
            <Textarea label="Report" placeholder="Explain why this dispute doesn't require a correction..." value={String(formData.report ?? "")} onChange={(v) => updateFormData("report", v)} error={formErrors.report || undefined} />
          </div>
      </div>
    </FormModal>
  );
}
