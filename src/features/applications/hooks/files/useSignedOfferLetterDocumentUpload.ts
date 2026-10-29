"use client";

import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/ub/feedback/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

interface UseSignedOfferLetterDocumentUploadReturn {
  uploadSignedOfferLetterDocument: (file: File, applicationId: string) => Promise<void>;
  isUploading: boolean;
}

export const useSignedOfferLetterDocumentUpload = (): UseSignedOfferLetterDocumentUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const uploadSignedOfferLetterDocument = async (file: File, applicationId: string) => {
    if (!file) return;
    try {
      setIsUploading(true);
      showToast("Uploading signed offer letter...", "info");

      const [presigned] = await getPresignedUploads([file], "documents");
      const [uploaded] = await uploadFilesToSpaces([file], [presigned]);
      if (!uploaded?.file_key || !uploaded?.public_url) throw new Error("Signed offer letter upload failed");

      await api.post(`/applications/${applicationId}/signed-offer-letter-document`, {
        file_key: uploaded.file_key,
        file_url: uploaded.public_url,
      });

      showToast("Signed offer letter submitted successfully.", "success");
    } catch (err: any) {
      const msg = parseApiError(err, "Upload failed");
      showToast(msg, "error");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadSignedOfferLetterDocument, isUploading };
};
