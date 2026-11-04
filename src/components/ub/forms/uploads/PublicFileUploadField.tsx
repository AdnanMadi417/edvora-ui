"use client";

import React, { useRef, useState } from "react";
import { AlertCircle, CloudUpload, FileCheck, Trash2 } from "lucide-react";
import { ALLOWED_FILE_TYPES } from "services/uploadService";
import { uploadPublicPartnerFile } from "services/publicUploadService";
import { parseApiError } from "utils/parseApiError";
import { useFileDrop } from "components/ub/forms/uploads/useFileDrop";
import {
  buttonBase,
  buttonDangerOutline,
  buttonSizes,
  emptyIconCircle,
  fieldLabel,
  iconTints,
  progressFill,
  progressTrack,
  tagBase,
  tagTones,
} from "components/ub/recipes";

// Dashed 1.5px radius-12 dropzone (brief §4.2); colours swap wholesale per
// state so the error border never fights the idle one.
const zoneBase =
  "rounded-ub-lg border-ub-strong border-dashed transition-[background-color,border-color] duration-ub-fast ease-ub-standard " +
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ub-border-focus";
const zoneIdle = "border-ub-border-control bg-ub-surface-subtle hover:border-ub-border-focus hover:bg-ub-selected";
const zoneDragging = "border-ub-border-focus bg-ub-selected";
const zoneError = "border-ub-danger-500 bg-ub-tone-danger-bg";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface PublicUploadResult {
  file_key: string;
  file_url: string;
}

interface Props {
  label: string;
  fieldId: string;
  /** Error/scroll-target key, when it differs from `fieldId`. Defaults to `fieldId`. */
  field?: string;
  required?: boolean;
  result?: PublicUploadResult | null;
  fileName?: string;
  onUpload: (result: PublicUploadResult, fileName: string) => void;
  onRemove: () => void;
  error?: string;
}

export default function PublicFileUploadField({
  label, fieldId, field, required, result, fileName, onUpload, onRemove, error,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [localFileName, setLocalFileName] = useState("");

  const processFile = async (file: File) => {
    if (!ALLOWED_FILE_TYPES.mimeTypes.includes(file.type)) {
      setUploadError(`This file type isn't supported. Upload a ${ALLOWED_FILE_TYPES.label} file.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("This file is over 10 MB. Upload a file under 10 MB.");
      return;
    }
    setUploadError("");
    setUploading(true);
    setProgress(0);
    setLocalFileName(file.name);
    try {
      const res = await uploadPublicPartnerFile(file, setProgress);
      onUpload(res, file.name);
    } catch (err: unknown) {
      setUploadError(parseApiError(err, "The upload didn't finish. Check your connection and try again."));
    } finally {
      setUploading(false);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    await processFile(file);
  };

  const { isDragging, dropHandlers } = useFileDrop({
    onFiles: (files) => processFile(files[0]),
  });

  const handleRemove = () => {
    setLocalFileName("");
    setProgress(0);
    setUploadError("");
    onRemove();
  };

  const displayName = fileName || localFileName || label;
  const showError = uploadError || error;

  return (
    <div className="mb-6" data-field={field ?? fieldId}>
      <label htmlFor={fieldId} className={fieldLabel}>
        {label}
        {required && <span className="ms-0.5 text-ub-tone-danger-text" aria-hidden="true">*</span>}
      </label>

      {uploading ? (
        <div className="rounded-ub-lg border border-ub-border bg-ub-surface p-4">
          <div className="flex items-center justify-between gap-2 text-ub-body-sm">
            <span className="truncate text-ub-text-primary">{localFileName}</span>
            <span className="ub-tabular shrink-0 text-ub-label-sm text-ub-text-secondary">{progress}%</span>
          </div>
          <div
            className={`mt-3 ${progressTrack}`}
            role="progressbar"
            aria-label={`Uploading ${localFileName}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div className={progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : result?.file_key ? (
        <div className="flex items-center justify-between gap-3 rounded-ub-lg border border-ub-border bg-ub-surface p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-ub-md ${iconTints.green}`}>
              <FileCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-ub-label-md text-ub-text-primary">{displayName}</p>
              <span className={`${tagBase} ${tagTones.success} mt-1`}>Uploaded</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className={`${buttonBase} ${buttonDangerOutline} ${buttonSizes.sm} shrink-0`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
          </button>
        </div>
      ) : (
        <label
          htmlFor={fieldId}
          className={`group flex cursor-pointer flex-col items-center justify-center gap-3 px-4 py-10 text-center ${zoneBase} ${
            isDragging ? zoneDragging : showError ? zoneError : zoneIdle
          }`}
          {...dropHandlers}
        >
          <div className={showError ? `grid h-16 w-16 place-items-center rounded-ub-full ${iconTints.red}` : emptyIconCircle}>
            <CloudUpload className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="text-ub-body-sm text-ub-text-secondary">
            <span className="font-medium text-ub-text-link underline underline-offset-2">Click to upload</span> or drag and
            drop PDF, JPG or PNG (up to 10 MB)
          </p>
          <input
            ref={inputRef}
            id={fieldId}
            type="file"
            accept={ALLOWED_FILE_TYPES.extensions.join(",")}
            className="sr-only"
            onChange={handleChange}
          />
        </label>
      )}

      {showError && (
        <div className={`mt-2 flex items-start gap-2 rounded-ub-md border p-3 ${tagTones.danger}`} role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="text-ub-body-sm">{showError}</p>
        </div>
      )}
    </div>
  );
}
