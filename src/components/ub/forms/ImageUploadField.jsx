import { Upload, Trash2, FileCheck, AlertCircle, Camera } from "lucide-react";
import React, { useState, useEffect, useMemo } from 'react';
import { ALLOWED_FILE_TYPES } from "services/uploadService";
import { useFileDrop } from "components/ub/forms/useFileDrop";
import {
  buttonBase,
  buttonDangerOutline,
  buttonSizes,
  dropzone,
  dropzoneActive,
  fieldError,
  fieldLabel,
  iconTints,
  progressFill,
  progressTrack,
  tagBase,
  tagTones,
} from "components/ub/recipes";

// Round logo/avatar dropzone: same dashed 1.5px treatment as the dropzone
// recipe, shaped as a 96px circle (avatars are round, brief §2.4).
const avatarZone =
  "flex h-24 w-24 items-center justify-center rounded-ub-full border-ub-strong border-dashed transition-[background-color,border-color] duration-ub-fast ease-ub-standard";
const removeButton = `${buttonBase} ${buttonDangerOutline} ${buttonSizes.sm}`;
const fileInputFocus =
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ub-border-focus";

const IMAGE_ONLY_TYPES = {
  mimeTypes: ["image/png", "image/jpeg", "image/jpg"],
  extensions: ".png,.jpg,.jpeg",
  label: "PNG or JPG",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Dual-mode file upload field.
 *
 * Document-management mode (default):
 *   Requires: documentTypeId, formData, uploadHandler, removeHandler
 *
 * Simple mode (single file / logo):
 *   Requires: simpleFile, onSimpleFileChange, onSimpleRemove
 *   Optional: existingUrl, onExistingRemove  ← for the edit/update flow
 *   Optional: imageOnly  ← restricts to PNG/JPG only (no PDF)
 */
const ImageUploadField = ({
  label,
  field,
  // --- document-management mode ---
  documentTypeId = null,
  formData = null,
  uploadHandler = null,
  removeHandler = null,
  // --- simple mode ---
  simpleFile = null,
  onSimpleFileChange = null,
  onSimpleRemove = null,
  simpleUploading = false,
  simpleProgress = 0,
  // --- simple mode: existing image (update flow) ---
  existingUrl = null,
  onExistingRemove = null,
  // --- shared ---
  errors,
  required = false,
  multiple = false,
  imageOnly = false,
  accept = null,
}) => {
  const resolvedAccept = accept ?? (imageOnly ? IMAGE_ONLY_TYPES.extensions : ALLOWED_FILE_TYPES.extensions.join(","));
  const resolvedMimeTypes = imageOnly ? IMAGE_ONLY_TYPES.mimeTypes : ALLOWED_FILE_TYPES.mimeTypes;
  const resolvedLabel = imageOnly ? IMAGE_ONLY_TYPES.label : ALLOWED_FILE_TYPES.label;

  const [fileError, setFileError] = useState("");
  const [imgError, setImgError] = useState(false);

  // Fix memory leak: create object URL once, revoke on cleanup
  const previewUrl = useMemo(() => {
    if (!simpleFile) return null;
    return URL.createObjectURL(simpleFile);
  }, [simpleFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    setImgError(false);
  }, [existingUrl]);

  const isSimpleMode = !documentTypeId;
  const uploadNoun = label ? label.toLowerCase() : "logo";

  // ── document-management mode ──────────────────────────────────────────────
  const documents = !isSimpleMode ? (formData?.[field] || []) : [];
  const docFile = !isSimpleMode
    ? documents.find((d) => d.document_type_id === documentTypeId)
    : null;

  const processDocFile = async (selected) => {
    if (!uploadHandler || !selected) return;
    if (!resolvedMimeTypes.includes(selected.type)) {
      setFileError(`This file type isn't supported. Upload a ${resolvedLabel} file.`);
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError("This file is over 10 MB. Upload a file under 10 MB.");
      return;
    }
    setFileError("");
    await uploadHandler({ target: { files: [selected] } }, documentTypeId);
  };

  const handleDocUpload = async (e) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    await processDocFile(selected);
  };

  const handleDocRemove = async () => {
    if (!removeHandler) return;
    await removeHandler(documentTypeId);
  };

  // ── simple mode ───────────────────────────────────────────────────────────
  const processSimpleFile = (selected) => {
    if (!selected) return;
    if (!resolvedMimeTypes.includes(selected.type)) {
      setFileError(`This file type isn't supported. Upload a ${resolvedLabel} file.`);
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError("This file is over 10 MB. Upload a file under 10 MB.");
      return;
    }
    setFileError("");
    onSimpleFileChange?.(selected);
  };

  const handleSimpleUpload = (e) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    processSimpleFile(selected);
  };

  const simpleDrop = useFileDrop({ onFiles: (files) => processSimpleFile(files[0]) });
  const docDrop = useFileDrop({ onFiles: (files) => processDocFile(files[0]) });

  const handleSimpleRemove = () => {
    setFileError("");
    onSimpleRemove?.();
  };

  const handleExistingRemove = () => {
    setFileError("");
    onExistingRemove?.();
  };

  // ── derived display state ─────────────────────────────────────────────────
  const showDocFile    = !isSimpleMode && docFile;
  const showSimpleFile = isSimpleMode && simpleFile;
  const showExisting   = isSimpleMode && !simpleFile && existingUrl;
  const showDropzone   = !(showDocFile || showSimpleFile || showExisting);

  return (
    <div className="mb-2" data-field={field}>
      {label && (
        <label className={`${fieldLabel} mb-3`}>
          {label} {required && <span className="text-ub-tone-danger-text" aria-hidden="true">*</span>}
        </label>
      )}

      {/* ── simple mode dropzone ── */}
      {showDropzone && isSimpleMode && (
        <div className="flex flex-col items-center gap-2">
          <label className={`group relative cursor-pointer rounded-ub-full ${fileInputFocus}`} {...simpleDrop.dropHandlers}>
            <div
              className={`${avatarZone} ${
                simpleDrop.isDragging
                  ? "border-ub-border-focus bg-ub-selected"
                  : "border-ub-border-control bg-ub-surface-subtle group-hover:border-ub-border-focus group-hover:bg-ub-selected"
              }`}
            >
              <div className="flex flex-col items-center gap-1 text-ub-text-tertiary transition-colors group-hover:text-ub-text-link">
                <Camera className="h-6 w-6" aria-hidden="true" />
                <span className="text-ub-label-sm">Upload</span>
              </div>
            </div>
            <input
              type="file"
              multiple={multiple}
              accept={resolvedAccept}
              className="sr-only"
              aria-label={`Upload ${uploadNoun}`}
              onChange={handleSimpleUpload}
            />
          </label>
          <p className="text-ub-body-sm text-ub-text-secondary">Click to upload {uploadNoun}</p>
          <p className="text-ub-caption text-ub-text-tertiary">{resolvedLabel} · up to 10 MB</p>
        </div>
      )}

      {/* ── document-management mode dropzone ── */}
      {showDropzone && !isSimpleMode && (
        <label
          {...docDrop.dropHandlers}
          className={`flex cursor-pointer flex-col items-center justify-center p-6 text-center ${dropzone} ${fileInputFocus} ${
            docDrop.isDragging ? dropzoneActive : ""
          }`}
        >
          <Upload className="mb-3 h-8 w-8 text-ub-icon-interactive" aria-hidden="true" />
          <p className="text-ub-body-sm text-ub-text-secondary">
            Drag and drop or <span className="font-medium text-ub-text-link underline underline-offset-2">browse</span>
          </p>
          <p className="mt-1 text-ub-caption text-ub-text-tertiary">{resolvedLabel} · up to 10 MB</p>
          <input
            type="file"
            multiple={multiple}
            accept={resolvedAccept}
            className="sr-only"
            onChange={handleDocUpload}
          />
        </label>
      )}

      {/* ── existing URL preview (update flow) ── */}
      {showExisting && (
        <div className="flex flex-col items-center gap-2">
          <div className="group relative">
            {imgError ? (
              <label
                className={`${avatarZone} cursor-pointer flex-col border-ub-border-focus bg-ub-selected text-ub-text-link ${fileInputFocus}`}
              >
                <Camera className="h-5 w-5" aria-hidden="true" />
                <span className="mt-0.5 text-ub-label-sm">Upload</span>
                <input type="file" accept={resolvedAccept} className="sr-only" onChange={handleSimpleUpload} />
              </label>
            ) : (
              <>
                <img
                  src={existingUrl}
                  alt="Current logo"
                  className="h-24 w-24 rounded-ub-full border border-ub-border object-cover"
                  onError={() => setImgError(true)}
                />
                <label
                  className={`absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-ub-full bg-ub-scrim text-white opacity-0 transition-opacity duration-ub-fast group-hover:opacity-100 has-[:focus-visible]:opacity-100 motion-reduce:transition-none ${fileInputFocus}`}
                >
                  <Camera className="h-5 w-5" aria-hidden="true" />
                  <span className="mt-0.5 text-ub-label-sm">Replace</span>
                  <input type="file" accept={resolvedAccept} className="sr-only" onChange={handleSimpleUpload} />
                </label>
              </>
            )}
          </div>
          <button type="button" onClick={handleExistingRemove} className={removeButton}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remove
          </button>
        </div>
      )}

      {/* ── newly selected file preview (simple mode) ── */}
      {showSimpleFile && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div
              className={`flex h-24 w-24 overflow-hidden rounded-ub-full border-2 ${
                simpleUploading ? "border-ub-action-primary" : "border-ub-tone-success-border"
              }`}
            >
              {simpleFile.type?.startsWith("image/") ? (
                <img src={previewUrl} alt="Logo preview" className="h-full w-full object-cover" />
              ) : (
                <div className={`flex h-full w-full items-center justify-center ${simpleUploading ? iconTints.blue : iconTints.green}`}>
                  <FileCheck className="h-6 w-6" aria-hidden="true" />
                </div>
              )}
            </div>
            {simpleUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-ub-full bg-ub-scrim">
                <span className="ub-tabular text-ub-label-sm text-white">{simpleProgress}%</span>
              </div>
            )}
          </div>

          <p className="max-w-[160px] truncate text-center text-ub-label-sm text-ub-text-primary">{simpleFile.name}</p>
          {simpleUploading ? (
            <p className="ub-tabular text-ub-caption text-ub-text-tertiary">Uploading… {simpleProgress}%</p>
          ) : (
            <span className={`${tagBase} ${tagTones.success}`}>
              Uploaded · <span className="ub-tabular">{(simpleFile.size / 1024).toFixed(1)} KB</span>
            </span>
          )}

          {simpleUploading && (
            <div
              className={`${progressTrack} w-24`}
              role="progressbar"
              aria-label={`Uploading ${simpleFile.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={simpleProgress}
            >
              <div className={progressFill} style={{ width: `${simpleProgress}%` }} />
            </div>
          )}

          <button type="button" onClick={handleSimpleRemove} disabled={simpleUploading} className={removeButton}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remove
          </button>
        </div>
      )}

      {/* ── document-management mode: file preview ── */}
      {showDocFile && (
        <div
          className={`mt-4 rounded-ub-lg border p-4 ${
            docFile.file_key ? "border-ub-border bg-ub-surface" : "border-ub-tone-danger-border bg-ub-tone-danger-bg"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-ub-md ${
                  docFile.file_key ? iconTints.green : iconTints.red
                }`}
              >
                {docFile.file_key ? <FileCheck className="h-5 w-5" aria-hidden="true" /> : <AlertCircle className="h-5 w-5" aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <p className={`truncate text-ub-label-md ${docFile.file_key ? "text-ub-text-primary" : "text-ub-tone-danger-text"}`}>
                  {docFile.name}
                </p>
                <p className={`text-ub-caption ${docFile.file_key ? "text-ub-text-tertiary" : "text-ub-tone-danger-text"}`}>
                  {docFile.file_key ? docFile.size : docFile.uploading ? `Uploading… ${docFile.size ?? ""}` : "Needs replacing"}
                </p>
              </div>
            </div>
            {docFile.file_key && (
              <button type="button" onClick={handleDocRemove} className={`${removeButton} shrink-0`}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            )}
          </div>
          {docFile.uploading && (
            <div
              className={`mt-4 ${progressTrack}`}
              role="progressbar"
              aria-label={`Uploading ${docFile.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={docFile.progress || 0}
            >
              <div className={progressFill} style={{ width: `${docFile.progress || 0}%` }} />
            </div>
          )}
        </div>
      )}

      {fileError && (
        <div className={`mt-2 flex items-start gap-2 rounded-ub-md border p-3 ${tagTones.danger}`} role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="text-ub-body-sm">{fileError}</p>
        </div>
      )}

      {errors?.[field] && <p className={fieldError}>{errors[field]}</p>}
    </div>
  );
};

export default ImageUploadField;
