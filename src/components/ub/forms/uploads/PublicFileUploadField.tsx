"use client";

import React, { useRef, useState } from "react";
import DocumentUpload from "./DocumentUpload";
import { uploadPublicPartnerFile } from "services/publicUploadService";
import { parseApiError } from "utils/parseApiError";

export interface PublicUploadResult {
  file_key: string;
  file_url: string;
}

interface Props {
  label: string;
  fieldId: string;
  field?: string;
  required?: boolean;
  result?: PublicUploadResult | null;
  fileName?: string;
  onUpload: (result: PublicUploadResult, fileName: string) => void;
  onRemove: () => void;
  error?: string;
}

/** Public registration adapter; uses the same picker as authenticated forms. */
export default function PublicFileUploadField({
  label,
  fieldId,
  field,
  required,
  result,
  fileName,
  onUpload,
  onRemove,
  error,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const busy = useRef(false);

  const upload = async (selected: File) => {
    if (busy.current) return;
    busy.current = true;
    setFile(selected);
    setUploading(true);
    setProgress(0);
    setUploadError("");
    try {
      const response = await uploadPublicPartnerFile(selected, setProgress);
      onUpload(response, selected.name);
      setFile(null);
    } catch (err: unknown) {
      setFile(null);
      setUploadError(
        parseApiError(
          err,
          "The upload didn't finish. Check your connection and try again."
        )
      );
    } finally {
      busy.current = false;
      setUploading(false);
    }
  };
  const remove = () => {
    if (busy.current) return;
    setFile(null);
    setUploadError("");
    onRemove();
  };

  return (
    <div data-field={field ?? fieldId}>
      <DocumentUpload
        id={fieldId}
        label={label}
        description={result && fileName ? fileName : undefined}
        file={file}
        existingUrl={result?.file_url}
        onFileChange={upload}
        onRemove={remove}
        onExistingRemove={remove}
        required={required}
        uploading={uploading}
        disabled={uploading}
        progress={progress}
        error={uploadError || error}
        onError={() => setUploadError("")}
      />
    </div>
  );
}
