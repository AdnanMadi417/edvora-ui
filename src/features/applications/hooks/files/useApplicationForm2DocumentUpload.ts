"use client";

import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/ub/feedback/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

interface UseApplicationForm2DocumentUploadReturn {
  uploadApplicationForm2Document: (file: File, applicationId: string) => Promise<void>;
  isUploading: boolean;
}

export const useApplicationForm2DocumentUpload = (): UseApplicationForm2DocumentUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const uploadApplicationForm2Document = async (file: File, applicationId: string) => {
    if (!file) return;
    try {
      setIsUploading(true);
      showToast("Uploading application form 2...", "info");

      const [presigned] = await getPresignedUploads([file], "documents");
      const [uploaded] = await uploadFilesToSpaces([file], [presigned]);
      if (!uploaded?.file_key || !uploaded?.public_url) throw new Error("Application form 2 upload failed");

      await api.post(`/applications/${applicationId}/application-form-2-document`, {
        file_key: uploaded.file_key,
        file_url: uploaded.public_url,
      });

      showToast("Application form 2 submitted successfully.", "success");
    } catch (err: any) {
      const msg = parseApiError(err, "Upload failed");
      showToast(msg, "error");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadApplicationForm2Document, isUploading };
};
