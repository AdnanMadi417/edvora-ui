"use client";

import React, { useState, useEffect } from "react";
import { XCircle, AlertCircle } from "lucide-react";

import { useDisputeCommission } from "features/applications/hooks";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import { useToast } from "components/context/ToastContext";
import StatusFileUpload from "components/form/upload/StatusFileUpload";
import Button from "components/ui/buttons/Button";

interface DisputeCommissionProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onSuccess?: () => void;
}

export default function DisputeCommission({
  isOpen,
  onClose,
  applicationId,
  onSuccess,
}: DisputeCommissionProps) {
  const { disputeCommission, loading } = useDisputeCommission(applicationId);
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [reasonText, setReasonText] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setReasonText("");
      setReasonError("");
      setSelectedFile(null);
      setUploadProgress(0);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const validateReason = (value: string): string => {
    if (!value.trim()) return "Reason is required";
    if (value.trim().length < 10) return "Reason must be at least 10 characters";
    return "";
  };

  const isFormValid = !validateReason(reasonText);

  const handleSubmit = async () => {
    const err = validateReason(reasonText);
    if (err) {
      setReasonError(err);
      return;
    }

    try {
      let file_key: string | undefined;
      let file_url: string | undefined;

      if (selectedFile) {
        setUploading(true);
        const [presigned] = await getPresignedUploads([selectedFile], "dispute-commission");
        const [uploaded] = await uploadFilesToSpaces(
          [selectedFile],
          [presigned],
          (_, percent) => setUploadProgress(percent)
        );
        file_key = uploaded.file_key;
        file_url = uploaded.public_url;
        setUploading(false);
      }

      await disputeCommission({ reason_text: reasonText.trim(), file_key, file_url });

      showToast("Commission dispute submitted successfully.", "success");
      onClose();
      onSuccess?.();
    } catch {
      showToast("Failed to submit commission dispute.", "error");
      setUploading(false);
    }
  };

  if (!isVisible) return null;

  const isSubmitting = loading || uploading;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">

          <div className="flex items-start justify-between border-b border-gray-200 px-6 pb-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-red-200 bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-600" strokeWidth={2.5} />
              </div>
              <div>
                <h5 className="text-h4 font-bold text-gray-900">Dispute Commission</h5>
                <p className="mt-1 text-caption text-slate-500">
                  Submit a dispute regarding your commission amount.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="flex h-9 w-9 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-900">
                Reason for Dispute <span className="text-red-600">*</span>
              </label>
              <textarea
                value={reasonText}
                onChange={(e) => {
                  setReasonText(e.target.value);
                  if (reasonError) setReasonError("");
                }}
                onBlur={() => {
                  const err = validateReason(reasonText);
                  if (err) setReasonError(err);
                }}
                placeholder="Explain why you are disputing this commission amount..."
                rows={4}
                className={`w-full rounded-md border px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors resize-y placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  reasonError ? "border-red-500 bg-red-50" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              />
              {reasonError && (
                <p className="text-xs text-red-600">{reasonError}</p>
              )}
            </div>

            <StatusFileUpload
              id="dispute-commission-file"
              label="Supporting Document"
              description="Optional — attach any supporting file for your dispute"
              file={selectedFile}
              onFileChange={setSelectedFile}
              onRemove={() => { setSelectedFile(null); setUploadProgress(0); }}
              uploading={uploading}
              progress={uploadProgress}
              disabled={isSubmitting}
            />

          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              disabled={isSubmitting}
              icon={<XCircle className="h-4 w-4" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid}
              icon={<AlertCircle className="h-4 w-4" />}
              text={uploading ? "Uploading..." : loading ? "Submitting..." : "Submit Dispute"}
              bgColor="bg-red-50"
              textColor="text-red-700"
              borderColor="border-red-600"
              hoverTextColor="hover:text-red-700"
              hoverBorderColor="hover:border-red-700"
              className="hover:bg-red-100"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
