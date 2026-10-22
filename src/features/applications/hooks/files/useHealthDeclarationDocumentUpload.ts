"use client";

import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

interface UseHealthDeclarationDocumentUploadReturn {
  uploadHealthDeclarationDocument: (file: File, applicationId: string) => Promise<void>;
  isUploading: boolean;
}

export const useHealthDeclarationDocumentUpload = (): UseHealthDeclarationDocumentUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const uploadHealthDeclarationDocument = async (file: File, applicationId: string) => {
    if (!file) return;
    try {
      setIsUploading(true);
      showToast("Uploading health declaration form...", "info");

      const [presigned] = await getPresignedUploads([file], "documents");
      const [uploaded] = await uploadFilesToSpaces([file], [presigned]);
      if (!uploaded?.file_key || !uploaded?.public_url) throw new Error("Health declaration form upload failed");

      await api.post(`/applications/${applicationId}/health-declaration-document`, {
        file_key: uploaded.file_key,
        file_url: uploaded.public_url,
      });

      showToast("Health declaration form submitted successfully.", "success");
    } catch (err: any) {
      const msg = parseApiError(err, "Upload failed");
      showToast(msg, "error");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadHealthDeclarationDocument, isUploading };
};
