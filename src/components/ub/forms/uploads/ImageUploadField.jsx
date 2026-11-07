"use client";

import React, { useState } from "react";
import DocumentUpload from "./DocumentUpload";
import ImageUpload from "./ImageUpload";
import FileUpload from "./FileUpload";
import { ALLOWED_FILE_TYPES } from "services/uploadService";
import { parseApiError } from "utils/parseApiError";

/** Compatibility adapter for single images and document-type-based uploads. */
export default function ImageUploadField({
  label,
  field,
  documentTypeId = null,
  formData = null,
  uploadHandler = null,
  removeHandler = null,
  simpleFile = null,
  onSimpleFileChange = null,
  onSimpleRemove = null,
  simpleUploading = false,
  simpleProgress = 0,
  existingUrl = null,
  onExistingRemove = null,
  errors = {},
  required = false,
  multiple = false,
  imageOnly = false,
  accept = null,
  disabled = false,
}) {
  const [busy, setBusy] = useState(false);
  const [requestError, setRequestError] = useState("");
  const accepted = accept
    ? Array.isArray(accept)
      ? accept
      : accept.split(",").map((item) => item.trim())
    : imageOnly
    ? [".png", ".jpg", ".jpeg"]
    : [...ALLOWED_FILE_TYPES.extensions, ...ALLOWED_FILE_TYPES.mimeTypes];
  const name = label || (imageOnly ? "Image" : "File");
  const document = documentTypeId
    ? (formData?.[field] || []).find(
        (item) => item.document_type_id === documentTypeId
      )
    : null;
  const upload = async (files) => {
    if (!uploadHandler || !files[0] || busy || disabled) return;
    setBusy(true);
    setRequestError("");
    try {
      await uploadHandler({ target: { files: [files[0]] } }, documentTypeId);
    } catch (error) {
      setRequestError(parseApiError(error, "Upload failed. Try again."));
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!removeHandler || busy || disabled) return;
    setBusy(true);
    setRequestError("");
    try {
      await removeHandler(documentTypeId);
    } catch (error) {
      setRequestError(
        parseApiError(error, "Couldn't remove the file. Try again.")
      );
    } finally {
      setBusy(false);
    }
  };
  const Picker = imageOnly ? ImageUpload : DocumentUpload;
  return (
    <div data-field={field}>
      {documentTypeId ? (
        <FileUpload
          label={name}
          accept={accepted}
          multiple={multiple}
          files={
            document
              ? [
                  {
                    id: String(documentTypeId),
                    name: document.name || name,
                    size:
                      typeof document.size === "number"
                        ? document.size
                        : document.raw?.size,
                    status: document.uploading
                      ? "uploading"
                      : document.file_key
                      ? "uploaded"
                      : "needs-replacing",
                    progress: document.progress,
                    previewUrl: document.file_url || undefined,
                    image:
                      imageOnly || document.raw?.type?.startsWith("image/"),
                  },
                ]
              : []
          }
          onSelect={upload}
          onReplace={(_id, file) => upload([file])}
          onRemove={removeHandler ? remove : undefined}
          required={required}
          disabled={disabled || busy || !!document?.uploading}
          error={requestError || errors?.[field]}
        />
      ) : (
        <Picker
          label={name}
          file={simpleFile}
          onFileChange={(file) => onSimpleFileChange?.(file)}
          onRemove={() => onSimpleRemove?.()}
          existingUrl={existingUrl}
          onExistingRemove={onExistingRemove}
          accept={accepted}
          required={required}
          disabled={disabled}
          uploading={simpleUploading}
          progress={simpleProgress}
          error={errors?.[field]}
        />
      )}
    </div>
  );
}
