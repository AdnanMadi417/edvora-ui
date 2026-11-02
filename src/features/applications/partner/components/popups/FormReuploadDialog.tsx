"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import Button from "components/ub/core/Button";
import CompactFileUpload from "components/ub/forms/CompactFileUpload";
import Alert from "components/ub/feedback/Alert";
import Modal from "components/ub/feedback/Modal";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

export interface FormReuploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  correctionReason?: string | null;
  onRefetch?: () => void;
  /** Sentence-case form name, e.g. "application form". */
  formName: string;
  /** Field id for the file input. */
  fieldId: string;
  /** Uploads the corrected file; throws on failure. */
  upload: (file: File, applicationId: string) => Promise<unknown>;
  isUploading: boolean;
  /** Backend error codes mapped to readable messages. */
  errorMessages?: Record<string, string>;
}

/**
 * Re-upload one rejected offer-letter form (brief §4.7 Modal): the rejection
 * reason, one file field, Cancel and "Submit <form>". Shared by the five
 * form-specific popups, which differ only in their upload hook.
 */
export default function FormReuploadDialog({ isOpen, onClose, applicationId, correctionReason, onRefetch, formName, fieldId, upload, isUploading, errorMessages = {} }: FormReuploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const label = formName.charAt(0).toUpperCase() + formName.slice(1);

  const close = () => {
    setFile(null);
    setFileError("");
    setUploadError("");
    onClose();
  };

  const submit = async () => {
    if (!file) return;
    setUploadError("");
    try {
      await upload(file, applicationId);
      close();
      onRefetch?.();
    } catch (error: unknown) {
      const code = getApiErrorCode(error);
      setUploadError((code && errorMessages[code]) || parseApiError(error, `Couldn't upload the ${formName}. Try again.`));
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={close}
      closeOnScrimClick={!isUploading}
      title={`Re-upload the ${formName}`}
      description={`The ${formName} was rejected. Upload a corrected copy to resubmit.`}
      footer={
        <>
          <Button variant="secondary" text="Cancel" onClick={close} disabled={isUploading} />
          <Button variant="primary" text={`Submit ${formName}`} icon={<Upload className="h-4 w-4" aria-hidden="true" />} onClick={submit} loading={isUploading} disabled={!file || !!fileError || !!uploadError} />
        </>
      }
    >
      <div className="grid gap-4">
        {correctionReason && (
          <Alert tone="warning" title="Reason for rejection">
            {correctionReason}
          </Alert>
        )}
        <CompactFileUpload
          label={label}
          description={`Upload the corrected ${formName}`}
          id={fieldId}
          file={file}
          onFileChange={(f: File) => {
            setFile(f);
            setUploadError("");
          }}
          onRemove={() => {
            setFile(null);
            setUploadError("");
          }}
          onError={setFileError}
          disabled={isUploading}
          required
        />
        {(fileError || uploadError) && <Alert tone="danger">{fileError || uploadError}</Alert>}
      </div>
    </Modal>
  );
}
