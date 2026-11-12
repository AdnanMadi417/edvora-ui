"use client";

import FormModal from "components/ub/feedback/dialogs/FormModal";
import React, { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import Alert from "components/ub/feedback/notifications/Alert";
import DocumentUpload from "components/ub/forms/uploads/DocumentUpload";

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
    <FormModal
      open={isOpen}
      onClose={handleClose}
      size="md"
      icon={RotateCcw}
      title="Request document upload"
      description="Ask the applicant to upload the required document."
      onSubmit={handleConfirm}
      submitLabel="Confirm upload"
      submitDisabled={!selectedFile}
    >
      <div className="grid gap-4">
        <Alert tone="warning">
          This action will request the applicant to upload the required document. Make sure the file is clear,
          properly formatted, and within allowed size limits.
        </Alert>

        <DocumentUpload
          id="resubmitFile"
          label="Upload document"
          file={selectedFile}
          onFileChange={setSelectedFile}
          onRemove={() => setSelectedFile(null)}
          required
        />
      </div>
    </FormModal>
  );
}
