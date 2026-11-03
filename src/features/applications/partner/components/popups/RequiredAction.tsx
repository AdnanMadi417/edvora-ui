"use client";

import FormModal from "components/ub/feedback/FormModal";
import React, { useEffect, useState } from "react";
import { Pause, Download } from "lucide-react";
import Alert from "components/ub/feedback/Alert";
import Skeleton from "components/ub/feedback/Skeleton";
import NoDocumentsRequired from "components/ub/feedback/NoDocumentsRequired";
import DocumentUploadList from "features/applications/partner/components/form/stages/DocumentUploadList";
import DocumentActions from "features/applications/shared/DocumentActions";
import { useApplicationActions } from "features/applications/hooks";
import { useHealthDeclarationFormDownload } from "features/applications/shared/useHealthDeclarationFormDownload";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import { useToast } from "components/ub/feedback/ToastContext";
import api from "lib/useApi";
import IconButton from "components/ub/core/IconButton";
import { parseApiError } from "utils/parseApiError";
import { DocumentItem, DocumentType, FormDataType } from "features/applications/partner/components/form/utility-functions/types";

const FREE_UPLOAD_ID = "__free_upload__";

interface RequiredActionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (applicationId: string | number, selectedDocs?: string[]) => void;
  applicationId: string;
  onRefetch?: () => void;
}

export default function RequiredAction({
  isOpen,
  onClose,
  onConfirm,
  applicationId,
  onRefetch,
}: RequiredActionProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { actions, loading } = useApplicationActions(applicationId);
  const { showToast } = useToast();
  const { download: downloadHealthDeclarationForm, downloading: downloadingHealthDeclarationForm } =
    useHealthDeclarationFormDownload();

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
    } catch (err: unknown) {
      showToast(parseApiError(err, "Upload failed"), "error");
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
        await api.delete("/storage/file", { data: { file_key: doc.file_key } });
      } catch (err: unknown) {
        showToast(parseApiError(err, "Failed to delete file from storage"), "error");
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

    const required = docTypes.filter((d) => d.is_required_for_current_upload);

    if (required.length > 0) {
      required.forEach((docType) => {
        const uploaded = documents.find(
          (d) => d.document_type_id === docType.id && d.file_url && !d.uploading
        );
        if (!uploaded) {
          newErrors[`documents.${docType.id}`] = "required";
        }
      });
    } else if (!freeUpload && !documents.some((d) => d.file_url && !d.uploading)) {
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
          ...(d.document_type_id !== FREE_UPLOAD_ID && { document_type_id: d.document_type_id }),
          file_url: d.file_url,
          file_key: d.file_key,
        }));

      await api.post(`/applications/${applicationId}/requested-documents/bulk`, payload);
      showToast("Documents submitted successfully.", "success");
      onConfirm?.(applicationId, payload.map((d) => d.document_type_id));
      onClose();
      onRefetch?.();
    } catch (err: unknown) {
      showToast(parseApiError(err, "Failed to submit documents."), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const docTypes: DocumentType[] = actions?.document_types ?? [];
  const arrivalFormTemplate = (actions as any)?.arrival_documents?.find((d: any) => d.document_type === "Arrival Form Template");
  const requiresMedicalReportEmgs = docTypes.some(
    (d) => d.code === "medical_report_emgs" && d.is_required_for_current_upload
  );
  const freeUpload = docTypes.length === 0 && !!actions?.manager_allowed_next_statuses?.[0]?.is_requires_document_selection;
  const requiredDocTypes = docTypes.filter((d) => d.is_required_for_current_upload);
  const uploadedDocs = documents.filter((d) => d.file_url && !d.uploading);
  const allRequiredUploaded =
    freeUpload
      ? true
      : requiredDocTypes.length > 0
        ? requiredDocTypes.every((d) =>
            documents.some(
              (doc) => doc.document_type_id === d.id && doc.file_url && !doc.uploading
            )
          )
        : uploadedDocs.length > 0;
  const anyUploading = documents.some((d) => d.uploading);


  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="lg"
      icon={Pause}
      title="Required Documents"
      onSubmit={handleConfirm}
      submitLabel="Confirm"
      submitting={isSubmitting}
      submitDisabled={!allRequiredUploaded || anyUploading}
    >
      <div className="grid gap-4">

          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3" aria-busy="true" aria-label="Loading documents">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : docTypes.length > 0 ? (
              <>
                {actions?.correction_reason && (
                  <Alert tone="warning">{actions.correction_reason}</Alert>
                )}
                {arrivalFormTemplate?.file_key && (
                  <div className="flex items-center justify-between rounded-ub-md border border-ub-tone-brand-border bg-ub-tone-brand-bg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-ub-text-link" />
                      <div>
                        <p className="text-ub-body-sm font-medium text-ub-text-link">Arrival Form Template</p>
                        <p className="text-ub-caption text-ub-text-link">Download and complete this form before uploading</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocumentActions fileKey={arrivalFormTemplate.file_key} label="Arrival Form Template" />
                    </div>
                  </div>
                )}
                {requiresMedicalReportEmgs && (
                  <div className="flex items-center justify-between rounded-ub-md border border-ub-tone-brand-border bg-ub-tone-brand-bg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-ub-text-link" />
                      <div>
                        <p className="text-ub-body-sm font-medium text-ub-text-link">Health Declaration Form</p>
                        <p className="text-ub-caption text-ub-text-link">Required for visa processing (Lampiran B)</p>
                      </div>
                    </div>
                    <IconButton
                      onClick={downloadHealthDeclarationForm}
                      disabled={downloadingHealthDeclarationForm}
                      aria-label="Download Health Declaration Form"
                      variant="secondary"
                      size="sm"
                      icon={<Download className={`h-4 w-4 ${downloadingHealthDeclarationForm ? "motion-safe:animate-pulse" : ""}`} />}
                    />
                  </div>
                )}
                <DocumentUploadList
                  documentTypes={docTypes}
                  formData={formData}
                  errors={errors}
                  handleFileUpload={handleFileUpload}
                  removeDocument={removeDocument}
                  useCurrentUploadRequired
                />
              </>
            ) : freeUpload ? (
              <DocumentUploadList
                documentTypes={[{
                  id: FREE_UPLOAD_ID,
                  type: "Payment Proof",
                  code: "payment_proof",
                  description: "Upload payment proof if available",
                  is_init_app_doc: false,
                  is_required_for_init: false,
                  is_required_init_app_doc: false,
                  is_required_for_current_upload: true,
                }]}
                formData={formData}
                errors={errors}
                handleFileUpload={handleFileUpload}
                removeDocument={removeDocument}
                useCurrentUploadRequired
              />
            ) : (
              <NoDocumentsRequired
                title="No documents required"
                subtitle="This application does not require any document uploads."
              />
            )}
          </div>
      </div>
    </FormModal>
  );
}
