import React from "react";
import DocumentUploadList from "components/applications/form/stages/DocumentUploadList";

interface Props {
  formData: any;
  errors: Record<string, string | undefined>;
  updateFormData: (fieldPath: string, value: any) => void;
  documentTypes: any[];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  removeDocument: (doc: any) => void;
}

export default function StageDocuments({
  formData,
  errors,
  documentTypes,
  handleFileUpload,
  removeDocument,
}: Props) {
  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 flex items-center">
          <h4 className="text-lg font-semibold text-slate-900">
            Upload Required Documents
          </h4>
          <div className="ml-4 flex-1 border-t-2 border-slate-900 opacity-70"></div>
        </div>
        <p className="text-sm text-slate-800">
          Please upload all necessary documents to complete your application.
        </p>
      </div>

      <DocumentUploadList
        documentTypes={documentTypes}
        formData={formData}
        errors={errors}
        handleFileUpload={handleFileUpload}
        removeDocument={removeDocument}
      />
    </div>
  );
}
