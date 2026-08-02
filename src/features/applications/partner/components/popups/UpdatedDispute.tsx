"use client";

import React, { useState } from "react";
import { XCircle, AlertCircle, CheckCircle } from "lucide-react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";
import { InputField } from "components/form";
import Button from "components/ui/buttons/Button";

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
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-red-200 bg-red-50">
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
              className="flex h-9 w-9 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-5">
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
            <Button
              onClick={handleClose}
              icon={<XCircle className="h-4 w-4" />}
              text="Cancel"
              bgColor="bg-white"
              textColor="text-gray-600"
              borderColor="border-gray-600"
              hoverTextColor="hover:text-gray-700"
              hoverBorderColor="hover:border-gray-700"
            />
            <Button
              onClick={handleSubmitDispute}
              disabled={!formData.disputeReason.trim() || isSubmitting}
              icon={<CheckCircle className="h-4 w-4" />}
              text={isSubmitting ? "Submitting..." : "Submit Dispute"}
              bgColor="bg-red-100"
              textColor="text-red-700"
              borderColor="border-red-600"
              hoverTextColor="hover:text-red-700"
              hoverBorderColor="hover:border-red-700"
              className="hover:bg-red-200"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
