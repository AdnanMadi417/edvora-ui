import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

interface VisaPaymentPayload {
  methodId: string;
  amount: number | "";
  currency: string;
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

      const presigned = await getPresignedUploads([file], "documents");
      const results = await uploadFilesToSpaces([file], presigned);
      const uploaded = results?.[0];

      if (!uploaded?.file_key || !uploaded?.public_url) {
        throw new Error("File upload failed");
      }

      await api.post(`/applications/${applicationId}/visa-payments`, {
        university_payment_method_id: payload.methodId,
        amount: payload.amount,
        currency: payload.currency,
        payment_reference: `ref-${Date.now()}`,
        file_key: uploaded.file_key,
        file_url: uploaded.public_url,
      });

      showToast("Visa payment submitted successfully!", "success");
      return uploaded;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to submit visa payment";
      showToast(message, "error");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadVisaPayment, isUploading };
};
