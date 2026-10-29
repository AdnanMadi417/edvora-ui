"use client";

import React, { useState } from "react";
import { Eye, Download } from "lucide-react";
import { getDocumentDownloadUrl } from "services/documentService";
import { downloadFileAs, buildDocumentFileName } from "utils/documentFileName";
import { useToast } from "components/ub/feedback/ToastContext";
import IconButton from "components/ub/core/IconButton";

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
      <IconButton
        onClick={handleView}
        disabled={disabled}
        title="View Document"
        icon={<Eye className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${loading === "view" ? "animate-pulse" : ""}`} />}
        bgColor="bg-slate-100"
        textColor="text-slate-600"
        borderColor="border-transparent"
        hoverTextColor="hover:text-slate-600"
        hoverBorderColor="hover:border-slate-200"
        className="group cursor-pointer hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400"
      />
      <IconButton
        onClick={handleDownload}
        disabled={disabled}
        title="Download Document"
        icon={<Download className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${loading === "download" ? "animate-pulse" : ""}`} />}
        bgColor="bg-blue-50"
        textColor="text-blue-600"
        borderColor="border-transparent"
        hoverTextColor="hover:text-blue-700"
        hoverBorderColor="hover:border-blue-200"
        className="group cursor-pointer hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-400"
      />
    </>
  );
}
