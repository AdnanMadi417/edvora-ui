import React from "react";
import FileUploadField from "components/form/filesUpload/FileUploadField";

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
                                         updateFormData,
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

      <div className="space-y-6">
        {documentTypes.map((docType) => (
          <FileUploadField
            key={docType.id}
            label={
              docType.is_required_init_app_doc
                ? `${docType.type} *`
                : `${docType.type} (Optional)`
            }
            field="documents"
            documentTypeId={docType.id}
            formData={formData}
            updateFormData={updateFormData}
            errors={{
              ...errors,
              documents: errors[`documents.${docType.id}`],
            }}
            uploadHandler={handleFileUpload}
            removeHandler={removeDocument}
            multiple={false}
            accept="application/pdf,image/*"
          />
        ))}
      </div>

      {errors.documents && (
        <p className="mt-2 text-xs text-red-600">{errors.documents}</p>
      )}
    </div>
  );
}