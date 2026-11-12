import React, { useState } from "react";
import { ALLOWED_FILE_TYPES } from "services/uploadService";
import { FormDataType, DocumentType } from "features/applications/partner/components/form/utility-functions/types";
import FileUpload, { FileUploadItem } from "components/ub/forms/uploads/FileUpload";
import Toggle from "components/ub/forms/choices/Toggle";
import ProgressBar from "components/ub/feedback/states/ProgressBar";
import Alert from "components/ub/feedback/notifications/Alert";
import Card from "components/ub/data/cards/Card";

interface Props {
  documentTypes: DocumentType[];
  formData: FormDataType;
  errors: Record<string, string | undefined>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  removeDocument: (docTypeId: string) => void;
  useCurrentUploadRequired?: boolean;
}

function DocRow({
  docType,
  isRequired,
  formData,
  errors,
  handleFileUpload,
  removeDocument,
}: {
  docType: DocumentType;
  isRequired: boolean;
  formData: FormDataType;
  errors: Record<string, string | undefined>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  removeDocument: (docTypeId: string) => void;
}) {
  const file = formData.documents?.find((d) => d.document_type_id === docType.id);
  const error =
    errors[`documents.${docType.id}`] === "required" ? "This document is required" : errors[`documents.${docType.id}`];

  const files: FileUploadItem[] = file
    ? [
        {
          id: docType.id,
          name: file.name ?? docType.type,
          status: file.uploading ? "uploading" : "uploaded",
          progress: file.progress ?? 0,
        },
      ]
    : [];

  // The rest of this form's handleFileUpload only ever reads `e.target.files`
  // (see ProgramApplicationForm.tsx/StudentRegistrationForm.tsx), so a picked
  // or dropped file is handed to it the same way.
  const onSelect = (picked: File[]) =>
    handleFileUpload({ target: { files: picked } } as unknown as React.ChangeEvent<HTMLInputElement>, docType.id);

  return (
    <FileUpload
      label={docType.type}
      description={docType.description || undefined}
      accept={ALLOWED_FILE_TYPES.extensions}
      files={files}
      onSelect={onSelect}
      onRemove={() => removeDocument(docType.id)}
      error={error || undefined}
      required={isRequired}
    />
  );
}

export default function DocumentUploadList({
  documentTypes,
  formData,
  errors,
  handleFileUpload,
  removeDocument,
  useCurrentUploadRequired = false,
}: Props) {
  const [showOptional, setShowOptional] = useState(false);
  const isReq = (d: DocumentType) =>
    useCurrentUploadRequired
      ? d.is_required_for_current_upload
      : (d.is_required_for_init ?? d.is_required_init_app_doc);

  const sorted = [...documentTypes].sort((a, b) => {
    if (isReq(a) !== isReq(b)) return isReq(a) ? -1 : 1;
    return a.type.localeCompare(b.type);
  });

  const required = sorted.filter(isReq);
  const optional = sorted.filter((d) => !isReq(d));

  const uploadedRequired = required.filter((d) =>
    formData.documents?.some(
      (doc) => doc.document_type_id === d.id && doc.file_key && !doc.uploading
    )
  ).length;

  const allDone = required.length > 0 && uploadedRequired === required.length;

  const rowProps = { formData, errors, handleFileUpload, removeDocument };

  return (
    <div className="space-y-4">
      {required.length > 0 && (
        <Card extra="p-4">
          <ProgressBar
            label="Required documents"
            value={uploadedRequired}
            max={required.length}
            valueText={`${uploadedRequired} of ${required.length}`}
            tone={allDone ? "success" : "brand"}
          />
        </Card>
      )}

      {required.map((docType) => (
        <DocRow key={docType.id} docType={docType} isRequired {...rowProps} />
      ))}

      {optional.length > 0 && (
        <Card extra="px-4 py-3">
          <Toggle
            checked={showOptional}
            onChange={setShowOptional}
            label="Optional documents"
            description={`${optional.length} document${optional.length !== 1 ? "s" : ""} available`}
            switchPosition="end"
          />
        </Card>
      )}

      {optional.length > 0 &&
        showOptional &&
        optional.map((docType) => <DocRow key={docType.id} docType={docType} isRequired={false} {...rowProps} />)}

      {errors.documents && <Alert tone="danger">{errors.documents}</Alert>}
    </div>
  );
}
