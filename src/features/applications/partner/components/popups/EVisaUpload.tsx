"use client";

import React, { useState, useEffect } from "react";
import { XCircle, ShieldCheck, CheckCircle, AlertCircle } from "lucide-react";
import { useEVisaUpload } from "features/applications/hooks";
import StatusFileUpload from "components/form/upload/StatusFileUpload";
import Button from "components/ui/buttons/Button";

interface EVisaUploadProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onRefetch?: () => void;
}

export default function EVisaUpload({
  isOpen,
  onClose,
  applicationId,
  onRefetch,
}: EVisaUploadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const { uploadEVisa, isUploading } = useEVisaUpload();

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
      await uploadEVisa(file, applicationId);
      handleClose();
      onRefetch?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload e-visa document";
      setUploadError(message);
    }
  };

  const handleClose = () => {
    setFile(null);
    setFileError("");
    setUploadError("");
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-lg md:max-w-xl transform transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white text-sm shadow-2xl ring-1 ring-black/5">

          <div className="relative border-b border-gray-200 px-6 pb-4 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                  <ShieldCheck className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h5 className="text-lg font-bold text-gray-900">Upload E-Visa Document</h5>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Upload your e-visa document to proceed with enrollment
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close dialog"
                className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-5">
            <StatusFileUpload
              label="E-Visa Document"
              description="Upload your approved e-visa document issued by the relevant authority"
              id="e_visa_document"
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
                text={isUploading ? "Uploading..." : "Submit E-Visa"}
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
    </div>
  );
}
