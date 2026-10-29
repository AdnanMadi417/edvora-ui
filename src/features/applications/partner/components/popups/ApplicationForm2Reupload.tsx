"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { XCircle, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useApplicationForm2DocumentUpload } from "features/applications/hooks/files/useApplicationForm2DocumentUpload";
import CompactFileUpload from "components/ub/forms/CompactFileUpload";
import Button from "components/ub/core/Button";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_status_for_application_form_2_reupload: "This application isn't currently awaiting a second application form.",
};

interface ApplicationForm2ReuploadProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  correctionReason?: string | null;
  onRefetch?: () => void;
}

export default function ApplicationForm2Reupload({
  isOpen,
  onClose,
  applicationId,
  correctionReason,
  onRefetch,
}: ApplicationForm2ReuploadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const { uploadApplicationForm2Document, isUploading } = useApplicationForm2DocumentUpload();

  useEffect(() => {
    if (isOpen) setIsVisible(true);
    else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConfirmUpload = async () => {
    if (!file) return;

    setUploadError("");
    try {
      await uploadApplicationForm2Document(file, applicationId);
      handleClose();
      onRefetch?.();
    } catch (error: unknown) {
      const code = getApiErrorCode(error);
      const msg = (code && ERROR_MESSAGES[code]) || parseApiError(error, "Failed to upload application form 2");
      setUploadError(msg);
    }
  };

  const handleClose = () => {
    setFile(null);
    setFileError("");
    setUploadError("");
    onClose();
  };

  if (!isVisible) return null;

  // Portaled to document.body: a fixed-position overlay nested inside the
  // tab content isn't guaranteed to cover the viewport if any ancestor
  // establishes a containing block (e.g. a transform from a page transition).
  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-lg md:max-w-xl transform transition-all duration-300 ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white text-sm shadow-2xl ring-1 ring-black/5">

          <div className="relative border-b border-slate-200 px-6 pb-4 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-red-200 bg-gradient-to-br from-red-50 to-red-100">
                  <FileText className="h-6 w-6 text-red-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h5 className="text-lg font-bold text-gray-900">
                    Re-upload Application Form 2
                  </h5>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Your second application form was rejected — upload a corrected copy to resubmit
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                aria-label="Close dialog"
                className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <XCircle className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-5">
            {correctionReason && (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Reason for rejection</p>
                  <p className="mt-0.5 text-xs text-amber-800">{correctionReason}</p>
                </div>
              </div>
            )}

            <CompactFileUpload
              label="Application Form 2"
              description="Upload the corrected second application form"
              id="application_form_2"
              file={file}
              onFileChange={(f) => { setFile(f); setUploadError(""); }}
              onRemove={() => { setFile(null); setUploadError(""); }}
              onError={setFileError}
              disabled={isUploading}
              required
            />

            {fileError && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-xs text-red-700">{fileError}</p>
              </div>
            )}

            {uploadError && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-xs text-red-700">{uploadError}</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end gap-3">
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
                disabled={!file || !!fileError || !!uploadError || isUploading}
                onClick={handleConfirmUpload}
                icon={<CheckCircle className="h-4 w-4" />}
                text={isUploading ? "Uploading..." : "Submit Form"}
                bgColor="bg-blue-100"
                textColor="text-blue-700"
                borderColor="border-blue-600"
                hoverTextColor="hover:text-blue-700"
                hoverBorderColor="hover:border-blue-700"
                className="hover:bg-blue-200"
              />
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
