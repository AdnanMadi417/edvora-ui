"use client";

import { Download, RefreshCw, Upload } from "lucide-react";
import AppDate from "components/ub/data/formatting/AppDate";
import FileRow from "components/ub/data/display/FileRow";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import type { DocumentItem } from "features/applications/model/applicationView";

export interface DocumentRowProps {
  document: DocumentItem;
  /** Opens or downloads the file. Hidden when there's no file. */
  onDownload?: (doc: DocumentItem) => void;
  /** Replace/upload action; shown when `document.replaceable`, or for Needs replacing and Missing when the API doesn't say. */
  onReplace?: (doc: DocumentItem) => void;
  /** Busy state for an in-flight download of this file. */
  downloading?: boolean;
  /** 0–100 while an upload is in flight; switches the row to Uploading. */
  uploadProgress?: number | null;
  /** Hide upload/replace actions (read-only viewers, e.g. team view). */
  readOnly?: boolean;
}

/** One application document with its state, reason and actions (brief §6). */
export default function DocumentRow({ document: doc, onDownload, onReplace, downloading = false, uploadProgress = null, readOnly = false }: DocumentRowProps) {
  const uploading = typeof uploadProgress === "number";
  // The backend's per-file flag wins; otherwise only files that need replacing (or are missing) offer it.
  const canReplace = !readOnly && !!onReplace && (doc.replaceable ?? (doc.state === "needs-replacing" || doc.state === "missing"));
  return (
    <FileRow
      name={doc.name}
      state={uploading ? "uploading" : doc.state}
      stateLabel={uploading ? undefined : doc.stateLabel}
      progress={uploading ? uploadProgress : undefined}
      reason={doc.reason}
      meta={doc.uploadedAt ? <>Uploaded <AppDate value={doc.uploadedAt} /></> : undefined}
      actions={
        <>
          {canReplace && (
            <Button
              size="sm"
              variant="secondary"
              text={doc.state === "missing" ? `Upload ${doc.name.toLowerCase()}` : "Replace file"}
              icon={doc.state === "missing" ? <Upload className="h-4 w-4" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
              onClick={() => onReplace?.(doc)}
              disabled={uploading}
            />
          )}
          {onDownload && doc.fileKey && (
            <IconButton
              size="sm"
              variant="tertiary"
              icon={<Download className={downloading ? "h-4 w-4 animate-pulse motion-reduce:animate-none" : "h-4 w-4"} aria-hidden="true" />}
              title={`Download ${doc.name}`}
              onClick={() => onDownload(doc)}
              disabled={downloading}
            />
          )}
        </>
      }
    />
  );
}
