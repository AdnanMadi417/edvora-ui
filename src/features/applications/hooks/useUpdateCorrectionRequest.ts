"use client";

import { useState } from "react";
import api from "lib/useApi";

// PATCH /applications/{id}/correction-request edits the current correction
// in place (no status change). reason_text is appended to the existing
// reason, and the two fields must always be sent together.
export function useUpdateCorrectionRequest() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateCorrectionRequest = async (
    applicationId: string,
    { reasonText, requiredDocumentTypeIds }: { reasonText: string; requiredDocumentTypeIds: string[] }
  ) => {
    setIsUpdating(true);
    try {
      const res = await api.patch(`/applications/${applicationId}/correction-request`, {
        reason_text: reasonText.trim(),
        required_document_type_ids: requiredDocumentTypeIds,
      });
      return res.data;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateCorrectionRequest, isUpdating };
}
