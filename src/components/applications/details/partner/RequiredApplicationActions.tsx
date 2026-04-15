import React, { useEffect, useState } from "react";
import { FaArrowCircleRight, FaFileAlt } from "react-icons/fa";
import api from "../../../../lib/useApi";
import UploadDoc from "../../popups/partner/UploadDoc";
import { AlertCircle, ArrowRightCircle } from "lucide-react";

interface RequiredApplicationActionsProps {
  params: {
    id: string;
  };
}

export default function RequiredApplicationActions({
  params,
}: RequiredApplicationActionsProps) {
  const [appDetails, setAppDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showResubmit, setShowResubmit] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const id = params.id;

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await api.get(`/applications/${id}`);
        setAppDetails(res.data);
      } catch (error) {
        console.error("Error fetching application:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleConfirmUpload = async (file: File | null, documentTypeId: string) => {
    if (!file) return;

    try {
      const dummyUrl = "https://example.com/dummy-file.pdf";

      const payload = [
        {
          document_type_id: documentTypeId,
          file_url: dummyUrl, // send ONLY STRING
        },
      ];

      const res = await api.post(
        `/applications/${id}/requested-documents/bulk`,
        payload
      );
    } catch (err: any) {
      console.error("Upload failed:", err.response?.data || err.message);
    }
  };

  const handleResubmit = (status: any, docId?: string) => {
    setSelectedStatus(status);
    setSelectedDocId(docId || null);
    setShowResubmit(true);
  };

  if (loading) return <p>Loading application…</p>;
  if (!appDetails) return <p>No application details found.</p>;

  return (
    <section className="max-w-5xl mx-auto">
      <div className="mb-6 mt-6 space-y-6 rounded-xl border border-gray-200 bg-card p-6">
        <h3 className="text-p3 mb-6 flex items-center gap-3 font-semibold text-slate-900">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
            <FaArrowCircleRight className="text-xl text-blue-700" />
          </span>

          <span className="flex flex-col">
            <span>Required Application Actions</span>
            <span className="mt-1 text-p2 font-normal text-slate-500">
              {appDetails.next_action || "Not provided"}
            </span>
          </span>
        </h3>

        {appDetails.stage_statuses?.length > 0 ? (
          <div className="space-y-4">
            {appDetails.stage_statuses.map((status: any, index: number) => {
              const hasDocuments = appDetails.document_types?.length > 0;
              const hasStageInfo =
                status.is_requires_reason ||
                status.is_requires_document_selection ||
                status.is_triggers_stage_advance;

              if (!hasDocuments && !hasStageInfo) return null;

              return (
                <div
                  key={status.id}
                  className="relative block rounded-xl border border-gray-100 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:border-gray-200"
                  style={{
                    animation: `slideIn 0.3s ease-out ${index * 0.08}s both`,
                  }}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100">
                      <FaFileAlt className="h-4 w-4 text-blue-700" />
                    </div>
                    <h3 className="truncate text-base font-semibold text-slate-900">
                      {status.name}
                    </h3>
                  </div>

                  <div className="mt-3 flex flex-col gap-4 border-t border-gray-100 pt-3">
                    {hasDocuments && (
                      <ul className="space-y-2">
                        {appDetails.document_types.map((doc: any) => (
                          <li
                            key={doc.id}
                            className="flex items-center justify-between gap-3 text-xs"
                          >
                            <span className="truncate">
                              <strong>{doc.type}:</strong> {doc.description}
                            </span>
                            <button
                              className="rounded-md border border-gray-200 px-2 py-1 text-xs text-blue-700 transition hover:bg-blue-50"
                              onClick={() => handleResubmit(status, doc.id)}
                            >
                              Upload Document
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {hasStageInfo && (
                      <div className="mt-3 w-fit space-y-2 text-xs text-slate-500">
                        {status.is_requires_reason && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Requires Reason: Yes</span>
                          </div>
                        )}

                        {status.is_triggers_stage_advance && (
                          <div className="flex items-center gap-2">
                            <ArrowRightCircle className="h-3.5 w-3.5" />
                            <span>Triggers Stage Advance: Yes</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No required actions at this stage.</p>
        )}
      </div>

      <UploadDoc
        isOpen={showResubmit}
        onClose={() => setShowResubmit(false)}
        applicationId={id}
        documentTypeId={selectedDocId!}
        onConfirm={handleConfirmUpload}
      />

    </section>
  );
}
