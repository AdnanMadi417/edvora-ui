"use client";

import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

interface ApplicationFormDocumentExtras {
  visaInvoiceFile?: File | null;
  applicationFormTemplateFile?: File | null;
}

interface UseApplicationFormDocumentUploadReturn {
  uploadApplicationFormDocument: (
    file: File,
    applicationId: string,
    extras?: ApplicationFormDocumentExtras
  ) => Promise<void>;
  isUploading: boolean;
}

export const useApplicationFormDocumentUpload = (): UseApplicationFormDocumentUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const uploadApplicationFormDocument = async (
    file: File,
    applicationId: string,
    extras: ApplicationFormDocumentExtras = {}
  ) => {
    if (!file) return;
    try {
      setIsUploading(true);
      showToast("Uploading application form...", "info");

      const filesToUpload: File[] = [file];
      if (extras.visaInvoiceFile) filesToUpload.push(extras.visaInvoiceFile);
      if (extras.applicationFormTemplateFile) filesToUpload.push(extras.applicationFormTemplateFile);

      const presigned = await getPresignedUploads(filesToUpload, "documents");
      const results = await uploadFilesToSpaces(filesToUpload, presigned);

      const uploaded = results?.[0];
      if (!uploaded?.file_key || !uploaded?.public_url) throw new Error("Application form upload failed");

      let resultIndex = 1;
      const payload: Record<string, string> = {
        file_key: uploaded.file_key,
        file_url: uploaded.public_url,
      };

      if (extras.visaInvoiceFile) {
        const r = results[resultIndex++];
        if (r?.file_key && r?.public_url) {
          payload.visa_invoice_file_key = r.file_key;
          payload.visa_invoice_file_url = r.public_url;
        }
      }

      if (extras.applicationFormTemplateFile) {
        const r = results[resultIndex++];
        if (r?.file_key && r?.public_url) {
          payload.application_form_template_file_key = r.file_key;
          payload.application_form_template_file_url = r.public_url;
        }
      }

      await api.post(`/applications/${applicationId}/application-form-document`, payload);

      showToast("Application form submitted successfully.", "success");
    } catch (err: any) {
      const msg = parseApiError(err, "Upload failed");
      showToast(msg, "error");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadApplicationFormDocument, isUploading };
};
