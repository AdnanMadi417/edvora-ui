import React, { useRef } from "react";
import { Upload, FileCheck, X, Loader2 } from "lucide-react";
import { ALLOWED_FILE_TYPES } from "services/uploadService";
import { useToast } from "components/context/ToastContext";
import { useFileDrop } from "./useFileDrop";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface CompactFileUploadProps {
  label: string;
  description?: string;
  id: string;
  file: File | null;
  onFileChange: (file: File) => void;
  onRemove: () => void;
  onError?: (msg: string) => void;
  disabled?: boolean;
  required?: boolean;
  uploading?: boolean;
  progress?: number;
}

/**
 * Same controlled-prop interface as StatusFileUpload — a drop-in swap — but
 * rendered as one compact row instead of a full dashed dropzone. Meant for
 * forms that bundle several uploads at once (e.g. the four offer-letter
 * forms on the visa-payment screen), where stacking several full dropzones
 * makes the popup unreasonably tall.
 */
export default function CompactFileUpload({
  label,
  description,
  id,
  file,
  onFileChange,
  onRemove,
  onError,
  disabled = false,
  required = false,
  uploading = false,
  progress = 0,
}: CompactFileUploadProps) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const fail = (msg: string) => {
    showToast(msg, "error");
    onError?.(msg);
  };

  const processFile = (selected: File) => {
    const isAllowed =
      ALLOWED_FILE_TYPES.mimeTypes.includes(selected.type) ||
      ALLOWED_FILE_TYPES.extensions.some((ext) =>
        selected.name.toLowerCase().endsWith(ext)
      );

    if (!isAllowed) {
      fail(`Invalid file type "${selected.name}". Only ${ALLOWED_FILE_TYPES.label} files are allowed.`);
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      fail(`"${selected.name}" is too large. Maximum file size is 10MB.`);
      return;
    }

    onError?.("");
    onFileChange(selected);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (selected) processFile(selected);
  };

  const { isDragging, dropHandlers } = useFileDrop({
    onFiles: (files) => processFile(files[0]),
    disabled,
  });

  return (
    <div
      {...dropHandlers}
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          file ? "bg-green-100" : "bg-slate-100"
        }`}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        ) : file ? (
          <FileCheck className="h-4 w-4 text-green-600" />
        ) : (
          <Upload className="h-4 w-4 text-slate-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
        {file ? (
          uploading ? (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="shrink-0 text-xs font-medium text-blue-600">{progress}%</span>
            </div>
          ) : (
            <p className="truncate text-xs text-slate-500">{file.name}</p>
          )
        ) : (
          <p className="truncate text-xs text-slate-400">{description ?? `${ALLOWED_FILE_TYPES.label} – Max 10MB`}</p>
        )}
      </div>

      {file && !uploading ? (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      ) : !file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Upload
        </button>
      ) : null}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ALLOWED_FILE_TYPES.extensions.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />
    </div>
  );
}
