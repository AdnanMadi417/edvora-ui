"use client";

import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

interface UseEVisaUploadReturn {
  uploadEVisa: (file: File, applicationId: string) => Promise<void>;
  isUploading: boolean;
}

export const useEVisaUpload = (): UseEVisaUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const uploadEVisa = async (file: File, applicationId: string) => {
    if (!file) return;

    try {
      setIsUploading(true);
      showToast("Uploading e-visa document...", "info");

      const presigned = await getPresignedUploads([file], "documents");
      const results = await uploadFilesToSpaces([file], presigned);
      const uploaded = results?.[0];

      if (!uploaded?.file_key || !uploaded?.public_url) {
        throw new Error("E-visa document upload failed");
      }

      await api.post(`/applications/${applicationId}/e-visa-document`, {
        file_key: uploaded.file_key,
        file_url: uploaded.public_url,
      });

      showToast("E-visa document uploaded successfully.", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Upload failed";
      showToast(msg, "error");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadEVisa, isUploading };
};
