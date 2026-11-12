"use client";

import FormModal from "components/ub/feedback/dialogs/FormModal";
import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

import { useConfirmReceived } from "features/applications/disputes";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

interface ConfirmReceivedProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onSuccess?: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  application_not_found: "This application could not be found — it may have been removed.",
  application_inactive: "This application is no longer active.",
  forbidden_application_access: "You don't have access to this application.",
  forbidden_agency_member: "Only an agency admin can confirm receipt.",
  application_not_ready: "This application has no stage/status yet.",
  invalid_status_for_confirm:
    "This application isn't at Commission Paid — it may already be confirmed, or past this stage.",
  commission_not_paid: "This commission hasn't been marked as paid yet.",
};

export default function ConfirmReceived({ isOpen, onClose, applicationId, onSuccess }: ConfirmReceivedProps) {
  const { confirmReceived, loading } = useConfirmReceived();
  const { showToast } = useToast();


  const handleConfirm = async () => {
    try {
      await confirmReceived(applicationId);
      showToast("Commission receipt confirmed.", "success");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      const msg = (code && ERROR_MESSAGES[code]) || parseApiError(err, "Failed to confirm receipt.");
      showToast(msg, "error");
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={CheckCircle}
      title="Confirm commission received"
      description="This completes the application — make sure the payment has actually arrived first."
      onSubmit={handleConfirm}
      submitLabel="Confirm received"
      submitTone="positive"
      submitting={loading}
    >
      <div className="grid gap-4">

          <div className="text-ub-body-sm text-ub-text-secondary">
            Confirming marks this application as complete. If something's wrong with the amount, raise a
            dispute instead.
          </div>
      </div>
    </FormModal>
  );
}
