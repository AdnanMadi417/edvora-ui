"use client";

import Textarea from "components/ub/forms/text/Textarea";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { useRaiseDispute } from "features/applications/disputes";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

interface DisputeCommissionProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onSuccess?: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  application_not_found: "This application could not be found — it may have been removed.",
  application_inactive: "This application is no longer active.",
  forbidden_application_access: "You don't have access to this application.",
  forbidden_agency_member: "Only an agency admin can raise a dispute.",
  application_not_ready: "This application has no stage/status yet.",
  invalid_status_for_dispute:
    "This application isn't at Commission Paid — it may already be disputed, or past this stage.",
};

export default function DisputeCommission({ isOpen, onClose, applicationId, onSuccess }: DisputeCommissionProps) {
  const { raiseDispute, loading } = useRaiseDispute();
  const { showToast } = useToast();
  const [justification, setJustification] = useState("");
  const [justificationError, setJustificationError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setJustification("");
      setJustificationError("");
    }
  }, [isOpen]);

  const validateJustification = (value: string): string => {
    if (!value.trim()) return "Justification is required";
    return "";
  };

  const isFormValid = !validateJustification(justification);

  const handleSubmit = async () => {
    const err = validateJustification(justification);
    if (err) {
      setJustificationError(err);
      return;
    }

    try {
      await raiseDispute(applicationId, { justification: justification.trim() });
      showToast("Dispute raised.", "success");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      const msg = (code && ERROR_MESSAGES[code]) || parseApiError(err, "Failed to raise dispute.");
      showToast(msg, "error");
    }
  };


  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={AlertCircle}
      title="Dispute commission"
      description="Raise a dispute against this paid commission."
      onSubmit={handleSubmit}
      submitLabel="Submit dispute"
      submitting={loading}
      submitDisabled={!isFormValid}
    >
      <div className="grid gap-4">

          <Textarea
            label="Justification"
            required
            value={justification}
            onChange={(v) => {
              setJustification(v);
              if (justificationError) setJustificationError("");
            }}
            onBlur={() => {
              const err = validateJustification(justification);
              if (err) setJustificationError(err);
            }}
            placeholder="Explain why you are disputing this commission..."
            rows={4}
            error={justificationError || undefined}
          />
      </div>
    </FormModal>
  );
}
