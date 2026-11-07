"use client";

// Generic controlled uploader (brief §4.2 file upload). A dashed 1.5px,
// radius-12 dropzone validates type and size with messages that say what
// happened and how to fix it; valid files go to `onSelect`. The caller owns the
// upload and drives each row's state: Uploading, Uploaded, Verified or Needs
// replacing (with a reason).
import React, { useId, useRef, useState } from "react";
import {
  dropzone,
  dropzoneActive,
  focusRing,
  iconButtonSizes,
  iconTints,
  progressFill,
  progressTrack,
  tagBase,
  tagTones,
} from "components/ub/recipes";
import {
  FieldError,
  FieldHelper,
  FieldLabel,
  describedBy,
} from "components/ub/forms/layout/FieldChrome";
import { useFileDrop } from "components/ub/forms/uploads/useFileDrop";
import { Icon, type IconName } from "components/ub/icons/Icon";
import { TextButton } from "components/ub/core/buttons/TextButton";

export type FileUploadStatus =
  | "selected"
  | "uploading"
  | "uploaded"
  | "verified"
  | "needs-replacing";

export type FileUploadItem = {
  id: string;
  name: string;
  /** Bytes, shown as "2.4 MB". */
  size?: number;
  status: FileUploadStatus;
  /** 0–100 while uploading. */
  progress?: number;
  /** Why the file needs replacing, e.g. "The photo page is cut off. Upload a scan that shows all four corners." */
  reason?: string;
  previewUrl?: string;
  downloadOnly?: boolean;
  image?: boolean;
};

export type FileUploadProps = {
  label: React.ReactNode;
  /** Shown under the label, e.g. "The photo page of a passport valid for 6 months or more". */
  description?: React.ReactNode;
  /** Extensions or MIME types, e.g. [".pdf", ".jpg", ".png"]. Empty accepts anything. */
  accept?: string[];
  maxSizeMb?: number;
  multiple?: boolean;
  files: FileUploadItem[];
  /** Called with files that passed validation. Rejected files never reach it. */
  onSelect: (files: File[]) => void;
  onRemove?: (id: string) => void;
  /** Replace a "needs replacing" file. Without it, rows fall back to onSelect. */
  onReplace?: (id: string, file: File) => void;
  /** Called with the validation message (or "" once cleared). */
  onError?: (message: string) => void;
  /** External error, e.g. from the server. Validation errors show here otherwise. */
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
};

// ── validation ───────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  ".pdf": "PDF",
  "application/pdf": "PDF",
  ".jpg": "JPG",
  ".jpeg": "JPG",
  "image/jpeg": "JPG",
  ".png": "PNG",
  "image/png": "PNG",
  ".webp": "WEBP",
  "image/webp": "WEBP",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
  ".doc": "DOC",
  ".docx": "DOCX",
  ".heic": "HEIC",
  "image/heic": "HEIC",
  "image/*": "image",
};

/** "PDF, JPG or PNG" from an accept list. */
export function acceptLabel(accept: string[]): string {
  const labels = Array.from(
    new Set(
      accept.map(
        (a) =>
          TYPE_LABELS[a.toLowerCase()] ?? a.replace(/^\./, "").toUpperCase()
      )
    )
  );
  if (labels.length <= 1) return labels[0] ?? "file";
  return `${labels.slice(0, -1).join(", ")} or ${labels[labels.length - 1]}`;
}

const isAccepted = (file: File, accept: string[]) => {
  if (!accept.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.some((a) => {
    const rule = a.toLowerCase();
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
};

/** Returns a brief-style message for the first problem, or "" when the file is fine. */
export function validateFile(
  file: File,
  { accept = [], maxSizeMb = 10 }: { accept?: string[]; maxSizeMb?: number }
): string {
  const types = acceptLabel(accept);
  // "a PDF" when one type is allowed, "a file" otherwise.
  const noun = accept.length && !types.includes(" or ") ? types : "file";
  if (!isAccepted(file, accept))
    return `This file type isn't supported. Upload a ${types}.`;
  if (file.size > maxSizeMb * 1024 * 1024)
    return `This file is over ${maxSizeMb} MB. Upload a ${noun} under ${maxSizeMb} MB.`;
  return "";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── rows ────────────────────────────────────────────────────────────────

const STATUS: Record<
  FileUploadStatus,
  { icon: IconName; tint: string; label: string; tag?: string }
> = {
  selected: {
    icon: "file-text",
    tint: iconTints.slate,
    label: "Selected",
    tag: tagTones.neutral,
  },
  uploading: { icon: "upload", tint: iconTints.blue, label: "Uploading" },
  uploaded: {
    icon: "check-circle",
    tint: iconTints.slate,
    label: "Uploaded",
    tag: tagTones.neutral,
  },
  verified: {
    icon: "shield-check",
    tint: iconTints.green,
    label: "Verified",
    tag: tagTones.success,
  },
  "needs-replacing": {
    icon: "alert-triangle",
    tint: iconTints.red,
    label: "Needs replacing",
    tag: tagTones.danger,
  },
};

// Local recipes: the solid file row and its 40px icon tile.
const fileRow =
  "flex min-w-0 max-w-full items-start gap-3 rounded-ub-lg border bg-ub-surface p-3 md:p-4";
const fileTile = "grid h-10 w-10 shrink-0 place-items-center rounded-ub-md";
const rowIconButton = `${iconButtonSizes.sm} grid shrink-0 place-items-center rounded-ub-full text-ub-icon-default ${focusRing} transition-colors duration-ub-fast ease-ub-standard hover:bg-ub-surface-subtle hover:text-ub-text-primary motion-reduce:transition-none`;

function FileRow({
  item,
  disabled,
  onRemove,
  onPickReplacement,
}: {
  item: FileUploadItem;
  disabled: boolean;
  onRemove?: (id: string) => void;
  onPickReplacement: (id: string) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  React.useEffect(() => setImageFailed(false), [item.previewUrl]);
  const s = STATUS[item.status];
  const pct = Math.max(0, Math.min(100, Math.round(item.progress ?? 0)));
  const reasonId = `${item.id}-reason`;
  return (
    <li
      className={`${fileRow} ${
        item.status === "needs-replacing"
          ? "border-ub-tone-danger-border"
          : "border-ub-border"
      }`}
    >
      <span className={`${fileTile} ${s.tint}`}>
        {item.image && item.previewUrl && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URLs and existing upload previews
          <img
            src={item.previewUrl}
            alt={`Preview of ${item.name}`}
            onError={() => setImageFailed(true)}
            className="h-10 w-10 rounded-ub-md object-cover"
          />
        ) : (
          <Icon
            name={item.status === "uploading" ? "file-text" : s.icon}
            size={20}
          />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p
            className="min-w-0 max-w-full truncate text-ub-label-md text-ub-text-primary"
            title={item.name}
          >
            {item.name}
          </p>
          {s.tag && (
            <span className={`${tagBase} ${s.tag}`}>
              <Icon name={s.icon} size={16} />
              {s.label}
            </span>
          )}
        </div>
        {item.status === "uploading" ? (
          <div className="mt-2 flex items-center gap-3">
            <div
              className={progressTrack}
              role="progressbar"
              aria-label={`Uploading ${item.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            >
              <div
                className={`${progressFill} motion-reduce:transition-none`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="ub-tabular shrink-0 text-ub-label-sm text-ub-text-secondary">
              {pct}%
            </span>
          </div>
        ) : (
          item.size !== undefined && (
            <p className="ub-tabular mt-0.5 text-ub-caption text-ub-text-tertiary">
              {formatBytes(item.size)}
            </p>
          )
        )}
        {item.status === "needs-replacing" && item.reason && (
          <p
            id={reasonId}
            className="mt-1 text-ub-body-sm text-ub-tone-danger-text"
          >
            {item.reason}
          </p>
        )}
        {item.previewUrl && item.status !== "uploading" && (
          <a
            href={item.previewUrl}
            download={item.downloadOnly ? item.name : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-2 inline-flex min-h-8 items-center text-ub-label-sm text-ub-text-link underline ${focusRing}`}
          >
            {item.downloadOnly ? "Download file" : "Preview file"}
            <span className="sr-only">: {item.name} (opens in a new tab)</span>
          </a>
        )}
        {item.status !== "uploading" && item.status !== "verified" && (
          <TextButton
            size="sm"
            leadingIcon="upload"
            className="mt-2"
            disabled={disabled}
            aria-describedby={item.reason ? reasonId : undefined}
            onClick={() => onPickReplacement(item.id)}
          >
            Replace file
          </TextButton>
        )}
      </div>
      {onRemove && item.status !== "verified" && (
        <button
          type="button"
          aria-label={
            item.status === "uploading"
              ? `Cancel upload of ${item.name}`
              : `Remove ${item.name}`
          }
          disabled={disabled}
          onClick={() => onRemove(item.id)}
          className={rowIconButton}
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </li>
  );
}

// ── component ───────────────────────────────────────────────────────────

export function FileUpload({
  label,
  description,
  accept = [],
  maxSizeMb = 10,
  multiple = false,
  files,
  onSelect,
  onRemove,
  onReplace,
  onError,
  error,
  required = false,
  disabled = false,
  id: idProp,
  className = "",
}: FileUploadProps) {
  const autoId = useId();
  const id = idProp ?? `ub-file-upload-${autoId}`;
  const descId = description ? `${id}-desc` : undefined;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<string | null>(null);
  const [validationError, setValidationError] = useState("");

  const types = acceptLabel(accept);
  const hint = `${accept.length ? types : "Any file"} up to ${maxSizeMb} MB`;
  // A single-file uploader hides its dropzone once a file is in.
  const showZone = multiple || files.length === 0;
  const shownError = error || validationError;

  const handleFiles = (picked: File[]) => {
    if (disabled) return;
    const list =
      multiple && !replaceTarget.current ? picked : picked.slice(0, 1);
    const problems = list.map((f) => validateFile(f, { accept, maxSizeMb }));
    const firstProblem = problems.find(Boolean) ?? "";
    setValidationError(firstProblem);
    onError?.(firstProblem);
    const ok = list.filter((_, i) => !problems[i]);
    if (ok.length) {
      if (replaceTarget.current && onReplace)
        onReplace(replaceTarget.current, ok[0]);
      else onSelect(ok);
    }
    replaceTarget.current = null;
  };

  const { isDragging, dropHandlers } = useFileDrop({
    onFiles: handleFiles,
    disabled,
  });

  const pick = (replaceId: string | null = null) => {
    if (disabled) return;
    replaceTarget.current = replaceId;
    inputRef.current?.click();
  };

  return (
    <div className={`min-w-0 ${className}`} data-field={idProp}>
      <FieldLabel as="span" id={`${id}-label`} required={required}>
        {label}
      </FieldLabel>
      {description && (
        <p
          id={descId}
          className="-mt-0.5 mb-2 text-ub-body-sm text-ub-text-tertiary"
        >
          {description}
        </p>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        accept={accept.join(",") || undefined}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          e.target.value = ""; // allow picking the same file again
          if (picked.length) handleFiles(picked);
          else replaceTarget.current = null;
        }}
      />

      {showZone && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => pick()}
          aria-labelledby={`${id}-label ${id}-cta`}
          aria-describedby={describedBy(descId, hintId, shownError && errorId)}
          {...dropHandlers}
          className={[
            "flex w-full flex-col items-center gap-2 px-4 py-6 text-center",
            dropzone,
            focusRing,
            "motion-reduce:transition-none disabled:cursor-not-allowed disabled:border-ub-border disabled:bg-ub-disabled disabled:hover:bg-ub-disabled",
            isDragging ? dropzoneActive : "",
            shownError && !isDragging
              ? "border-ub-danger-500 bg-ub-tone-danger-bg hover:border-ub-danger-500"
              : "",
          ].join(" ")}
        >
          <span
            className={`${fileTile} rounded-ub-full ${
              disabled ? "bg-ub-surface text-ub-text-disabled" : iconTints.blue
            }`}
          >
            <Icon name="upload" size={20} />
          </span>
          <span
            id={`${id}-cta`}
            className={`text-ub-body-sm ${
              disabled ? "text-ub-text-disabled" : "text-ub-text-primary"
            }`}
          >
            {isDragging ? (
              "Drop to upload"
            ) : (
              <>
                Drag {multiple ? "files" : "a file"} here or{" "}
                <span
                  className={disabled ? "" : "font-medium text-ub-text-link"}
                >
                  choose {multiple ? "files" : "one"}
                </span>
              </>
            )}
          </span>
          <span id={hintId} className="text-ub-caption text-ub-text-tertiary">
            {hint}
          </span>
        </button>
      )}

      <div aria-live="polite">
        <FieldError id={errorId}>{shownError}</FieldError>
      </div>

      {files.length > 0 && (
        <ul
          aria-label="Files"
          aria-live="polite"
          className={`grid gap-2 ${showZone ? "mt-3" : ""}`}
        >
          {files.map((f) => (
            <FileRow
              key={f.id}
              item={f}
              disabled={disabled}
              onRemove={
                onRemove
                  ? (id) => {
                      setValidationError("");
                      onError?.("");
                      onRemove(id);
                    }
                  : undefined
              }
              onPickReplacement={(rid) => pick(rid)}
            />
          ))}
        </ul>
      )}
      {!showZone && <FieldHelper>{hint}</FieldHelper>}
    </div>
  );
}

export default FileUpload;
