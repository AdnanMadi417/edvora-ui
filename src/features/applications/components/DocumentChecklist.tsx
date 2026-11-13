"use client";

import { FileText } from "lucide-react";
import SectionCard, { type SectionCardState } from "components/ub/data/cards/SectionCard";
import TextButton from "components/ub/core/buttons/TextButton";
import CountBadge from "components/ub/data/badges/CountBadge";
import type { DocumentItem } from "features/applications/model/applicationView";
import DocumentRow, { type DocumentRowProps } from "./DocumentRow";

export interface DocumentChecklistProps extends Pick<DocumentRowProps, "onDownload" | "onReplace" | "readOnly"> {
  documents: DocumentItem[];
  title?: string;
  description?: string;
  /** Show at most this many rows (needing attention first) with a "View all" action. */
  limit?: number;
  onViewAll?: () => void;
  /** Id of the document currently downloading. */
  downloadingId?: string | null;
  /** Upload progress per document id while uploads are in flight. */
  uploadProgress?: Record<string, number>;
  state?: SectionCardState;
  onRetry?: () => void;
  className?: string;
}

const ORDER: Record<DocumentItem["state"], number> = { "needs-replacing": 0, missing: 1, uploading: 2, uploaded: 3, verified: 4 };

/** Pure: documents needing attention first, then by upload date (newest first). */
export function sortDocuments(docs: DocumentItem[]): DocumentItem[] {
  return [...docs].sort((a, b) => ORDER[a.state] - ORDER[b.state] || (b.uploadedAt ?? "").localeCompare(a.uploadedAt ?? ""));
}

/** Document checklist (brief §6): rows with Uploading, Uploaded, Verified and Needs replacing states. */
export default function DocumentChecklist({
  documents,
  title = "Documents",
  description,
  limit,
  onViewAll,
  downloadingId = null,
  uploadProgress = {},
  onDownload,
  onReplace,
  readOnly,
  state = "ready",
  onRetry,
  className,
}: DocumentChecklistProps) {
  const sorted = sortDocuments(documents);
  const shown = limit ? sorted.slice(0, limit) : sorted;
  const attention = documents.filter((d) => d.state === "needs-replacing").length;
  const resolved = state === "ready" && documents.length === 0 ? "empty" : state;

  return (
    <SectionCard
      title={
        <span className="inline-flex items-center gap-2">
          {title}{" "}
          {attention > 0 && <CountBadge count={attention} tone="danger" label={(n) => `${n} need replacing`} />}
        </span>
      }
      description={description}
      state={resolved}
      empty={{ icon: FileText, title: "No documents yet", description: "Documents appear here once they're uploaded." }}
      errorMessage="Documents couldn't load."
      onRetry={onRetry}
      action={limit && sorted.length > limit && onViewAll ? <TextButton onClick={onViewAll} trailingIcon="arrow-right">View all {sorted.length}</TextButton> : undefined}
      className={className}
    >
      <ul className="-my-4 divide-y divide-ub-border">
        {shown.map((d) => (
          <DocumentRow key={d.id} document={d} onDownload={onDownload} onReplace={onReplace} readOnly={readOnly} downloading={downloadingId === d.id} uploadProgress={uploadProgress[d.id] ?? null} />
        ))}
      </ul>
    </SectionCard>
  );
}
