import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

interface VisaPaymentPayload {
  methodId: string | null;
  amount: number | "";
  currency: string | null;
  applicationFormFile?: File | null;
  applicationForm2File?: File | null;
  healthDeclarationFormFile?: File | null;
}

export const useVisaPaymentUpload = () => {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const uploadVisaPayment = async (
    file: File,
    applicationId: string,
    payload: VisaPaymentPayload
  ) => {
    try {
      setIsUploading(true);
      showToast("Uploading payment receipt...", "info");

      const filesToUpload = [
        file,
        ...(payload.applicationFormFile ? [payload.applicationFormFile] : []),
        ...(payload.applicationForm2File ? [payload.applicationForm2File] : []),
        ...(payload.healthDeclarationFormFile ? [payload.healthDeclarationFormFile] : []),
      ];
      const presigned = await getPresignedUploads(filesToUpload, "documents");
      const results = await uploadFilesToSpaces(filesToUpload, presigned);

      const uploaded = results?.[0];
      if (!uploaded?.file_key || !uploaded?.public_url) throw new Error("File upload failed");

      const body: Record<string, any> = {
        payment_reference: `ref-${Date.now()}`,
        file_key: uploaded.file_key,
        file_url: uploaded.public_url,
      };

      if (payload.methodId) body.university_payment_method_id = payload.methodId;
      if (payload.amount !== "") body.amount = payload.amount;
      if (payload.currency) body.currency = payload.currency;

      let resultIndex = 1;

      if (payload.applicationFormFile) {
        const appFormResult = results[resultIndex++];
        if (appFormResult?.file_key && appFormResult?.public_url) {
          body.application_form_file_key = appFormResult.file_key;
          body.application_form_file_url = appFormResult.public_url;
        }
      }

      if (payload.applicationForm2File) {
        const appForm2Result = results[resultIndex++];
        if (appForm2Result?.file_key && appForm2Result?.public_url) {
          body.application_form_2_file_key = appForm2Result.file_key;
          body.application_form_2_file_url = appForm2Result.public_url;
        }
      }

      if (payload.healthDeclarationFormFile) {
        const healthDeclarationResult = results[resultIndex++];
        if (healthDeclarationResult?.file_key && healthDeclarationResult?.public_url) {
          body.health_declaration_form_file_key = healthDeclarationResult.file_key;
          body.health_declaration_form_file_url = healthDeclarationResult.public_url;
        }
      }

      await api.post(`/applications/${applicationId}/visa-payments`, body);

      showToast("Visa payment submitted successfully!", "success");
      return uploaded;
    } catch (error: any) {
      const message = parseApiError(error, "Failed to submit visa payment");
      showToast(message, "error");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadVisaPayment, isUploading };
};
