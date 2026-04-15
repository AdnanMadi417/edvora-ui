"use client";

import React, { useState } from "react";
import { CheckCircle, Pause, XCircle, AlertCircle } from 'lucide-react';
import { FaRegFileLines } from "react-icons/fa6";
import { FaFileAlt } from "react-icons/fa";
import NoDocumentsRequired from "components/emptyData/NoDocumentsRequired";
import StatusFileUpload from "components/form/filesUpload/StatusFileUpload";
import { useApplicationActions } from 'hooks/applications/stages/useApplicationActions';
import { useRequiredDocumentsUpload } from 'hooks/applications/files/useRequiredDocumentsUpload';

interface RequiredActionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (applicationId: string | number, selectedDocs?: string[]) => void;
  applicationId: string;
}

export default function RequiredAction({
  isOpen,
  onClose,
  onConfirm,
  applicationId,
}: RequiredActionProps) {
  const [selectedFiles, setSelectedFiles] = useState<{ [docId: string]: File | null }>({});
  const [fileErrors, setFileErrors] = useState<{ [docId: string]: string }>({});

  const { actions, loading } = useApplicationActions(applicationId);
  const { submitDocuments, isSubmitting } = useRequiredDocumentsUpload();

  const handleFileChange = (docId: string, file: File) => {
    setSelectedFiles((prev) => ({ ...prev, [docId]: file }));
  };

  const handleFileRemove = (docId: string) => {
    setSelectedFiles((prev) => ({ ...prev, [docId]: null }));
  };

  const handleFileError = (docId: string, msg: string) => {
    setFileErrors((prev) => ({ ...prev, [docId]: msg }));
  };

  const handleConfirm = async () => {
    try {
      await submitDocuments(applicationId, selectedFiles);
      onConfirm?.(applicationId, Object.keys(selectedFiles));
      onClose();
      setTimeout(() => window.location.reload(), 2000);
    } catch {
      // error handled inside hook
    }
  };

  const hasAnyFile = Object.values(selectedFiles).some(Boolean);
  const hasAnyError = Object.values(fileErrors).some(Boolean);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-card shadow-lg">

          <div className="relative border-b border-default px-6 pb-4 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
                  <Pause className="h-6 w-6 text-amber-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h5 className="text-lg font-bold text-gray-900">
                    Required Application Actions
                  </h5>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <span className="font-normal">
                      <span className="font-medium">Next Action: </span>
                      {actions ? `${actions.next_action}` : "Loading..."}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                <XCircle className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : actions ? (
              <>
                {actions.document_types?.length > 0 ? (
                  <div>
                    <div className="mb-3 flex items-center gap-1">
                      <div className="flex h-8 w-8 items-center justify-center">
                        <FaFileAlt className="h-4 w-4" />
                      </div>
                      <h3 className="truncate text-base font-semibold text-slate-900">
                        {actions.status ||
                          actions.stage_statuses?.[0]?.name ||
                          "Not provided"}
                      </h3>
                    </div>

                    <div className="mt-4 rounded-md border border-gray-200 bg-white p-4">
                      <h4 className="mb-3 text-sm font-semibold text-gray-800">
                        Documents to Upload
                      </h4>

                      <ul className="space-y-4">
                        {actions.document_types.map((doc: any) => (
                          <li
                            key={doc.id}
                            className="block space-y-4"
                          >
                            <div className="block mb-4 sm:flex-1">

                              {actions.correction_reason && (
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-xs font-medium text-orange-400">
                                    Reason:{" "}
                                    <span className="text-slate-500">
                                      {actions.correction_reason}
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>

                            <StatusFileUpload
                              label={doc.description}
                              id={`file-${doc.id}`}
                              file={selectedFiles[doc.id] ?? null}
                              onFileChange={(file) => handleFileChange(doc.id, file)}
                              onRemove={() => handleFileRemove(doc.id)}
                              onError={(msg) => handleFileError(doc.id, msg)}
                              disabled={isSubmitting}
                            />

                            {fileErrors[doc.id] && (
                              <div className="mb-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                                <p className="text-xs text-red-700">{fileErrors[doc.id]}</p>
                              </div>
                            )}

                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <NoDocumentsRequired
                    title="No documents required"
                    subtitle="This application does not require any document uploads."
                  />
                )}
              </>
            ) : (
              <p className="text-red-500">Failed to load application details</p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-default px-6 py-5">
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-md border border-gray-600 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!hasAnyFile || hasAnyError || isSubmitting}
              className="flex items-center justify-center gap-2 rounded-md border border-amber-600 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 transition hover:border-amber-700 hover:bg-amber-200 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              {isSubmitting ? "Uploading..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
