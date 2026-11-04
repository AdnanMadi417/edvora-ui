"use client";

import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import { parseApiError } from "utils/parseApiError";

interface UseManagerReuploadDocumentReturn {
  reuploadDocument: (file: File, applicationId: string, documentId: string) => Promise<string | undefined>;
  isUploading: boolean;
}

const ERROR_MESSAGES: Record<string, string> = {
  stage_mismatch_for_reupload: "This application has moved past the upload stage — re-upload is no longer available.",
  forbidden_non_manager_document: "This document type cannot be re-uploaded by an account manager.",
  forbidden_application_access: "You are not assigned to this application.",
  document_not_found: "Document not found.",
};

export const useManagerReuploadDocument = (): UseManagerReuploadDocumentReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const reuploadDocument = async (file: File, applicationId: string, documentId: string) => {
    if (!file) return;
    try {
      setIsUploading(true);
      showToast("Uploading document...", "info");
      const presigned = await getPresignedUploads([file], "documents");
      const results = await uploadFilesToSpaces([file], presigned);
      const uploaded = results?.[0];
      if (!uploaded?.file_key || !uploaded?.public_url) throw new Error("Document upload failed");

      const { data } = await api.post(
        `/applications/${applicationId}/documents/${documentId}/manager-reupload`,
        { file_key: uploaded.file_key, file_url: uploaded.public_url }
      );

      showToast("Document re-uploaded successfully.", "success");
      return data?.id as string | undefined;
    } catch (err: any) {
      const code = err.response?.data?.code || err.response?.data?.detail;
      const msg = ERROR_MESSAGES[code] || parseApiError(err, "Re-upload failed");
      showToast(msg, "error");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { reuploadDocument, isUploading };
};
