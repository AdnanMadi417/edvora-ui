import React, { useRef, useState } from "react";
import { Upload, FileCheck, FileText, X, Loader2, AlertCircle } from "lucide-react";
import { ALLOWED_FILE_TYPES } from "services/uploadService";
import { useToast } from "components/context/ToastContext";
import Button from "components/ui/buttons/Button";
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

function RequiredBadge({ required }: { required: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        required ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {required ? "Required" : "Optional"}
    </span>
  );
}

/**
 * Same controlled-prop interface as the old StatusFileUpload — a drop-in
 * swap — styled after DocumentUploadList's DocRow (required badge, allowed
 * file types hint, same row chrome) so every single-file popup in the app
 * looks the same as the multi-document list.
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
  const [fileError, setFileError] = useState("");

  const fail = (msg: string) => {
    setFileError(msg);
    showToast(msg, "error");
    onError?.(msg);
  };

  const processFile = (selected: File) => {
    const isAllowed =
      ALLOWED_FILE_TYPES.mimeTypes.includes(selected.type) ||
      ALLOWED_FILE_TYPES.extensions.some((ext) => selected.name.toLowerCase().endsWith(ext));

    if (!isAllowed) {
      fail(`Invalid file type "${selected.name}". Only ${ALLOWED_FILE_TYPES.label} files are allowed.`);
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      fail(`"${selected.name}" is too large. Maximum file size is 10MB.`);
      return;
    }

    setFileError("");
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

  if (file && uploading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-bold text-slate-900">{label}</p>
            {required && <RequiredBadge required />}
          </div>
          {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blue-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 text-[10px] font-medium text-blue-600">{progress}%</span>
          </div>
        </div>
      </div>
    );
  }

  if (file && !uploading) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border bg-white p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100">
          <FileCheck className="h-5 w-5 text-green-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-bold text-slate-900">{label}</p>
            {required && <RequiredBadge required />}
          </div>
          {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
          <p className="mt-1 truncate text-xs font-medium text-slate-700">{file.name}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="mt-0.5 shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...dropHandlers}
      className={`block space-y-2 rounded-2xl border p-4 transition md:flex md:items-center md:gap-3 md:space-y-0 ${
        fileError
          ? "border-red-300 bg-red-50"
          : isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-dashed border-slate-300 bg-white"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            fileError ? "bg-red-100" : "bg-slate-100"
          }`}
        >
          <FileText className={`h-5 w-5 ${fileError ? "text-red-400" : "text-slate-400"}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-bold text-slate-900">{label}</p>
            {required && <RequiredBadge required />}
          </div>

          {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}

          {fileError ? (
            <div className="mt-0.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0 text-red-500" />
              <p className="text-xs text-red-600">{fileError}</p>
            </div>
          ) : (
            <p className="mt-0.5 text-xs text-slate-300">{ALLOWED_FILE_TYPES.label}</p>
          )}
        </div>
      </div>

      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        icon={<Upload className="h-4 w-4" />}
        text="Upload"
        bgColor="bg-slate-100"
        textColor="text-slate-700"
        borderColor="border-slate-100"
        hoverTextColor="hover:text-slate-700"
        hoverBorderColor="hover:border-slate-200"
        className="w-full font-semibold hover:bg-slate-200 md:w-auto md:shrink-0"
      />

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
