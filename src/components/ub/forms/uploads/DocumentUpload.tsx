"use client";

import UploadField, { type UploadFieldProps } from "./UploadField";
import { ALLOWED_FILE_TYPES } from "services/uploadService";

export type DocumentUploadProps = Omit<UploadFieldProps, "imageOnly">;

/** Controlled single document picker; the feature owns upload requests. */
export default function DocumentUpload(props: DocumentUploadProps) {
  return (
    <UploadField
      {...props}
      accept={
        props.accept ?? [
          ...ALLOWED_FILE_TYPES.extensions,
          ...ALLOWED_FILE_TYPES.mimeTypes,
        ]
      }
    />
  );
}
