import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/ub/feedback/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

export const useArrivalDateUpload = () => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitArrivalDate = async (
    applicationId: string,
    arrivalDate: string,
    ticketFile: File | null,
    eVisaFile: File | null = null
  ) => {
    try {
      setIsSubmitting(true);
      let ticketData = {};
      let eVisaData = {};

      if (ticketFile) {
        showToast("Uploading travel ticket...", "info");
        const presigned = await getPresignedUploads([ticketFile], "travel_ticket");
        const results = await uploadFilesToSpaces([ticketFile], presigned);
        const uploaded = results?.[0];
        if (!uploaded?.file_key || !uploaded?.public_url) throw new Error("Travel ticket upload failed");
        ticketData = { ticket_file_key: uploaded.file_key, ticket_file_url: uploaded.public_url };
      }

      if (eVisaFile) {
        showToast("Uploading e-visa document...", "info");
        const presigned = await getPresignedUploads([eVisaFile], "documents");
        const results = await uploadFilesToSpaces([eVisaFile], presigned);
        const uploaded = results?.[0];
        if (!uploaded?.file_key || !uploaded?.public_url) throw new Error("E-visa document upload failed");
        eVisaData = { e_visa_file_key: uploaded.file_key, e_visa_file_url: uploaded.public_url };
      }

      await api.patch(`/applications/${applicationId}/arrival-date`, {
        arrival_date: arrivalDate,
        ...ticketData,
        ...eVisaData,
      });

      showToast("Arrival date submitted successfully", "success");
    } catch (err: any) {
      const message = parseApiError(err, "Failed to submit arrival date");
      showToast(message, "error");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitArrivalDate, isSubmitting };
};
