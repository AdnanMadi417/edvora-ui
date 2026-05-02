"use client";

import React, { useState } from "react";
import { Download, Receipt } from "lucide-react";
import { getDocumentDownloadUrl } from "../../../../services/documentService";
import { useToast } from "../../../context/ToastContext";
import { ApplicationActionsResponse } from "hooks/applications/stages/useApplicationActions";

interface ApplicationCommissionProps {
  application: any;
  actions: ApplicationActionsResponse | null;
}

export default function ApplicationCommission({
  application,
  actions,
}: ApplicationCommissionProps) {
  const [downloading, setDownloading] = useState(false);
  const { showToast } = useToast();

  const { status: statusLabel } = actions || {};

  const hasCommissions =
    Array.isArray(application?.commissions) &&
    application.commissions.length > 0;

  const commissionDocs = Object.values(
    application?.commission_documents || {}
  ).filter((doc: any) => doc !== null) as any[];

  if (!hasCommissions) return null;

  const handleDownload = async (fileKey?: string) => {
    if (!fileKey || downloading) return;
    try {
      setDownloading(true);
      const url = await getDocumentDownloadUrl(fileKey);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      showToast("Download failed", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="mb-6 mt-6 max-w-5xl mx-auto rounded-lg bg-card">
      <div className="mb-6 rounded-lg border bg-white">
        <div className="flex items-start gap-3 border-b border-gray-200 p-6">
          <div className="flex flex-1 items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
              <Receipt className="text-xl text-blue-700" />
            </span>
            <div>
              <h3 className="text-p3 font-semibold text-slate-900">
                Partner Commission Details
              </h3>
              {statusLabel && (
                <span className="text-sm text-slate-500">
                  Current Status: {statusLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          {application.commissions.map((commission: any) => {
            const name =
              commissionDocs.find(
                (doc) => doc.commission_id === commission.id
              )?.document_type ??
              commissionDocs[0]?.document_type ??
              "Commission Payment";

            const docs = commissionDocs.filter(
              (doc) =>
                doc.commission_id === commission.id || !doc.commission_id
            );

            return (
              <div
                key={commission.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-50">
                      <Receipt className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="font-medium text-gray-900">{name}</p>
                  </div>
                  {docs.length > 0 && (
                    <div className="flex items-center gap-2">
                      {docs.map((doc: any) => (
                        <button
                          key={doc.id}
                          onClick={() => handleDownload(doc.file_key)}
                          disabled={downloading}
                          title={doc.document_type}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-green-600 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
