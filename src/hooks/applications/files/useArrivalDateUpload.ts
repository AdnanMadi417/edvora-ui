import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

export const useArrivalDateUpload = () => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitArrivalDate = async (
    applicationId: string,
    arrivalDate: string,
    ticketFile: File | null
  ) => {
    try {
      setIsSubmitting(true);

      let ticketData = {};

      if (ticketFile) {
        showToast("Uploading travel ticket...", "info");

        const presigned = await getPresignedUploads([ticketFile], "travel_ticket");
        const results = await uploadFilesToSpaces([ticketFile], presigned);
        const uploaded = results?.[0];

        if (!uploaded?.file_key || !uploaded?.public_url) {
          throw new Error("Travel ticket upload failed");
        }

        ticketData = {
          ticket_file_key: uploaded.file_key,
          ticket_file_url: uploaded.public_url,
        };
      }

      await api.patch(`/applications/${applicationId}/arrival-date`, {
        arrival_date: arrivalDate,
        ...ticketData,
      });

      showToast("Arrival date submitted successfully", "success");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit arrival date";
      showToast(message, "error");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitArrivalDate, isSubmitting };
};
