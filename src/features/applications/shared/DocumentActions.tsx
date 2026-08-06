"use client";

import React, { useState } from "react";
import { Eye, Download } from "lucide-react";
import { getDocumentDownloadUrl } from "services/documentService";
import { downloadFileAs, buildDocumentFileName } from "utils/documentFileName";
import { useToast } from "components/context/ToastContext";

interface DocumentActionsProps {
  /** Storage file_key for the document. Buttons are disabled when missing. */
  fileKey?: string | null;
  /** Document label used for the downloaded filename (first 3 words are kept). */
  label: string;
  /** Person the document belongs to, used for the downloaded filename (first 2 words are kept). */
  personName?: string | null;
}

/**
 * Standard View + Download action pair for a document row. Reused across
 * every application document list (general docs, payment/arrival docs,
 * offer letter, EMGS eval, visa doc, commission docs) so the download
 * filename convention and signed-URL handling stay in one place.
 */
export default function DocumentActions({ fileKey, label, personName }: DocumentActionsProps) {
  const [loading, setLoading] = useState<"view" | "download" | null>(null);
  const { showToast } = useToast();

  const handleView = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!fileKey || loading) return;
    setLoading("view");
    try {
      const url = await getDocumentDownloadUrl(fileKey);
      window.open(url, "_blank");
    } catch {
      showToast("Failed to load document.", "error");
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!fileKey || loading) return;
    setLoading("download");
    try {
      const url = await getDocumentDownloadUrl(fileKey);
      const fileName = buildDocumentFileName(personName || "", label, fileKey);
      await downloadFileAs(url, fileName);
    } catch {
      showToast("Failed to download document.", "error");
    } finally {
      setLoading(null);
    }
  };

  const disabled = !fileKey || !!loading;

  return (
    <>
      <button
        type="button"
        onClick={handleView}
        disabled={disabled}
        className="group rounded-md cursor-pointer border border-transparent bg-slate-100 p-2 text-slate-600 transition-all duration-200 hover:border-slate-200 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
        title="View Document"
        aria-label="View Document"
      >
        <Eye className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${loading === "view" ? "animate-pulse" : ""}`} />
      </button>
      <button
        type="button"
        onClick={handleDownload}
        disabled={disabled}
        className="group rounded-md cursor-pointer border border-transparent bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
        title="Download Document"
        aria-label="Download Document"
      >
        <Download className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${loading === "download" ? "animate-pulse" : ""}`} />
      </button>
    </>
  );
}
