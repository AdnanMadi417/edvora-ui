import React, { useRef, useState } from "react";
import {
  Upload,
  X,
  FileText,
  FileCheck,
  Loader2,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import { ALLOWED_FILE_TYPES } from "services/uploadService";
import { FormDataType, DocumentType } from "features/applications/partner/components/form/utility-functions/types";
import Button from "components/ui/buttons/Button";
import { useFileDrop } from "components/form/upload/useFileDrop";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState("");

  const file = formData.documents?.find((d) => d.document_type_id === docType.id);
  const isUploaded = !!(file?.file_key && !file?.uploading);
  const isUploading = !!file?.uploading;
  const errorMsg =
    fileError ||
    (errors[`documents.${docType.id}`] === "required"
      ? "This document is required"
      : errors[`documents.${docType.id}`]);

  // Shared by the click-to-browse input and the drop handler below — the
  // rest of this form's handleFileUpload only ever reads `e.target.files`
  // (see ProgramApplicationForm.tsx/StudentRegistrationForm.tsx), so a
  // dropped file is handed to it the same way ImageUploadField's
  // document-management mode already does elsewhere in this codebase.
  const processFile = (selected: File | undefined) => {
    if (!selected) return;
    if (!ALLOWED_FILE_TYPES.mimeTypes.includes(selected.type)) {
      setFileError(`Invalid type. Allowed: ${ALLOWED_FILE_TYPES.label}`);
      return;
    }
    setFileError("");
    handleFileUpload({ target: { files: [selected] } } as unknown as React.ChangeEvent<HTMLInputElement>, docType.id);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    processFile(selected);
  };

  const { isDragging, dropHandlers } = useFileDrop({
    onFiles: (files) => processFile(files[0]),
  });

  if (isUploaded) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border bg-white p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100">
          <FileCheck className="h-5 w-5 text-green-600" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-bold text-slate-900">{docType.type}</p>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                isRequired ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {isRequired ? "Required" : "Optional"}
            </span>
          </div>

          {docType.description && (
            <p className="mt-0.5 text-xs text-slate-400">{docType.description}</p>
          )}

          <div className="mt-1">
            <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full text-xs font-medium text-slate-700">
              <Paperclip className="h-3 w-3 shrink-0" />
              <span className="truncate">{file?.name}</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => removeDocument(docType.id)}
          className="mt-0.5 shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-bold text-slate-900">{docType.type}</p>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                isRequired ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {isRequired ? "Required" : "Optional"}
            </span>
          </div>

          {docType.description && (
            <p className="mt-0.5 text-xs text-slate-400">{docType.description}</p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blue-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${file?.progress ?? 0}%` }}
              />
            </div>
            <span className="shrink-0 text-[10px] font-medium text-blue-600">
              {file?.progress ?? 0}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...dropHandlers}
      className={`block space-y-2 rounded-2xl border p-4 transition md:flex md:items-center md:gap-3 md:space-y-0 ${
        errorMsg
          ? "border-red-300 bg-red-50"
          : isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-dashed border-slate-300 bg-white"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            errorMsg ? "bg-red-100" : "bg-slate-100"
          }`}
        >
          <FileText className={`h-5 w-5 ${errorMsg ? "text-red-400" : "text-slate-400"}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-bold text-slate-900">{docType.type}</p>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                isRequired ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {isRequired ? "Required" : "Optional"}
            </span>
          </div>

          {docType.description && (
            <p className="mt-0.5 text-xs text-slate-400">{docType.description}</p>
          )}

          {errorMsg ? (
            <div className="mt-0.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0 text-red-500" />
              <p className="text-xs text-red-600">{errorMsg}</p>
            </div>
          ) : (
            <p className="mt-0.5 text-xs text-slate-300">PDF, JPG, PNG</p>
          )}
        </div>
      </div>

      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        icon={<Upload className="h-4 w-4" />}
        text="Upload"
        bgColor="bg-slate-100"
        textColor="text-slate-700"
        borderColor="border-slate-100"
        hoverTextColor="hover:text-slate-700"
        hoverBorderColor="hover:border-slate-200"
        className="w-full font-semibold hover:bg-slate-200 md:w-auto md:shrink-0"
      />

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_FILE_TYPES.extensions.join(",")}
        className="hidden"
        onChange={handleChange}
      />
    </div>
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
  const progressPct =
    required.length > 0 ? Math.round((uploadedRequired / required.length) * 100) : 100;

  return (
    <div className="space-y-3">
      {required.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
            <FileText className="h-7 w-7 text-slate-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="truncate text-sm font-bold text-slate-900 sm:text-base">Required Documents</p>
              <span className="shrink-0 text-sm font-bold text-slate-900 sm:text-base">
                {uploadedRequired} of {required.length}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  allDone ? "bg-green-500" : "bg-blue-600"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {required.map((docType) => (
        <DocRow
          key={docType.id}
          docType={docType}
          isRequired={true}
          formData={formData}
          errors={errors}
          handleFileUpload={handleFileUpload}
          removeDocument={removeDocument}
        />
      ))}

      {optional.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-700">Optional Documents</p>
            <p className="text-xs text-slate-400">{optional.length} document{optional.length !== 1 ? "s" : ""} available</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showOptional}
            onClick={() => setShowOptional((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              showOptional ? "bg-blue-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                showOptional ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      )}

      {optional.length > 0 && showOptional && (
        <>
          {optional.map((docType) => (
            <DocRow
              key={docType.id}
              docType={docType}
              isRequired={false}
              formData={formData}
              errors={errors}
              handleFileUpload={handleFileUpload}
              removeDocument={removeDocument}
            />
          ))}
        </>
      )}

      {errors.documents && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-xs text-red-600">{errors.documents}</p>
        </div>
      )}
    </div>
  );
}
