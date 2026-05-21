"use client";

import React, { useState } from "react";
import { Receipt, Download } from "lucide-react";
import { getDocumentDownloadUrl } from "services/documentService";

interface ApplicationCommissionsProps {
  application: any;
}

export default function ApplicationCommissions({
  application,
}: ApplicationCommissionsProps) {
  const commissions = application?.commissions || [];

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const commissionDocs = Object.values(
    application?.commission_documents || {}
  ).filter(Boolean) as any[];

  const hasCommissions = commissions.length > 0;

  const formatLabel = (text?: string) =>
  text
    ? text.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Commission Document";

  if (!hasCommissions && commissionDocs.length === 0) return null;

  const handleDownload = async (doc: any) => {
    if (!doc?.file_key || downloadingId) return;

    try {
      setDownloadingId(doc.id);
      const url = await getDocumentDownloadUrl(doc.file_key);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      alert("Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section className="mb-6 mt-6 max-w-5xl mx-auto rounded-lg bg-card">
      <div className="mb-6 rounded-lg border bg-white">
        <div className="flex items-start gap-3 border-b border-gray-200 p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
            <Receipt className="text-xl text-blue-700" />
          </span>
          <div>
            <h3 className="text-p3 font-semibold text-slate-900">
              Commission Details
            </h3>

            <span className="text-sm text-slate-500">
              Track payments, status, and resolve disputes
            </span>

          </div>
        </div>

        <div className="space-y-4 p-6">
          {commissionDocs.length > 0 ? (
            commissionDocs.map((doc: any) => (
              <div
                key={doc.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-50">
                      <Receipt className="h-5 w-5 text-green-600" />
                    </div>

                    <p className="font-medium text-gray-900">
                      {formatLabel(doc.document_type)}
                    </p>

                  </div>

                  <button
                    title={doc.document_type}
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingId === doc.id}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-green-600 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No commission records found.
            </p>
          )}
        </div>


      </div>
    </section>
  );
}
