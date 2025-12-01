"use client";

import React, { useEffect, useState } from "react";
import { Pause, XCircle } from "lucide-react";
import api from "../../../../lib/useApi";
import { FaFileAlt } from "react-icons/fa";
import { useToast } from "components/context/ToastContext";
import NoDocumentsRequired from "components/emptyData/NoDocumentsRequired";
import {
  getPresignedUploads,
  uploadFilesToSpaces,
} from "services/uploadService";

interface RequiredActionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (applicationId: string | number, selectedDocs?: string[]) => void;
  applicationId: string | number;
}

export default function RequiredAction({
  isOpen,
  onClose,
  onConfirm,
  applicationId,
}: RequiredActionProps) {
  const [appDetails, setAppDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<{
    [docId: string]: File | null;
  }>({});

  useEffect(() => {
    if (!isOpen) return;

    const fetchApplication = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/applications/${applicationId}`);
        setAppDetails(res.data);
      } catch (error) {
        console.error("Error fetching application:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId, isOpen]);

  const handleFileChange = (docId: string, file: File | null) => {
    setSelectedFiles((prev) => ({ ...prev, [docId]: file }));
  };

  const handleConfirm = async () => {
    try {
      for (const [docId, file] of Object.entries(selectedFiles)) {
        if (!file) continue;

        const presigned = await getPresignedUploads([file], "documents");
        const results = await uploadFilesToSpaces([file], presigned);
        const uploadedFile = results[0];

        await api.post(
          `/applications/${applicationId}/requested-documents/bulk`,
          [
            {
              document_type_id: docId,
              file_url: uploadedFile.public_url,
              file_key: uploadedFile.file_key,
            },
          ]
        );
      }

      showToast("All documents uploaded successfully.", "success");
      onConfirm?.(applicationId, Object.keys(selectedFiles));
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      console.error("Some uploads failed:", err);
      const msg = err.response?.data?.message || "Failed to upload documents.";
      showToast(msg, "error");
    } finally {
      onClose();
    }
  };

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
          <div className="flex items-start justify-between border-b border-default px-6 pb-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <Pause className="h-6 w-6 text-amber-600" strokeWidth={2.5} />
              </div>
              <div>
                <h5 className="text-h4 font-bold text-gray-900">
                  Required Application Actions
                </h5>
                <p className="mt-0.5 text-caption text-text-muted">
                  {appDetails
                    ? `Next Action: ${appDetails.next_action}`
                    : "Loading..."}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="group flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <div className="space-y-4 px-6 py-4">
            {loading ? (
              <p className="text-text-muted">Loading...</p>
            ) : appDetails ? (
              <>
                {appDetails.document_types?.length > 0 ? (
                  <div>
                    <div className="mb-3 flex items-center gap-1">
                      <div className="flex h-8 w-8 items-center justify-center">
                        <FaFileAlt className="h-4 w-4" />
                      </div>
                      <h3 className="truncate text-base font-semibold text-text-primary">
                        {appDetails.status ||
                          appDetails.stage_statuses?.[0]?.name ||
                          "Not provided"}
                      </h3>
                    </div>

                    <div className="mt-4 rounded-md border border-gray-200 bg-white p-4">
                      <h4 className="mb-3 text-sm font-semibold text-gray-800">
                        Documents to Upload
                      </h4>

                      <ul className="space-y-2">
                        {appDetails.document_types.map((doc: any) => (
                          <li
                            key={doc.id}
                            className="flex flex-col items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-b-0 sm:flex-row sm:items-center"
                          >
                            <div className="flex items-center gap-2">
                              <FaFileAlt className="h-5 w-5 text-blue-600" />
                              <span className="text-sm font-medium text-text-muted">
                                {doc.description} ({doc.type})
                              </span>
                            </div>

                            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                              <label
                                htmlFor={`file-${doc.id}`}
                                className="flex cursor-pointer items-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-text-muted transition-colors hover:border-blue-500 hover:bg-blue-50"
                              >
                                <svg
                                  className="h-5 w-5 text-text-muted"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16v4h10v-4m-5-12v12m0 0l-3-3m3 3l3-3"
                                  />
                                </svg>
                                {selectedFiles[doc.id]?.name ||
                                  "Click to upload"}
                                <input
                                  id={`file-${doc.id}`}
                                  type="file"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFileChange(
                                      doc.id,
                                      e.target.files?.[0] || null
                                    )
                                  }
                                />
                              </label>
                            </div>
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
              className="rounded-full border border-default bg-card px-5 py-2.5 text-p2 text-text-muted hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={Object.values(selectedFiles).every((file) => !file)}
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-p2 text-white hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
