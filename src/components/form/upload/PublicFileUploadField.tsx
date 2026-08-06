"use client";

import React, { useRef, useState } from "react";
import { AlertCircle, CloudUpload, FileCheck, Trash2 } from "lucide-react";
import { ALLOWED_FILE_TYPES } from "services/uploadService";
import { uploadPublicPartnerFile } from "services/publicUploadService";
import { parseApiError } from "utils/parseApiError";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface PublicUploadResult {
  file_key: string;
  file_url: string;
}

interface Props {
  label: string;
  fieldId: string;
  required?: boolean;
  result?: PublicUploadResult | null;
  fileName?: string;
  onUpload: (result: PublicUploadResult, fileName: string) => void;
  onRemove: () => void;
  error?: string;
}

export default function PublicFileUploadField({
  label, fieldId, required, result, fileName, onUpload, onRemove, error,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [localFileName, setLocalFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    if (!ALLOWED_FILE_TYPES.mimeTypes.includes(file.type)) {
      setUploadError(`Invalid file type. Only ${ALLOWED_FILE_TYPES.label} are allowed.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File size must not exceed 10MB.");
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
      setUploadError(parseApiError(err, "Upload failed. Please try again."));
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

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleRemove = () => {
    setLocalFileName("");
    setProgress(0);
    setUploadError("");
    onRemove();
  };

  const displayName = fileName || localFileName || label;
  const showError = uploadError || error;

  return (
    <div className="mb-6">
      <label className="mb-1.5 block text-sm font-semibold text-slate-900">
        {label}{required && <span className="ml-0.5 text-red-600">*</span>}
      </label>

      {uploading ? (
        <div className="rounded-xl border border-slate-200 bg-slate-100 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate text-slate-600">{localFileName}</span>
            <span className="ml-2 shrink-0 font-semibold text-blue-600">{progress}%</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : result?.file_key ? (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100">
              <FileCheck className="h-5 w-5 text-green-600" />
            </div>
            <p className="truncate text-sm font-medium text-slate-800">{displayName}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      ) : (
        <label
          htmlFor={fieldId}
          className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border px-4 py-10 text-center transition-all duration-200 ${
            isDragging
              ? "border-blue-400 bg-blue-50"
              : showError
                ? "border-red-300 bg-red-50/40"
                : "border-slate-200 bg-slate-100 hover:border-blue-400 hover:bg-blue-50"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white transition-colors duration-200 group-hover:border-blue-200 group-hover:bg-blue-50">
            <CloudUpload className="h-6 w-6 text-slate-400 transition-colors duration-200 group-hover:text-blue-500" />
          </div>
          <p className="text-sm text-slate-500 transition-colors duration-200 group-hover:text-blue-600">
            Click to upload or drag and drop PDF, JPG, PNG (max 10MB)
          </p>
          <input
            ref={inputRef}
            id={fieldId}
            type="file"
            accept={ALLOWED_FILE_TYPES.extensions.join(",")}
            className="hidden"
            onChange={handleChange}
          />
        </label>
      )}

      {showError && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="text-xs font-medium text-red-700">{showError}</p>
        </div>
      )}
    </div>
  );
}
