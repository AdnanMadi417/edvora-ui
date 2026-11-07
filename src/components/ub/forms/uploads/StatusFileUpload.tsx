"use client";

import DocumentUpload, { type DocumentUploadProps } from "./DocumentUpload";
import { useToast } from "components/ub/feedback/notifications/ToastContext";

/** Existing template-upload contract with shared validation and upload states. */
export default function StatusFileUpload(
  props: Omit<
    DocumentUploadProps,
    "existingUrl" | "onExistingRemove" | "accept"
  > & { id: string }
) {
  const { showToast } = useToast();
  return (
    <DocumentUpload
      {...props}
      onError={(message) => {
        if (message) showToast(message, "error");
        props.onError?.(message);
      }}
    />
  );
}
