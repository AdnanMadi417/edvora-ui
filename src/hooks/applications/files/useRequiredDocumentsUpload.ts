import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

export const useRequiredDocumentsUpload = () => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitDocuments = async (
    applicationId: string,
    selectedFiles: { [docId: string]: File | null }
  ) => {
    try {
      setIsSubmitting(true);

      for (const [docId, file] of Object.entries(selectedFiles)) {
        if (!file) continue;

        showToast(`Uploading document...`, "info");

        const presigned = await getPresignedUploads([file], "documents");
        const results = await uploadFilesToSpaces([file], presigned);
        const uploaded = results?.[0];

        if (!uploaded?.file_key || !uploaded?.public_url) {
          throw new Error(`Upload failed for document ${docId}`);
        }

        await api.post(
          `/applications/${applicationId}/requested-documents/bulk`,
          [
            {
              document_type_id: docId,
              file_url: uploaded.public_url,
              file_key: uploaded.file_key,
            },
          ]
        );
      }

      showToast("All documents uploaded successfully.", "success");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to upload documents.";
      showToast(message, "error");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitDocuments, isSubmitting };
};
