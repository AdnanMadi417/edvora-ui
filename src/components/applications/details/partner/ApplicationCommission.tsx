"use client";

import React, { useEffect, useState } from "react";
import { Download, CheckCircle, Receipt , XCircle} from 'lucide-react';
import api from "../../../../lib/useApi";
import { getDocumentDownloadUrl } from "../../../../services/documentService";
import Dispute from "../../popups/partner/UpdatedDispute";
import { useToast } from "../../../context/ToastContext";

interface ApplicationCommissionProps {
  application: any;
}

export default function ApplicationCommission({
                                                application,
                                              }: ApplicationCommissionProps) {
  const [actionData, setActionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [showDispute, setShowDispute] = useState(false);
  const { showToast } = useToast();

  const fetchActionData = async () => {
    if (!application?.id) return;
    try {
      const res = await api.get(`/applications/${application.id}`);
      setActionData(res.data);
    } catch (err) {
      console.error("Failed to fetch application data:", err);
    }
  };

  useEffect(() => {
    fetchActionData();
  }, [application?.id]);

  if (!application || !actionData) return null;

  const { status: statusLabel, partner_actions } = actionData;

  const confirmAction = partner_actions?.find(
    (a: any) => a.target_status_code === "APPLICATION_COMPLETE"
  );

  const disputeAction = partner_actions?.find(
    (a: any) => a.target_status_code === "COMMISSION_DISPUTED"
  );

  const hasCommissions =
    Array.isArray(application?.commissions) &&
    application.commissions.length > 0;

  const hasActions = !!confirmAction || !!disputeAction;

  if (!hasCommissions && !hasActions) {
    return null;
  }

  const handleDownload = async (fileKey?: string) => {
    if (!fileKey || downloading) return;
    try {
      setDownloading(true);
      const url = await getDocumentDownloadUrl(fileKey);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      alert("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    try {
      setLoading(true);
      setError("");

      await api.post(`/applications/${application.id}/status`, {
        status_id: confirmAction.target_status_id,
        reason_text: null,
        notes: "Partner commission confirmed successfully",
      });

      await fetchActionData();

      showToast("Commission confirmed successfully", "success");
      setTimeout(() => window.location.reload(), 2000);

    } catch {
      setError("Failed to confirm commission");
      showToast("Failed to confirm commission", "error");
      setTimeout(() => window.location.reload(), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (!application || !actionData) return null;

  if (!hasCommissions && !hasActions) {
    return null;
  }

  return (
    <>
      <section className="mb-6 mt-6 rounded-lg bg-card">
        <div className="mb-6 rounded-lg border bg-white">
          <div className="flex items-start gap-3 border-b border-gray-200 p-6">
            <div className="flex flex-1 items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Receipt className="text-xl text-blue-700" />
              </span>
              <div>
                <h3 className="text-p3 font-semibold text-text-primary">
                  Partner Commission Details
                </h3>
                <span className="text-sm text-text-muted">
                  Current Status: {statusLabel}
                </span>
              </div>
            </div>
          </div>

          {/*{error && (*/}
          {/*  <div className="mx-6 mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">*/}
          {/*    {error}*/}
          {/*  </div>*/}
          {/*)}*/}

          <div className="space-y-4 p-6">
            {application.commissions?.map((commission: any) => (
              <div
                key={commission.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                      <Receipt className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="font-medium text-gray-900">
                      Commission Payment
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {application.payment_documents?.map((doc: any) => (
                      <button
                        key={doc.id}
                        onClick={() => handleDownload(doc.file_key)}
                        disabled={downloading}
                        title="Download payment proof"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-green-600 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>

                {(confirmAction || disputeAction) && (
                <div className="flex flex-row gap-2 mt-6 border-t pt-4 justify-end">
                  {confirmAction && (
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex w-fit items-center gap-2 rounded-full border border-green-600 bg-green-100 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-200 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {loading
                      ? "Processing..."
                      : "Confirm Commission "}
                  </button>
                  )}

                  {disputeAction && (
                  <button
                    onClick={() => setShowDispute(true)}
                    className="flex w-fit items-center gap-2 rounded-full border border-red-600 bg-red-100 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Dispute Commission
                  </button>
                  )}
                </div>
                )}

              </div>
            ))}
          </div>
        </div>

        {actionData && disputeAction && (
          <Dispute
            isOpen={showDispute}
            applicationId={application.id}
            statusId={disputeAction.target_status_id}
            onClose={() => setShowDispute(false)}
            onSuccess={() => {
              setShowDispute(false);
              fetchActionData();
            }}
          />
        )}

      </section>
    </>
  );
}
