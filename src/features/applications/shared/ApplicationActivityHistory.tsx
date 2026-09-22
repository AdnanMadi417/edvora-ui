"use client";

import React from "react";
import {
  ArrowRightLeft,
  DollarSign,
  FilePlus2,
  FileUp,
  History,
  Info,
  MessageCircle,
  Plane,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { AppDate } from "components/ui/date";
import { SectionIconBadge } from "components/ui/icons";
import Button from "components/ui/buttons/Button";
import { useApplicationTimeline } from "features/applications/hooks";
import type { ApplicationTimelineItem, TimelineDocumentTypeRef } from "features/applications/shared/applicationTypes";

type Category = "status" | "documents" | "correction" | "visa" | "program" | "message" | "other";

const CATEGORY_STYLE: Record<Category, { icon: LucideIcon; bg: string; color: string }> = {
  status: { icon: ArrowRightLeft, bg: "bg-blue-100", color: "text-blue-600" },
  documents: { icon: FileUp, bg: "bg-emerald-100", color: "text-emerald-600" },
  correction: { icon: FilePlus2, bg: "bg-orange-100", color: "text-orange-600" },
  visa: { icon: Plane, bg: "bg-sky-100", color: "text-sky-600" },
  program: { icon: DollarSign, bg: "bg-violet-100", color: "text-violet-600" },
  message: { icon: MessageCircle, bg: "bg-indigo-100", color: "text-indigo-600" },
  other: { icon: Info, bg: "bg-slate-100", color: "text-slate-500" },
};

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

const humanize = (code: string) =>
  code
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const asString = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// type/code are both null only when the document type was deleted after this
// log entry was written — fall back to the raw id rather than render null.
const formatDocType = (ref: TimelineDocumentTypeRef): string =>
  ref.type ?? ref.code ?? `Unknown document type (${ref.id})`;
const formatDocTypeList = (refs: TimelineDocumentTypeRef[] | null): string | null =>
  refs && refs.length > 0 ? refs.map(formatDocType).join(", ") : null;

interface Described {
  category: Category;
  title: string;
  details: { label: string; text: string }[];
}

// `detail` shapes vary by entry_type (and document_upload by call site), so
// every field is read defensively and an unknown entry_type still renders.
function describe(item: ApplicationTimelineItem): Described {
  const actor = item.actor_name || "Unknown user";
  const d = item.detail ?? {};
  const category = ENTRY_CATEGORY[item.entry_type] ?? "other";
  const details: Described["details"] = [];

  switch (item.entry_type) {
    case "status_transition": {
      if (item.to_stage) details.push({ label: "Stage", text: item.to_stage });
      const requiredDocs = formatDocTypeList(item.required_document_types);
      if (requiredDocs) details.push({ label: "Requested", text: requiredDocs });
      if (item.reason_text) details.push({ label: "Reason", text: item.reason_text });
      if (item.notes) details.push({ label: "Notes", text: item.notes });
      const title =
        item.from_status && item.to_status
          ? `${actor} moved from ${item.from_status} to ${item.to_status}`
          : item.to_status
            ? `${actor} set the status to ${item.to_status}`
            : `${actor} changed the status`;
      return { category, title, details };
    }

    case "document_upload": {
      const code = asString(d.document_type_code);
      const uploaded = formatDocTypeList(item.uploaded_document_types);
      const label = code ? humanize(code) : (uploaded ?? "a document");
      const requested = formatDocTypeList(item.requested_document_types);
      if (requested) details.push({ label: "Requested", text: requested });
      return { category, title: `${actor} ${d.reupload === true ? "re-uploaded" : "uploaded"} ${label}`, details };
    }

    case "correction_request_updated": {
      const reason = asString(d.reason_text);
      const requested = formatDocTypeList(item.required_document_types);
      if (reason) details.push({ label: "Reason", text: reason });
      if (requested) details.push({ label: "Requested", text: requested });
      return { category, title: `${actor} updated the correction request`, details };
    }

    case "visa_payment_created": {
      const amount = typeof d.amount === "number" || asString(d.amount) ? String(d.amount) : null;
      const currency = asString(d.currency);
      const suffix = amount ? `: ${amount}${currency ? ` ${currency}` : ""}` : "";
      return { category, title: `Visa payment recorded${suffix}`, details };
    }

    case "visa_case_updated":
      return { category, title: `${actor} updated the visa case`, details };
    case "arrival_date_updated":
      return { category, title: `${actor} updated the arrival date`, details };
    case "program_changed":
      return { category, title: `${actor} changed the program`, details };
    case "lifecycle_status_changed":
      return { category, title: `${actor} changed the application status`, details };
    case "commission_disputed":
      return { category, title: `${actor} disputed the commission`, details };
    case "message_sent":
      return { category, title: `${actor} sent a message`, details };

    default:
      return { category, title: `${humanize(item.entry_type)} by ${actor}`, details };
  }
}

interface Props {
  application: any;
}

export default function ApplicationActivityHistory({ application }: Props) {
  // updated_at changes after actions, which re-pulls the feed.
  const { items, total, loading, loadingMore, error, errorCode, hasMore, loadMore, refetch } =
    useApplicationTimeline(application?.id, application?.updated_at);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <SectionIconBadge icon={History} color="blue" />
        <div>
          <h3 className="text-p3 font-semibold text-slate-900">Activity History</h3>
          <p className="text-sm text-slate-500">
            {total > 0 ? `${plural(total, "event")}, newest first` : "Everything that has happened to this application"}
          </p>
        </div>
      </div>

      {loading && items.length === 0 && (
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-slate-100" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && errorCode === "application_inactive" && (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Activity history is only available while the application is active.
        </p>
      )}

      {!loading && error && errorCode !== "application_inactive" && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
          <Button
            onClick={refetch}
            icon={<RefreshCw className="h-4 w-4" />}
            text="Retry"
            bgColor="bg-white"
            textColor="text-red-600"
            borderColor="border-red-200"
            hoverTextColor="hover:text-red-600"
            hoverBorderColor="hover:border-red-200"
            className="shrink-0 hover:bg-red-50"
          />
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-slate-400">No activity recorded yet.</p>
      )}

      {items.length > 0 && (
        <ol>
          {items.map((item, index) => {
            const { category, title, details } = describe(item);
            const { icon: Icon, bg, color } = CATEGORY_STYLE[category];
            const isLast = index === items.length - 1;
            return (
              <li key={item.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  {!isLast && <div className="mt-1 w-0.5 flex-1 rounded-full bg-slate-200" />}
                </div>

                <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-6"}`}>
                  <p className="break-words pt-1.5 text-sm font-medium text-slate-800">{title}</p>
                  {details.map((row) => (
                    <p key={row.label} className="mt-1 whitespace-pre-wrap break-words text-xs text-slate-500">
                      <span className="font-semibold text-slate-600">{row.label}:</span> {row.text}
                    </p>
                  ))}
                  <p className="mt-1 text-xs text-slate-400">
                    <AppDate value={item.created_at} format="datetime" fallback="—" />
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            text={loadingMore ? "Loading..." : "Load more"}
            bgColor="bg-white"
            textColor="text-slate-700"
            borderColor="border-slate-200"
            hoverTextColor="hover:text-slate-700"
            hoverBorderColor="hover:border-slate-300"
            className="hover:bg-slate-50"
          />
        </div>
      )}
    </div>
  );
}
