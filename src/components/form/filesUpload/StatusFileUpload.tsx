import React from "react";
import { Trash2 } from "lucide-react";
import { ALLOWED_FILE_TYPES } from "services/uploadService";
import { useToast } from "components/context/ToastContext";

interface StatusFileUploadProps {
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

export default function StatusFileUpload({
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
}: StatusFileUploadProps) {
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const isAllowed =
      ALLOWED_FILE_TYPES.mimeTypes.includes(selected.type) ||
      ALLOWED_FILE_TYPES.extensions.some((ext) =>
        selected.name.toLowerCase().endsWith(ext)
      );

    if (!isAllowed) {
      const msg = `Invalid file type "${selected.name}". Only ${ALLOWED_FILE_TYPES.label} files are allowed.`;
      showToast(msg, "error");
      onError?.(msg);
      e.target.value = "";
      return;
    }

    onError?.("");
    onFileChange(selected);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {description && (
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        )}
      </div>

      <label
        htmlFor={id}
        className="group relative flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white px-6 py-10 text-center transition-all duration-200 hover:border-blue-500 hover:bg-blue-50/40"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-blue-100 text-blue-600 transition">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 16V8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
            />
          </svg>
        </div>

        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="mt-2 text-xs text-gray-600">{ALLOWED_FILE_TYPES.label} – Max 5MB</p>

        <input
          id={id}
          type="file"
          accept={ALLOWED_FILE_TYPES.extensions.join(",")}
          className="hidden"
          disabled={disabled}
          onChange={handleChange}
        />
      </label>

      {file && (
        <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="truncate text-sm text-slate-500">{file.name}</span>
            {!uploading && (
              <button
                type="button"
                onClick={onRemove}
                className="flex items-center justify-center gap-2 rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-700 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            )}
            {uploading && (
              <span className="text-xs font-medium text-blue-600">{progress}%</span>
            )}
          </div>

          {uploading && (
            <div className="mt-3 h-1.5 w-full rounded-md bg-slate-100">
              <div
                className="h-full rounded-md bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
