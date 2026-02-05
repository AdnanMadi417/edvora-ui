"use client";

import React, { useState } from "react";
import { XCircle, AlertCircle, CheckCircle } from "lucide-react";
import api from "../../../../lib/useApi";
import { useToast } from "../../../context/ToastContext";
import { InputField } from "components/form";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitDispute = async () => {
    if (!formData.disputeReason.trim()) {
      showToast("Please provide a reason for the dispute.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/applications/${applicationId}/status`, {
        status_id: statusId,
        reason_text: formData.disputeReason,
        notes: "",
        required_document_type_ids: ["commission_dispute_report"],
      });

      showToast(
        "Dispute submitted successfully. Manager review required.",
        "success"
      );
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
          <div className="relative flex items-start justify-between border-b border-gray-200 px-6 pb-4 pt-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-red-50">
                <AlertCircle
                  className="h-6 w-6 text-red-600"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <h5 className="text-h4 font-bold text-gray-900">
                  Submit a Dispute
                </h5>
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

            <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-5 shadow-sm">
              <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
              <p className="text-p2 leading-relaxed text-text-primary">
                This action will submit your dispute for review by the manager.
                Please provide a valid reason for the dispute to ensure proper processing.
              </p>
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
              className="flex items-center justify-center gap-2 rounded-full border border-gray-600 px-4  py-2 text-sm font-medium text-gray-600 transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSubmitDispute}
              disabled={!formData.disputeReason.trim() || isSubmitting}
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
