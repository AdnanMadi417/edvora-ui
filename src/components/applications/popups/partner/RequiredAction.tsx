"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, Pause, XCircle } from 'lucide-react';
import { FaRegFileLines } from "react-icons/fa6";
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
    if (!file) return;

    setSelectedFiles((prev) => ({ ...prev, [docId]: file }));

    showToast(`File uploaded successfully.`, "success");
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

      showToast("All documents processed successfully.", "success");

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
        <div className="relative overflow-hidden rounded-2xl bg-card shadow-lg ">

          <div className="relative border-b border-default px-6 pb-4 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
                  <Pause className="h-6 w-6 text-amber-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h5 className="text-lg font-bold text-gray-900">
                    Required Application Actions
                  </h5>

                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <span className="font-normal">
                    <span className="font-medium">Next Action: {" "}</span>
                      {appDetails ? `${appDetails.next_action}` : "Loading..."}
                  </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                <XCircle className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : appDetails ? (
              <>
                {appDetails.document_types?.length > 0 ? (
                  <div>
                    <div className="mb-3 flex items-center gap-1">
                      <div className="flex h-8 w-8 items-center justify-center">
                        <FaFileAlt className="h-4 w-4" />
                      </div>
                      <h3 className="truncate text-base font-semibold text-slate-900">
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
                            className="block gap-4 rounded-md border border-gray-200 p-4 transition"
                          >

                            <div className="block mb-4 sm:flex-1">
                              <div className="flex items-center gap-2">
                                <FaRegFileLines className="text-blue-500" />
                                <span className="text-sm font-semibold text-gray-800 uppercase">
                                  {doc.description}
                                </span>
                              </div>

                              {appDetails.correction_reason && (
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-xs font-medium text-orange-400">
                                    Reason: {" "}
                                    <span className="text-slate-500">
                                      {appDetails.correction_reason}
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="w-full ">
                              <label
                                htmlFor={`file-${doc.id}`}
                                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center text-sm font-medium text-gray-600 transition hover:border-blue-500 hover:bg-blue-50"
                              >
                                <svg
                                  className="h-6 w-6 text-gray-400"
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
                                <span className="truncate">
                                  {selectedFiles[doc.id]?.name ||
                                    "Upload document"}
                                </span>
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
              className="flex items-center justify-center gap-2 rounded-full border border-gray-600 px-4  py-2 text-sm font-medium text-gray-600 transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={Object.values(selectedFiles).every((file) => !file)}
              className="flex items-center justify-center gap-2 rounded-full border border-amber-600 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 transition hover:border-amber-700 hover:bg-amber-200 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
