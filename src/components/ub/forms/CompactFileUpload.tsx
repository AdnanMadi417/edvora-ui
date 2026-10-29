import React, { useRef, useState } from "react";
import { Upload, FileCheck, FileText, X, Loader2, AlertCircle } from "lucide-react";
import { ALLOWED_FILE_TYPES } from "services/uploadService";
import { useToast } from "components/ub/feedback/ToastContext";
import {
  buttonBase,
  buttonSizes,
  buttonVariants,
  focusRing,
  iconButtonSizes,
  iconTints,
  progressFill,
  progressTrack,
  tagBase,
  tagTones,
} from "components/ub/recipes";
import { useFileDrop } from "components/ub/forms/useFileDrop";

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
  return <span className={`${tagBase} ${required ? tagTones.warning : tagTones.neutral}`}>{required ? "Required" : "Optional"}</span>;
}

// Local upload recipes (brief §4.2 file upload): a dashed 1.5px radius-12
// dropzone whose colours swap wholesale per state, and a solid file row.
const zoneBase = "rounded-ub-lg border-ub-strong border-dashed transition-[background-color,border-color] duration-ub-fast ease-ub-standard";
const zoneIdle = "border-ub-border-control bg-ub-surface-subtle hover:border-ub-border-focus hover:bg-ub-selected";
const zoneDragging = "border-ub-border-focus bg-ub-selected";
const zoneError = "border-ub-danger-500 bg-ub-tone-danger-bg";
const fileRow = "flex items-start gap-3 rounded-ub-lg border border-ub-border bg-ub-surface p-4";
const fileIcon = "flex h-10 w-10 shrink-0 items-center justify-center rounded-ub-md";

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
      fail(`"${selected.name}" isn't a supported file type. Upload a ${ALLOWED_FILE_TYPES.label} file.`);
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      fail(`"${selected.name}" is over 10 MB. Upload a file under 10 MB.`);
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

  const header = (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <p className="truncate text-ub-label-md text-ub-text-primary">{label}</p>
        {required && <RequiredBadge required />}
      </div>
      {description && <p className="mt-0.5 text-ub-body-sm text-ub-text-tertiary">{description}</p>}
    </>
  );

  if (file && uploading) {
    const pct = Math.max(0, Math.min(100, Math.round(progress)));
    return (
      <div className={fileRow}>
        <div className={`${fileIcon} ${iconTints.blue}`}>
          <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          {header}
          <p className="mt-1 truncate text-ub-body-sm text-ub-text-secondary">{file.name}</p>
          <div className="mt-2 flex items-center gap-3">
            <div
              className={progressTrack}
              role="progressbar"
              aria-label={`Uploading ${file.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            >
              <div className={progressFill} style={{ width: `${pct}%` }} />
            </div>
            <span className="ub-tabular shrink-0 text-ub-label-sm text-ub-text-secondary">{pct}%</span>
          </div>
        </div>
      </div>
    );
  }

  if (file && !uploading) {
    return (
      <div className={fileRow}>
        <div className={`${fileIcon} ${iconTints.green}`}>
          <FileCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          {header}
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <p className="truncate text-ub-body-sm text-ub-text-secondary">{file.name}</p>
            <span className={`${tagBase} ${tagTones.success}`}>Uploaded</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${file.name}`}
          className={`grid shrink-0 place-items-center rounded-ub-full text-ub-text-tertiary transition-colors duration-ub-fast hover:bg-ub-surface-subtle hover:text-ub-text-primary disabled:cursor-not-allowed disabled:text-ub-text-disabled ${iconButtonSizes.sm} ${focusRing}`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...dropHandlers}
      className={`block space-y-3 p-4 md:flex md:items-center md:gap-3 md:space-y-0 ${zoneBase} ${
        fileError ? zoneError : isDragging ? zoneDragging : zoneIdle
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className={`${fileIcon} ${fileError ? iconTints.red : iconTints.blue}`}>
          {fileError ? <AlertCircle className="h-5 w-5" aria-hidden="true" /> : <FileText className="h-5 w-5" aria-hidden="true" />}
        </div>

        <div className="min-w-0 flex-1">
          {header}

          {fileError ? (
            <p className="mt-0.5 text-ub-body-sm text-ub-tone-danger-text" role="alert">
              <span className="font-medium">Needs replacing: </span>
              {fileError}
            </p>
          ) : (
            <p className="mt-0.5 text-ub-caption text-ub-text-tertiary">{ALLOWED_FILE_TYPES.label} · up to 10 MB</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={`${buttonBase} ${buttonVariants.secondary} ${buttonSizes.sm} w-full md:w-auto md:shrink-0`}
      >
        <Upload className="h-4 w-4" aria-hidden="true" />
        {fileError ? "Replace file" : "Upload"}
      </button>

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
