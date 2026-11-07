"use client";

import { useState } from "react";
import FileUpload from "./FileUpload";
import Button from "components/ub/core/buttons/Button";
import { getDocumentDownloadUrl } from "services/documentService";
import { ALLOWED_FILE_TYPES } from "services/uploadService";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { ExternalLink } from "lucide-react";

interface Props {
  label: string;
  id: string;
  document: { file_key: string; file_url: string; uploading: boolean; progress: number; error: string };
  onUpload: (file: File) => void;
  locked?: boolean;
  imageOnly?: boolean;
}

/** Private stored document: replace through the shared picker; preview through a signed URL. */
export default function StoredDocumentUpload({ label, id, document: doc, onUpload, locked = false, imageOnly = false }: Props) {
  const [viewing, setViewing] = useState(false);
  const { showToast } = useToast();
  const preview = async () => {
    if (!doc.file_key || viewing) return;
    setViewing(true);
    try {
      const url = await getDocumentDownloadUrl(doc.file_key);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      showToast("Failed to load document.", "error");
    } finally { setViewing(false); }
  };
  return <div className="mb-4 min-w-0" data-field={id}>
    <FileUpload id={id} label={label} accept={imageOnly ? [".png", ".jpg", ".jpeg", ".webp"] : [...ALLOWED_FILE_TYPES.extensions, ...ALLOWED_FILE_TYPES.mimeTypes]} files={doc.file_key || doc.uploading ? [{ id, name: label, status: doc.uploading ? "uploading" : "uploaded", progress: doc.progress, image: imageOnly, previewUrl: imageOnly ? doc.file_url || undefined : undefined }] : []} onSelect={(files) => { if (files[0]) onUpload(files[0]); }} onReplace={(_id, file) => onUpload(file)} disabled={locked || doc.uploading} error={doc.error} />
    {doc.file_key && !doc.uploading && <Button text="View document" size="sm" variant="tertiary" icon={<ExternalLink className="h-4 w-4" />} loading={viewing} onClick={preview} />}
    {locked && <p className="mt-1 text-ub-caption text-ub-text-tertiary">Contact support to change this document.</p>}
  </div>;
}
