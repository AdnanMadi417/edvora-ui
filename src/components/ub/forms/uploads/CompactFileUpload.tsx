"use client";

import UploadField, { type UploadFieldProps } from "./UploadField";
import { ALLOWED_FILE_TYPES } from "services/uploadService";

/** Existing popup contract, rendered by the same uploader as documents and images. */
export default function CompactFileUpload(
  props: Omit<UploadFieldProps, "accept" | "imageOnly">
) {
  return (
    <UploadField
      {...props}
      accept={[
        ...ALLOWED_FILE_TYPES.extensions,
        ...ALLOWED_FILE_TYPES.mimeTypes,
      ]}
    />
  );
}
