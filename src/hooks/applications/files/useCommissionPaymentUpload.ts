import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";
import {
  getPresignedUploads,
  uploadFilesToSpaces,
} from "services/uploadService";

export const useCommissionPaymentUpload = () => {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const uploadCommissionPayment = async (
    file: File,
    applicationId: string
  ) => {
    try {
      setIsUploading(true);

      showToast("Uploading commission payment proof...", "info");

      const presigned = await getPresignedUploads([file], "documents");

      const results = await uploadFilesToSpaces([file], presigned);

      const uploaded = results?.[0];

      if (!uploaded?.file_key || !uploaded?.public_url) {
        throw new Error("Commission payment proof upload failed");
      }

      await api.post(
        `/applications/${applicationId}/commission-payment-document`,
        {
          file_key: uploaded.file_key,
          file_url: uploaded.public_url,
        }
      );

      showToast(
        "Commission payment proof uploaded successfully.",
        "success"
      );

      return uploaded;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Commission payment upload failed";

      showToast(message, "error");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadCommissionPayment,
    isUploading,
  };
};