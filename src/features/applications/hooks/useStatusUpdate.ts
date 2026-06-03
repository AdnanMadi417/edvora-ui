"use client";

import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";

interface UseStatusUpdateReturn {
  updateStatus: (params: {
    applicationId: string;
    statusId: string;
    reason?: string;
    notes?: string;
    requiredDocumentTypeIds?: string[];
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
  }: {
    applicationId: string;
    statusId: string;
    reason?: string;
    notes?: string;
    requiredDocumentTypeIds?: string[];
  }) => {
    try {
      setIsUpdating(true);
      await api.post(`/applications/${applicationId}/status`, {
        status_id: statusId,
        reason_text: reason.trim(),
        notes: notes.trim(),
        required_document_type_ids: requiredDocumentTypeIds,
      });
      showToast("Status updated successfully.", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update status";
      showToast(msg, "error");
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateStatus, isUpdating };
};
