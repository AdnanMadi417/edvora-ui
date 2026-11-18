// Pure: turns GET /applications/{id}/timeline items into readable events.
// `detail` shapes vary by entry_type (and document_upload by call site), so
// every field is read defensively and an unknown entry_type still renders.

import { ArrowRightLeft, FilePlus2, FileUp, Info, MessageCircle, Plane, Wallet, type LucideIcon } from "lucide-react";
import type { TimelineEvent } from "components/ub/data/display/Timeline";
import type { TagTone } from "components/ub/recipes";
import { formatCurrency } from "lib/format";
import { advisorActorName, unibexsVoice } from "lib/unibexsVoice";
import { stageLabel, statusLabel } from "config/statusLabels";
import type { ApplicationTimelineItem, TimelineDocumentTypeRef } from "features/applications/shared/applicationTypes";

export type Category = "status" | "documents" | "correction" | "visa" | "program" | "message" | "other";

const ENTRY_CATEGORY: Record<string, Category> = {
  status_transition: "status",
  document_upload: "documents",
  correction_request_updated: "correction",
  visa_case_updated: "visa",
  visa_payment_created: "visa",
  arrival_date_updated: "visa",
  program_changed: "program",
  lifecycle_status_changed: "program",
  commission_disputed: "program",
  message_sent: "message",
};

// Acronyms keep their capitals ("EMGS_EVALUATION" → "EMGS Evaluation", not "Emgs Evaluation").
const ACRONYMS = new Set(["EMGS", "MDAC", "IELTS", "TOEFL", "PTE", "MUET", "CV", "ID", "SPM", "STPM", "GPA", "CGPA", "PDF"]);
const humanize = (code: string) =>
  code
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => (ACRONYMS.has(w.toUpperCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");

const asString = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// type/code are both null only when the document type was deleted after this
// log entry was written — fall back to the raw id rather than render null.
const formatDocType = (ref: TimelineDocumentTypeRef): string =>
  ref.type ?? ref.code ?? `Unknown document type (${ref.id})`;
const formatDocTypeList = (refs: TimelineDocumentTypeRef[] | null): string | null =>
  refs && refs.length > 0 ? refs.map(formatDocType).join(", ") : null;

export interface Described {
  category: Category;
  title: string;
  details: { label: string; text: string; items?: string[] }[];
}

// `detail` shapes vary by entry_type (and document_upload by call site), so
// every field is read defensively and an unknown entry_type still renders.
export interface DescribeOptions {
  /** Advisor's view: staff read as Unibexs and backend names use the Unibexs voice. */
  forAdvisor?: boolean;
}

export function describe(item: ApplicationTimelineItem, { forAdvisor = false }: DescribeOptions = {}): Described {
  const v = (text: string | null) => (forAdvisor ? unibexsVoice(text) : text);
  // Status and stage names read the same as everywhere else (config/statusLabels.ts).
  const status = (name: string | null) => v(name && statusLabel(name));
  const stage = (name: string | null) => v(name && stageLabel(name));
  const d = item.detail ?? {};
  const category = ENTRY_CATEGORY[item.entry_type] ?? "other";
  const details: Described["details"] = [];

  switch (item.entry_type) {
    case "status_transition": {
      // Lead with where it went; the old status and an unchanged stage are secondary.
      if (item.from_status && item.to_status) details.push({ label: "From", text: status(item.from_status)! });
      if (item.to_stage && item.to_stage !== item.from_stage) details.push({ label: item.from_stage ? "New stage" : "Stage", text: stage(item.to_stage)! });
      const requiredDocs = formatDocTypeList(item.required_document_types);
      if (requiredDocs) details.push({ label: "Requested documents", text: requiredDocs, items: item.required_document_types!.map(formatDocType) });
      if (item.reason_text) details.push({ label: "Reason", text: item.reason_text });
      if (item.notes) details.push({ label: "Notes", text: item.notes });
      const title = item.to_status ? `Status changed to ${status(item.to_status)}` : "Status changed";
      return { category, title, details };
    }

    case "document_upload": {
      const code = asString(d.document_type_code);
      const uploaded = formatDocTypeList(item.uploaded_document_types);
      // Prefer the document type's own name; the code is only a fallback.
      const label = uploaded ?? (code ? humanize(code) : "a document");
      const requested = formatDocTypeList(item.requested_document_types);
      const uploadedCount = item.uploaded_document_types?.length ?? 0;
      if (uploadedCount > 1) details.push({ label: "Uploaded documents", text: uploaded!, items: item.uploaded_document_types!.map(formatDocType) });
      if (requested && requested !== uploaded) details.push({ label: "Requested documents", text: requested, items: item.requested_document_types!.map(formatDocType) });
      const documentLabel = uploadedCount > 1 ? plural(uploadedCount, "document") : label;
      return { category, title: `${d.reupload === true ? "Re-uploaded" : "Uploaded"} ${documentLabel}`, details };
    }

    case "correction_request_updated": {
      const reason = asString(d.reason_text);
      const requested = formatDocTypeList(item.required_document_types);
      if (reason) details.push({ label: "Reason", text: reason });
      if (requested) details.push({ label: "Requested documents", text: requested, items: item.required_document_types!.map(formatDocType) });
      return { category, title: "Correction request updated", details };
    }

    case "visa_payment_created": {
      const amount = typeof d.amount === "number" ? d.amount : Number(asString(d.amount) ?? NaN);
      const currency = asString(d.currency) ?? undefined;
      // Same money format as the rest of the app: "RM2,450", "USD 3,000".
      const suffix = Number.isFinite(amount) ? `: ${formatCurrency(amount, { currency: currency?.toUpperCase() })}` : "";
      return { category, title: `Visa payment recorded${suffix}`, details };
    }

    case "visa_case_updated":
      return { category, title: "Visa case updated", details };
    case "arrival_date_updated":
      return { category, title: "Arrival date updated", details };
    case "program_changed":
      return { category, title: "Program changed", details };
    case "lifecycle_status_changed":
      return { category, title: "Application status changed", details };
    case "commission_disputed":
      return { category, title: "Commission disputed", details };
    case "message_sent":
      return { category, title: "Message sent", details };

    default:
      return { category, title: humanize(item.entry_type), details };
  }
}


export const CATEGORY_ICON: Record<Category, { icon: LucideIcon; tone: TagTone }> = {
  status: { icon: ArrowRightLeft, tone: "brand" },
  documents: { icon: FileUp, tone: "success" },
  correction: { icon: FilePlus2, tone: "attention" },
  visa: { icon: Plane, tone: "info" },
  program: { icon: Wallet, tone: "neutral" },
  message: { icon: MessageCircle, tone: "info" },
  other: { icon: Info, tone: "neutral" },
};

/** Timeline API items → action headlines, actor metadata, and labelled details. */
export function toTimelineEvents(items: ApplicationTimelineItem[], options: DescribeOptions = {}): (TimelineEvent & { category: Category; details: { label: string; text: string; items?: string[] }[] })[] {
  return items.map((item) => {
    const { category, title, details } = describe(item, options);
    return { id: item.id, category, title, actor: options.forAdvisor ? advisorActorName(item.actor_name) : item.actor_name || "Unknown user", at: item.created_at, icon: CATEGORY_ICON[category].icon, tone: CATEGORY_ICON[category].tone, details };
  });
}
