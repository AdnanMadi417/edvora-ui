"use client";

import DocumentUpload, { type DocumentUploadProps } from "./DocumentUpload";

/** Compatibility name for document uploads used in existing payment dialogs. */
export default function CompactFileUpload(props: Omit<DocumentUploadProps, "accept">) {
  return <DocumentUpload {...props} />;
}
