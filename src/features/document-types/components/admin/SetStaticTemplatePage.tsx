"use client";

import React, { useState } from "react";
import { FileText, Upload, Download } from "lucide-react";
import { useDocumentType } from "hooks/useDocumentType";
import { useSetStaticTemplate } from "features/document-types/hooks";
import SelectField from "components/ub/forms/SelectField";
import StatusFileUpload from "components/ub/forms/StatusFileUpload";
import Button from "components/ub/core/Button";
import { useToast } from "components/ub/feedback/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import { getDocumentDownloadUrl } from "services/documentService";

const ERROR_MESSAGES: Record<string, string> = {
  forbidden_admin_only: "Only admins can set a document template.",
  document_type_not_found: "This document type no longer exists — it may have been removed.",
  document_type_static_template_not_supported: "This document type doesn't support a static template.",
};

const SetStaticTemplatePage = () => {
  const { documentTypes, loading: loadingTypes } = useDocumentType();
  const { setTemplate, loading: submitting } = useSetStaticTemplate();
  const { showToast } = useToast();

  const [documentTypeId, setDocumentTypeId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [downloadingCurrent, setDownloadingCurrent] = useState(false);

  const templatableTypes = documentTypes.filter((dt) => dt.has_static_template);
  const selectedType = templatableTypes.find((dt) => dt.id === documentTypeId) ?? null;

  const isFormValid = !!documentTypeId && !!file;

  const handleDownloadCurrent = async () => {
    if (!selectedType?.static_template_file_key || downloadingCurrent) return;
    try {
      setDownloadingCurrent(true);
      const url = await getDocumentDownloadUrl(selectedType.static_template_file_key);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error: unknown) {
      showToast(parseApiError(error, "Failed to open current template."), "error");
    } finally {
      setDownloadingCurrent(false);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid || !file) return;

    try {
      const [presigned] = await getPresignedUploads([file], "document-templates");
      const [uploaded] = await uploadFilesToSpaces([file], [presigned]);
      if (!uploaded?.file_key || !uploaded?.public_url) {
        throw new Error("File upload failed");
      }

      await setTemplate(documentTypeId, { file_key: uploaded.file_key, file_url: uploaded.public_url });

      showToast("Template saved successfully", "success");
      setFile(null);
    } catch (error: unknown) {
      const code = getApiErrorCode(error);
      const msg = (code && ERROR_MESSAGES[code]) || parseApiError(error, "Failed to save template.");
      showToast(msg, "error");
    }
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto">
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Document Templates</h2>
            <p className="text-sm text-slate-500">Upload the blank template partners download for a document type.</p>
          </div>
        </div>

        <div className="border-t px-6 py-6">
          <SelectField
            label="Document Type"
            field="documentTypeId"
            required
            formData={{ documentTypeId }}
            errors={{}}
            updateFormData={(_: string, value: string) => {
              setDocumentTypeId(value);
              setFile(null);
            }}
            disabled={loadingTypes}
            options={templatableTypes.map((dt) => ({ value: dt.id, label: dt.type }))}
          />

          {selectedType?.static_template_file_key && (
            <button
              type="button"
              onClick={handleDownloadCurrent}
              disabled={downloadingCurrent}
              className="mb-4 -mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-3 w-3" />
              {downloadingCurrent ? "Opening..." : "Currently configured template — view"}
            </button>
          )}

          {documentTypeId && (
            <StatusFileUpload
              label="Template File"
              description="This file will be offered to partners as a blank template to download, fill, and re-upload."
              id="static_template_file"
              file={file}
              onFileChange={setFile}
              onRemove={() => setFile(null)}
              onError={setFileError}
              disabled={submitting}
              required
            />
          )}

          {fileError && <p className="mt-2 text-xs text-red-600">{fileError}</p>}
        </div>

        <div className="flex border-t border-slate-200 px-6 py-4">
          <Button
            onClick={handleSubmit}
            icon={<Upload className="h-5 w-5" />}
            text={submitting ? "Saving..." : "Save Template"}
            bgColor="bg-blue-600"
            textColor="text-white"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-white"
            hoverBorderColor="hover:border-blue-700"
            disabled={!isFormValid || submitting}
            className="flex-1 hover:bg-blue-700"
          />
        </div>
      </div>
    </div>
  );
};

export default SetStaticTemplatePage;
