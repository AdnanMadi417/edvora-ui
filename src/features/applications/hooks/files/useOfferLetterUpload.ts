"use client";

import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

interface OfferLetterExtras {
  visaInvoiceFile?: File | null;
  applicationFormTemplateFile?: File | null;
  applicationForm2TemplateFile?: File | null;
  healthDeclarationFormRequired?: boolean;
  signedOfferLetterRequired?: boolean;
  englishFormTemplateFile?: File | null;
}

interface UseOfferLetterUploadReturn {
  uploadOfferLetter: (file: File, applicationId: string, extras?: OfferLetterExtras) => Promise<void>;
  isUploading: boolean;
}

export const useOfferLetterUpload = (): UseOfferLetterUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const uploadOfferLetter = async (
    file: File,
    applicationId: string,
    extras: OfferLetterExtras = {}
  ) => {
    if (!file) return;
    try {
      setIsUploading(true);
      showToast("Uploading offer letter...", "info");

      const filesToUpload: File[] = [file];
      if (extras.visaInvoiceFile) filesToUpload.push(extras.visaInvoiceFile);
      if (extras.applicationFormTemplateFile) filesToUpload.push(extras.applicationFormTemplateFile);
      if (extras.applicationForm2TemplateFile) filesToUpload.push(extras.applicationForm2TemplateFile);
      if (extras.englishFormTemplateFile) filesToUpload.push(extras.englishFormTemplateFile);

      const presigned = await getPresignedUploads(filesToUpload, "documents");
      const results = await uploadFilesToSpaces(filesToUpload, presigned);

      const uploaded = results?.[0];
      if (!uploaded?.file_key || !uploaded?.public_url) throw new Error("Offer letter upload failed");

      let resultIndex = 1;
      const payload: Record<string, string | boolean> = {
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

      if (extras.applicationForm2TemplateFile) {
        const r = results[resultIndex++];
        if (r?.file_key && r?.public_url) {
          payload.application_form_2_template_file_key = r.file_key;
          payload.application_form_2_template_file_url = r.public_url;
        }
      }

      if (extras.healthDeclarationFormRequired !== undefined) {
        payload.health_declaration_form_required = extras.healthDeclarationFormRequired;
      }

      if (extras.signedOfferLetterRequired !== undefined) {
        payload.signed_offer_letter_required = extras.signedOfferLetterRequired;
      }

      if (extras.englishFormTemplateFile) {
        const r = results[resultIndex++];
        if (r?.file_key && r?.public_url) {
          payload.english_form_template_file_key = r.file_key;
          payload.english_form_template_file_url = r.public_url;
        }
      }

      await api.post(`/applications/${applicationId}/offer-letter`, payload);

      showToast("Offer letter uploaded successfully.", "success");
    } catch (err: any) {
      const msg = parseApiError(err, "Upload failed");
      showToast(msg, "error");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadOfferLetter, isUploading };
};
