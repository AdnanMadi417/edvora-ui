"use client";

import React, { useState, useEffect } from "react";
import { XCircle, AlertCircle, RotateCcw } from "lucide-react";

interface ResubmitDocProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File | null, documentTypeId: string) => Promise<void>;
  applicationId?: string;
  documentTypeId?: string;
}

export default function UploadDoc({
                                    isOpen,
                                    onClose,
                                    onConfirm,
                                    documentTypeId,
                                  }: ResubmitDocProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleConfirm = () => {
    if (!documentTypeId || !selectedFile) return;
    onConfirm(selectedFile, documentTypeId);
    setSelectedFile(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm transition-all duration-300"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-card">
          <div className="relative border-b border-default px-6 pb-4 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                  <RotateCcw
                    className="h-6 w-6 text-amber-600"
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <h5 className="text-h4 font-bold text-gray-900">
                    Request Document Upload
                  </h5>
                  <p className="mt-0.5 text-caption text-slate-500">
                    Ask the applicant to upload the required document.
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                aria-label="Close dialog"
                className="group flex h-9 w-9 items-center justify-center rounded-md text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="space-y-6 px-6 py-6">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
              <p className="text-p2 leading-relaxed text-slate-900">
                This action will request the applicant to upload the required
                document. Make sure the file is clear, properly formatted, and
                within allowed size limits.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="resubmitFile"
                className="block text-p2 font-medium text-slate-900"
              >
                Upload Document <span className="text-amber-600">*</span>
              </label>

              <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 transition-all duration-200 hover:border-amber-500 hover:bg-amber-50">
                <svg
                  className="mb-3 h-10 w-10 text-amber-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16v4h10v-4m-5-12v12m0 0l-3-3m3 3l3-3"
                  />
                </svg>
                <span className="text-sm text-slate-500">
                  Click to upload or drag and drop
                </span>
                <input
                  id="resubmitFile"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {selectedFile && (
                <p className="mt-1 text-sm text-slate-500">
                  Selected file:{" "}
                  {selectedFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-default px-6 py-5">
            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="rounded-md border border-default bg-card px-5 py-2.5 text-p2 font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedFile}
                className="rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-p2 font-medium text-white shadow-lg shadow-amber-500/25 transition-all duration-200 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl hover:shadow-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
