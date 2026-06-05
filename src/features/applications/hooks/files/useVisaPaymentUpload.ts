import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

interface VisaPaymentPayload {
  methodId: string | null;
  amount: number | "";
  currency: string | null;
  applicationFormFile?: File | null;
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

      const filesToUpload = [file, ...(payload.applicationFormFile ? [payload.applicationFormFile] : [])];
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

      if (payload.applicationFormFile) {
        const appFormResult = results[1];
        if (appFormResult?.file_key && appFormResult?.public_url) {
          body.application_form_file_key = appFormResult.file_key;
          body.application_form_file_url = appFormResult.public_url;
        }
      }

      await api.post(`/applications/${applicationId}/visa-payments`, body);

      showToast("Visa payment submitted successfully!", "success");
      return uploaded;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to submit visa payment";
      showToast(message, "error");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadVisaPayment, isUploading };
};
