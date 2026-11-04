import React from "react";
import { FileCheck, Loader2, Trash2, Upload } from "lucide-react";
import { ALLOWED_FILE_TYPES } from "services/uploadService";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useFileDrop } from "components/ub/forms/uploads/useFileDrop";
import {
  buttonDangerOutline,
  buttonBase,
  buttonSizes,
  dropzone,
  dropzoneActive,
  emptyIconCircle,
  fieldHelper,
  fieldLabel,
  focusRing,
  iconTints,
  progressFill,
  progressTrack,
  tagBase,
  tagTones,
} from "components/ub/recipes";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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
      fail(`"${selected.name}" isn't a supported file type. Upload a ${ALLOWED_FILE_TYPES.label} file.`);
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      fail(`"${selected.name}" is over 10 MB. Upload a file under 10 MB.`);
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

  const pct = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="space-y-2">
      <div>
        <label htmlFor={id} className={`${fieldLabel} mb-0`}>
          {label} {required && <span className="text-ub-tone-danger-text" aria-hidden="true">*</span>}
        </label>
        {description && <p className={`${fieldHelper} mt-0.5`}>{description}</p>}
      </div>

      <label
        htmlFor={id}
        {...dropHandlers}
        className={`group relative flex cursor-pointer flex-col items-center justify-center px-6 py-10 text-center has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ub-border-focus ${dropzone} ${
          isDragging ? dropzoneActive : ""
        } ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        <div className={`mb-4 ${emptyIconCircle}`}>
          <Upload className="h-7 w-7" aria-hidden="true" />
        </div>

        <p className="text-ub-label-md text-ub-text-primary">
          Drag and drop or <span className="text-ub-text-link underline underline-offset-2">browse</span>
        </p>
        <p className="mt-1 text-ub-caption text-ub-text-tertiary">{ALLOWED_FILE_TYPES.label} · up to 10 MB</p>

        <input
          id={id}
          type="file"
          accept={ALLOWED_FILE_TYPES.extensions.join(",")}
          className="sr-only"
          disabled={disabled}
          onChange={handleChange}
        />
      </label>

      {file && (
        <div className="rounded-ub-lg border border-ub-border bg-ub-surface p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-ub-md ${uploading ? iconTints.blue : iconTints.green}`}>
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <FileCheck className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-ub-body-sm text-ub-text-primary">{file.name}</p>
              {!uploading && <span className={`${tagBase} ${tagTones.success} mt-1`}>Uploaded</span>}
            </div>
            {!uploading && (
              <button
                type="button"
                onClick={onRemove}
                className={`${buttonBase} ${buttonDangerOutline} ${buttonSizes.sm} ${focusRing}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            )}
            {uploading && (
              <span className="ub-tabular shrink-0 text-ub-label-sm text-ub-text-secondary">{pct}%</span>
            )}
          </div>

          {uploading && (
            <div
              className={`mt-3 ${progressTrack}`}
              role="progressbar"
              aria-label={`Uploading ${file.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            >
              <div className={progressFill} style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
