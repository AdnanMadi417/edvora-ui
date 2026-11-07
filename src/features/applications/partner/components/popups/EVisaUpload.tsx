"use client";

import Alert from "components/ub/feedback/notifications/Alert";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import React, { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { useEVisaUpload } from "features/applications/hooks";
import DocumentUpload from "components/ub/forms/uploads/DocumentUpload";
import { parseApiError } from "utils/parseApiError";

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
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const { uploadEVisa, isUploading } = useEVisaUpload();

  const handleConfirmUpload = async () => {
    if (!file) return;
    setUploadError("");
    try {
      await uploadEVisa(file, applicationId);
      handleClose();
      onRefetch?.();
    } catch (error: unknown) {
      setUploadError(parseApiError(error, "Failed to upload e-visa document"));
    }
  };

  const handleClose = () => {
    setFile(null);
    setFileError("");
    setUploadError("");
    onClose();
  };


  return (
    <FormModal
      open={isOpen}
      onClose={handleClose}
      size="md"
      icon={ShieldCheck}
      title="Upload E-Visa Document"
      description="Upload your e-visa document to proceed with enrollment"
      onSubmit={handleConfirmUpload}
      submitLabel="Submit E-Visa"
      submitting={isUploading}
      submitDisabled={!file || !!fileError || !!uploadError}
    >
      <div className="grid gap-4">

          <div className="space-y-6">
            <DocumentUpload
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
              <Alert tone="danger">{fileError}</Alert>
            )}

            {uploadError && (
              <Alert tone="danger">{uploadError}</Alert>
            )}
          </div>
      </div>
    </FormModal>
  );
}
