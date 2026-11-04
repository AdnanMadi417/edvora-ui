"use client";

import { useEffect, useState } from "react";
import FileUpload, { type FileUploadItem } from "./FileUpload";

export interface UploadFieldProps {
  label: string;
  description?: string;
  id?: string;
  file: File | null;
  onFileChange: (file: File) => void;
  onRemove: () => void;
  existingUrl?: string | null;
  onExistingRemove?: () => void;
  accept?: string[];
  imageOnly?: boolean;
  maxSizeMb?: number;
  required?: boolean;
  disabled?: boolean;
  uploading?: boolean;
  progress?: number;
  error?: string;
  onError?: (message: string) => void;
}

/** One controlled document or image. Upload requests remain owned by the feature. */
export default function UploadField({
  label,
  description,
  id,
  file,
  onFileChange,
  onRemove,
  existingUrl,
  onExistingRemove,
  accept,
  imageOnly = false,
  maxSizeMb = 10,
  required,
  disabled,
  uploading = false,
  progress,
  error,
  onError,
}: UploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string>();
  useEffect(() => {
    if (!file || typeof URL.createObjectURL !== "function") {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const files: FileUploadItem[] = file
    ? [
        {
          id: "selected",
          name: file.name,
          size: file.size,
          status: uploading ? "uploading" : "selected",
          progress,
          previewUrl,
          downloadOnly:
            !/^(image\/(png|jpeg|webp|gif|bmp|avif)|application\/pdf)$/.test(
              file.type
            ),
          image: file.type.startsWith("image/"),
        },
      ]
    : existingUrl
    ? [
        {
          id: "existing",
          name: `Current ${label.toLowerCase()}`,
          status: "uploaded",
          previewUrl: existingUrl,
          image: imageOnly,
        },
      ]
    : [];
  return (
    <FileUpload
      label={label}
      description={description}
      id={id}
      accept={accept ?? (imageOnly ? [".png", ".jpg", ".jpeg"] : [])}
      maxSizeMb={maxSizeMb}
      files={files}
      onSelect={(picked) => {
        if (picked[0]) onFileChange(picked[0]);
      }}
      onReplace={(_id, picked) => onFileChange(picked)}
      onRemove={(itemId) => {
        if (itemId === "existing") onExistingRemove?.();
        else onRemove();
      }}
      onError={onError}
      error={error}
      required={required}
      disabled={disabled || uploading}
    />
  );
}
