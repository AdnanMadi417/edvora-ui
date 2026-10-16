"use client";

import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface UseStatusUpdateReturn {
  updateStatus: (params: {
    applicationId: string;
    statusId: string;
    reason?: string;
    notes?: string;
    requiredDocumentTypeIds?: string[];
    arrivalFormTemplateFileKey?: string;
    arrivalFormTemplateFileUrl?: string;
    payInDetails?: {
      paymentDate: string;
      amount: string;
      currency: string;
      paymentReference: string;
    };
  }) => Promise<void>;
  isUpdating: boolean;
}

export const useStatusUpdate = (): UseStatusUpdateReturn => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useToast();

  const updateStatus = async ({
    applicationId,
    statusId,
    reason = "",
    notes = "",
    requiredDocumentTypeIds = [],
    arrivalFormTemplateFileKey,
    arrivalFormTemplateFileUrl,
    payInDetails,
  }: {
    applicationId: string;
    statusId: string;
    reason?: string;
    notes?: string;
    requiredDocumentTypeIds?: string[];
    arrivalFormTemplateFileKey?: string;
    arrivalFormTemplateFileUrl?: string;
    payInDetails?: {
      paymentDate: string;
      amount: string;
      currency: string;
      paymentReference: string;
    };
  }) => {
    try {
      setIsUpdating(true);
      await api.post(`/applications/${applicationId}/status`, {
        status_id: statusId,
        reason_text: reason.trim(),
        notes: notes.trim(),
        required_document_type_ids: requiredDocumentTypeIds,
        ...(arrivalFormTemplateFileKey && { arrival_form_template_file_key: arrivalFormTemplateFileKey }),
        ...(arrivalFormTemplateFileUrl && { arrival_form_template_file_url: arrivalFormTemplateFileUrl }),
        ...(payInDetails && {
          payment_date: payInDetails.paymentDate,
          amount: payInDetails.amount,
          currency: payInDetails.currency,
          payment_reference: payInDetails.paymentReference,
        }),
      });
      showToast("Status updated successfully.", "success");
    } catch (err: any) {
      const msg = parseApiError(err, "Failed to update status");
      showToast(msg, "error");
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateStatus, isUpdating };
};
