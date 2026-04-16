"use client";

import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

interface UseEmgsEvaluationUploadReturn {
  uploadEmgsEvaluation: (file: File, applicationId: string) => Promise<void>;
  isUploading: boolean;
}

export const useEmgsEvaluationUpload = (): UseEmgsEvaluationUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const uploadEmgsEvaluation = async (file: File, applicationId: string) => {
    if (!file) return;

    try {
      setIsUploading(true);
      showToast("Uploading EMGS evaluation document...", "info");

      const presigned = await getPresignedUploads([file], "documents");

      const results = await uploadFilesToSpaces([file], presigned);
      const uploaded = results?.[0];

      if (!uploaded?.file_key || !uploaded?.public_url) {
        throw new Error("EMGS evaluation document upload failed");
      }

      await api.post(`/applications/${applicationId}/emgs-evaluation-document`, {
        file_key: uploaded.file_key,
        file_url: uploaded.public_url,
      });

      showToast("EMGS evaluation document uploaded successfully.", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Upload failed";
      showToast(msg, "error");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadEmgsEvaluation, isUploading };
};
