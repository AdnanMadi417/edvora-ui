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
import { FormDataType, DocumentType } from "components/applications/form/utility-functions/types";

interface Props {
  documentTypes: DocumentType[];
  formData: FormDataType;
  errors: Record<string, string | undefined>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  removeDocument: (docTypeId: string) => void;
}

function DocRow({
  docType,
  formData,
  errors,
  handleFileUpload,
  removeDocument,
}: {
  docType: DocumentType;
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
  const isRequired = docType.is_required_init_app_doc;
  const errorMsg =
    fileError ||
    (errors[`documents.${docType.id}`] === "required"
      ? "This document is required"
      : errors[`documents.${docType.id}`]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && !ALLOWED_FILE_TYPES.mimeTypes.includes(selected.type)) {
      setFileError(`Invalid type. Allowed: ${ALLOWED_FILE_TYPES.label}`);
      e.target.value = "";
      return;
    }
    setFileError("");
    handleFileUpload(e, docType.id);
    if (inputRef.current) inputRef.current.value = "";
  };

  /* ── Uploaded state ─────────────────────────────────── */
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

  /* ── Uploading state ────────────────────────────────── */
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

  /* ── Empty / error state ────────────────────────────── */
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
        errorMsg
          ? "border-red-300 bg-red-50"
          : "border-dashed border-slate-300 bg-white"
      }`}
    >
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

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
      >
        <Upload className="h-4 w-4" />
        Upload
      </button>

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
}: Props) {
  const sorted = [...documentTypes].sort((a, b) => {
    if (a.is_required_init_app_doc !== b.is_required_init_app_doc)
      return a.is_required_init_app_doc ? -1 : 1;
    const order: Record<string, number> = { passport: 1, transcript: 2, ielts: 3 };
    return (order[a.code] ?? 99) - (order[b.code] ?? 99);
  });

  const required = sorted.filter((d) => d.is_required_init_app_doc);
  const optional = sorted.filter((d) => !d.is_required_init_app_doc);

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
      {/* Progress header card */}
      {required.length > 0 && (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
            <FileText className="h-7 w-7 text-slate-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-base font-bold text-slate-900">Required Documents</p>
              <span className="shrink-0 text-base font-bold text-slate-900">
                {uploadedRequired} of {required.length}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  allDone ? "bg-green-500" : "bg-slate-900"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Required doc cards */}
      {required.map((docType) => (
        <DocRow
          key={docType.id}
          docType={docType}
          formData={formData}
          errors={errors}
          handleFileUpload={handleFileUpload}
          removeDocument={removeDocument}
        />
      ))}

      {/* Optional section */}
      {optional.length > 0 && (
        <>
          <p className="pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Optional Documents
          </p>
          {optional.map((docType) => (
            <DocRow
              key={docType.id}
              docType={docType}
              formData={formData}
              errors={errors}
              handleFileUpload={handleFileUpload}
              removeDocument={removeDocument}
            />
          ))}
        </>
      )}

      {/* Global error (e.g. still loading) */}
      {errors.documents && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-xs text-red-600">{errors.documents}</p>
        </div>
      )}
    </div>
  );
}
