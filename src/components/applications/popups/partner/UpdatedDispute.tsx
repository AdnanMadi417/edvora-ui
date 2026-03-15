"use client";

import React, { useState } from "react";
import { XCircle, AlertCircle, CheckCircle, Upload, Trash2 } from "lucide-react";
import api from "../../../../lib/useApi";
import { useToast } from "../../../context/ToastContext";
import { InputField } from "components/form";
import { useDocumentType } from "hooks/useDocumentType";
import { getPresignedUploads, uploadFilesToSpaces } from '../../../../services/uploadService';

interface DisputeSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  statusId: string;
  onSuccess?: () => void;
}

export default function DisputeSubmissionModal({
                                                 isOpen,
                                                 onClose,
                                                 applicationId,
                                                 statusId,
                                                 onSuccess,
                                               }: DisputeSubmissionModalProps) {
  const [formData, setFormData] = useState({ disputeReason: "" });
  const [disputeFile, setDisputeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const { documentTypes } = useDocumentType();
  const commissionDisputeDoc = documentTypes.find(
    (doc) => doc.code === "commission_dispute_report"
  );

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitDispute = async () => {
    if (!formData.disputeReason.trim()) {
      showToast("Please provide a reason for the dispute.", "error");
      return;
    }
    if (!disputeFile) {
      showToast("Please upload the Commission Dispute Report.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1️⃣ Upload file to presigned URL
      const presigned = await getPresignedUploads([disputeFile], "commission_dispute_report");
      const results = await uploadFilesToSpaces([disputeFile], presigned);
      const uploaded = results?.[0];

      if (!uploaded?.file_key || !uploaded?.public_url) {
        throw new Error("Dispute report upload failed");
      }

      // 2️⃣ Submit dispute with uploaded file
      await api.post(`/applications/${applicationId}/status`, {
        status_id: statusId,
        reason_text: formData.disputeReason,
        notes: "",
        required_document_type_ids: [commissionDisputeDoc?.id || ""],
        documents: [
          {
            file_key: uploaded.file_key,
            public_url: uploaded.public_url,
          },
        ],
      });

      showToast("Dispute submitted successfully. Manager review required.", "success");
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to submit dispute.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ disputeReason: "" });
    setDisputeFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-lg transform transition-all duration-300 md:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white text-sm shadow-2xl ring-1 ring-black/5">

          {/* Header */}
          <div className="relative flex items-start justify-between border-b border-gray-200 px-6 pb-4 pt-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-600" strokeWidth={2.5} />
              </div>
              <div>
                <h5 className="text-h4 font-bold text-gray-900">Submit a Dispute</h5>
                <p className="mt-1 text-caption text-slate-500">
                  Raise a dispute regarding your application or payment.
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close dialog"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-5">

            <div className="space-y-2">
              <label className="block font-medium text-gray-900">Commission Dispute Report</label>
              <label
                htmlFor="dispute_file"
                className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:border-red-500 hover:bg-red-50/30"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="font-medium text-gray-900">Upload Dispute Report</p>
                <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG — Max 5MB</p>
                <input
                  id="dispute_file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  disabled={isSubmitting}
                  onChange={(e) => setDisputeFile(e.target.files?.[0] || null)}
                />
              </label>

              {disputeFile && (
                <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-2">
                  <span className="truncate text-sm text-slate-500">{disputeFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setDisputeFile(null)}
                    className="flex items-center justify-center gap-2 rounded-full border border-red-600 text-red-600  px-4 py-2 text-sm font-medium transition hover:border-red-700 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              )}
            </div>

            <InputField
              label="Reason for Dispute"
              field="disputeReason"
              type="text"
              placeholder="Explain your dispute..."
              required
              formData={formData}
              errors={{}}
              updateFormData={updateFormData}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={handleClose}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-600 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSubmitDispute}
              disabled={!formData.disputeReason.trim() || !disputeFile || isSubmitting}
              className="flex items-center justify-center gap-2 rounded-full border border-red-600 bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-200 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Dispute"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}