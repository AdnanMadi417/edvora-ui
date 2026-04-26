"use client";

import React, { useState } from "react";
import { CheckCircle, Pause, XCircle, AlertCircle } from "lucide-react";
import Cookies from "js-cookie";
import NoDocumentsRequired from "components/emptyData/NoDocumentsRequired";
import DocumentUploadList from "components/applications/form/stages/DocumentUploadList";
import { useApplicationActions } from "hooks/applications/stages/useApplicationActions";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import { useToast } from "components/context/ToastContext";
import api from "lib/useApi";
import { DocumentItem, DocumentType, FormDataType } from "components/applications/form/utility-functions/types";

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
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { actions, loading } = useApplicationActions(applicationId);
  const { showToast } = useToast();

  const formData = { documents } as FormDataType;

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    document_type_id: string
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const placeholders: DocumentItem[] = files.map((file) => ({
      document_type_id,
      file_url: "",
      file_key: "",
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
      raw: file,
      uploading: true,
      progress: 0,
    }));

    setDocuments((prev) => [
      ...prev.filter((d) => d.document_type_id !== document_type_id),
      ...placeholders,
    ]);

    try {
      const presigned = await getPresignedUploads(files, "documents");
      const results = await uploadFilesToSpaces(files, presigned, (fileIndex, pct) => {
        setDocuments((prev) => {
          const docs = [...prev];
          const idx = docs.findIndex((d) => d.raw === files[fileIndex]);
          if (idx !== -1) docs[idx] = { ...docs[idx], progress: pct };
          return docs;
        });
      });

      setDocuments((prev) => {
        const docs = [...prev];
        files.forEach((file, i) => {
          const idx = docs.findIndex((d) => d.raw === file);
          if (idx !== -1) {
            docs[idx] = {
              ...docs[idx],
              uploading: false,
              progress: 100,
              file_url: results[i].public_url,
              file_key: results[i].file_key,
            };
          }
        });
        return docs;
      });

      setErrors((prev) => {
        const next = { ...prev };
        delete next[`documents.${document_type_id}`];
        return next;
      });
      showToast("File uploaded successfully", "success");
    } catch {
      showToast("Upload failed", "error");
      setDocuments((prev) =>
        prev.map((d) => (d.uploading ? { ...d, uploading: false } : d))
      );
    }
  };

  const removeDocument = async (document_type_id: string) => {
    const doc = documents.find((d) => d.document_type_id === document_type_id);
    if (!doc) return;

    if (doc.file_key) {
      try {
        const token = Cookies.get("token");
        await api.delete("/storage/file", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          data: { file_key: doc.file_key },
        });
      } catch {
        showToast("Failed to delete file from storage", "error");
        return;
      }
    }

    setDocuments((prev) => prev.filter((d) => d.document_type_id !== document_type_id));
  };

  const validate = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (loading) {
      newErrors["documents"] = "Document types are still loading, please wait.";
      return newErrors;
    }

    const required = docTypes.filter((d) => d.is_required_init_app_doc);

    if (required.length > 0) {
      required.forEach((docType) => {
        const uploaded = documents.find(
          (d) => d.document_type_id === docType.id && d.file_url && !d.uploading
        );
        if (!uploaded) {
          newErrors[`documents.${docType.id}`] = "required";
        }
      });
    } else if (!documents.some((d) => d.file_url && !d.uploading)) {
      newErrors["documents"] = "Please upload at least one document before confirming.";
    }

    return newErrors;
  };

  const handleConfirm = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = documents
        .filter((d) => d.file_key)
        .map((d) => ({
          document_type_id: d.document_type_id,
          file_url: d.file_url,
          file_key: d.file_key,
        }));

      await api.post(`/applications/${applicationId}/requested-documents/bulk`, payload);
      showToast("Documents submitted successfully.", "success");
      onConfirm?.(applicationId, payload.map((d) => d.document_type_id));
      onClose();
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to submit documents.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const docTypes: DocumentType[] = actions?.document_types ?? [];
  const requiredDocTypes = docTypes.filter((d) => d.is_required_init_app_doc);
  const uploadedDocs = documents.filter((d) => d.file_url && !d.uploading);
  const allRequiredUploaded =
    requiredDocTypes.length > 0
      ? requiredDocTypes.every((d) =>
          documents.some(
            (doc) => doc.document_type_id === d.id && doc.file_url && !doc.uploading
          )
        )
      : uploadedDocs.length > 0;
  const anyUploading = documents.some((d) => d.uploading);

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
                  <h5 className="text-lg font-bold text-gray-900">Required Documents</h5>
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

          <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-6">
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : docTypes.length > 0 ? (
              <>
                {actions?.correction_reason && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-amber-800">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    <span className="text-xs">{actions.correction_reason}</span>
                  </div>
                )}
                <DocumentUploadList
                  documentTypes={docTypes}
                  formData={formData}
                  errors={errors}
                  handleFileUpload={handleFileUpload}
                  removeDocument={removeDocument}
                />
              </>
            ) : (
              <NoDocumentsRequired
                title="No documents required"
                subtitle="This application does not require any document uploads."
              />
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
              disabled={!allRequiredUploaded || anyUploading || isSubmitting}
              className="flex items-center justify-center gap-2 rounded-md border border-amber-600 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 transition hover:border-amber-700 hover:bg-amber-200 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
