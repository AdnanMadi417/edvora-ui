"use client";

import Alert from "components/ub/feedback/notifications/Alert";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { useEmgsEvalUpload } from "features/applications/hooks";
import CompactFileUpload from "components/ub/forms/uploads/CompactFileUpload";
import { parseApiError } from "utils/parseApiError";

interface EmgsEvalUploadProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onRefetch?: () => void;
}

export default function EmgsEvalUpload({
  isOpen,
  onClose,
  applicationId,
  onRefetch,
}: EmgsEvalUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const { uploadEmgsEval, isUploading } = useEmgsEvalUpload();

  const handleConfirmUpload = async () => {
    if (!file) return;

    setUploadError("");
    try {
      await uploadEmgsEval(file, applicationId);
      handleClose();
      onRefetch?.();
    } catch (error: unknown) {
      setUploadError(parseApiError(error, "Failed to upload EMGS eval document"));
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
      icon={FileText}
      title="Upload EMGS Eval Document"
      description="Upload the eval document to proceed"
      onSubmit={handleConfirmUpload}
      submitLabel="Submit Document"
      submitting={isUploading}
      submitDisabled={!file || !!fileError || !!uploadError}
    >
      <div className="grid gap-4">

          <div className="space-y-6">
            <CompactFileUpload
              label="EMGS Eval Document"
              description="Upload the EMGS eval document downloaded from the EMGS portal"
              id="emgs_eval"
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
