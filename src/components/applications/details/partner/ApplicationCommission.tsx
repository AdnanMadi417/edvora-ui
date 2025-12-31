"use client";

import React, { useState, useEffect } from "react";
import { Download, Receipt } from "lucide-react";
import api from "../../../../lib/useApi";
import { getDocumentDownloadUrl } from "../../../../services/documentService";

interface ApplicationCommissionProps {
  application: any;
  refetchApplication: () => void;
}

export default function ApplicationCommission({ application, refetchApplication }: ApplicationCommissionProps) {
  const [actionData, setActionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!application?.id) return;
    api.get(`/applications/${application.id}`)
      .then(res => setActionData(res.data))
      .catch(err => console.error("Failed to fetch application data:", err));
  }, [application?.id]);

  if (!application || !actionData) return null;

  const { status_code: currentStatus, status: statusLabel, available_actions: availableActions } = actionData;

  const handleDownload = async (fileKey?: string) => {
    if (!fileKey || downloading) return;
    try {
      setDownloading(true);
      const url = await getDocumentDownloadUrl(fileKey);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      alert("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const updateStatus = async (action: any, notes = "") => {
    try {
      setLoading(true);
      setError("");

      await api.post(`/applications/${application.id}/status`, {
        status_id: action.status_id,
        reason_text: action.requiresReason ? reason : null,
        notes,
      });

      await refetchApplication();
      alert(`Status updated to ${action.status}`);
      setReason("");
      setSelectedFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update status");
      alert("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    const confirmAction = availableActions.find((a: any) => a.status.includes("Complete"));
    if (!confirmAction) return setError("Cannot confirm commission at this stage.");
    updateStatus(confirmAction, "Commission confirmed by partner");
  };

  const handleDispute = async () => {
    if (!reason.trim()) return setError("Please provide a reason for the dispute.");
    if (!selectedFile) return setError("Please upload a dispute document.");

    const disputeAction = availableActions.find((a: any) => a.status.includes("Commission Disputed"));
    if (!disputeAction) return setError("Cannot dispute at this stage.");

    try {
      setUploading(true);

      // Upload file (example, replace with your storage logic)
      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadRes = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const { file_key, file_url } = uploadRes.data;

      await updateStatus(disputeAction, reason);

      // Submit document
      await api.post(`/applications/${application.id}/requested-documents/bulk`, [
        { document_type_id: "commission_dispute_report", file_key, file_url },
      ]);

      alert("Dispute submitted successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to submit dispute");
      alert("Failed to submit dispute. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const canConfirm = availableActions?.some((a: any) => a.status.includes("Complete"));
  const canDispute = availableActions?.some((a: any) => a.status.includes("Commission Disputed"));

  return (
    <section className="mb-6 mt-6 rounded-lg bg-card">
      <div className="mb-6 rounded-lg border bg-white">
        <div className="flex items-start gap-3 border-b border-gray-200 p-6">
          <div className="flex flex-1 items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Receipt className="text-xl text-blue-700" />
            </span>
            <div>
              <h3 className="text-p3 font-semibold text-text-primary">Partner Commission Details</h3>
              <span className="text-sm text-text-muted">Current Status: {statusLabel}</span>
            </div>
          </div>
        </div>

        {error && <div className="mx-6 mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

        <div className="space-y-4 p-6">
          {application.commissions?.map((commission: any) => (
            <div key={commission.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                    <Receipt className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Commission Payment</p>
                  </div>
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

              {(canConfirm || canDispute) && (
                <div className="mt-6 space-y-4 border-t pt-4">
                  {canConfirm && (
                    <button
                      onClick={handleConfirm}
                      disabled={loading || uploading}
                      className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "✓ Confirm Commission Received"}
                    </button>
                  )}

                  {canDispute && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="mb-3 text-sm font-medium text-red-900">Submit a Dispute</p>
                      <textarea
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm"
                        placeholder="Reason for dispute..."
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={loading || uploading}
                      />
                      <input
                        type="file"
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        disabled={loading || uploading}
                        className="mt-2"
                      />
                      <button
                        onClick={handleDispute}
                        disabled={loading || uploading || !reason.trim() || !selectedFile}
                        className="mt-3 w-full rounded-lg bg-red-600 px-4 py-3 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {uploading ? "Uploading..." : "Submit Dispute"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
