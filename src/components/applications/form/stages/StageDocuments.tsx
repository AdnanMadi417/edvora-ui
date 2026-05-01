import React from "react";
import DocumentUploadList from "components/applications/form/stages/DocumentUploadList";

interface Props {
  formData: any;
  errors: Record<string, string | undefined>;
  updateFormData: (fieldPath: string, value: any) => void;
  documentTypes: any[];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  removeDocument: (doc: any) => void;
  loading?: boolean;
}

export default function StageDocuments({
  formData,
  errors,
  documentTypes,
  handleFileUpload,
  removeDocument,
  loading,
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

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
      ) : (
        <DocumentUploadList
          documentTypes={documentTypes}
          formData={formData}
          errors={errors}
          handleFileUpload={handleFileUpload}
          removeDocument={removeDocument}
        />
      )}
    </div>
  );
}
