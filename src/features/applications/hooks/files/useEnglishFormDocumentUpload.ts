"use client";

import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

interface UseEnglishFormDocumentUploadReturn {
  uploadEnglishFormDocument: (file: File, applicationId: string) => Promise<void>;
  isUploading: boolean;
}

export const useEnglishFormDocumentUpload = (): UseEnglishFormDocumentUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const uploadEnglishFormDocument = async (file: File, applicationId: string) => {
    if (!file) return;
    try {
      setIsUploading(true);
      showToast("Uploading English form...", "info");

      const [presigned] = await getPresignedUploads([file], "documents");
      const [uploaded] = await uploadFilesToSpaces([file], [presigned]);
      if (!uploaded?.file_key || !uploaded?.public_url) throw new Error("English form upload failed");

      await api.post(`/applications/${applicationId}/english-form-document`, {
        file_key: uploaded.file_key,
        file_url: uploaded.public_url,
      });

      showToast("English form submitted successfully.", "success");
    } catch (err: any) {
      const msg = parseApiError(err, "Upload failed");
      showToast(msg, "error");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadEnglishFormDocument, isUploading };
};
