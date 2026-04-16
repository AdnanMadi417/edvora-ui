import { Upload, Trash2, FileCheck, AlertCircle } from "lucide-react";
import React, { useState } from 'react';
import { ALLOWED_FILE_TYPES } from "services/uploadService";

const FileUploadField = ({
                           label,
                           field,
                           documentTypeId,
                           formData,
                           updateFormData,
                           errors,
                           required = false,
                           multiple = false,
                           accept = ALLOWED_FILE_TYPES.extensions.join(","),
                           uploadHandler,
                           removeHandler,
                         }) => {
  const [fileError, setFileError] = useState("");
  const documents = formData[field] || [];

  const file = documents.find(
    (d) => d.document_type_id === documentTypeId
  );

  const handleUpload = async (e) => {
    if (!uploadHandler) return;

    const selectedFile = e.target.files?.[0];
    if (selectedFile && !ALLOWED_FILE_TYPES.mimeTypes.includes(selectedFile.type)) {
      setFileError(`Invalid file type. Only ${ALLOWED_FILE_TYPES.label} files are allowed.`);
      e.target.value = "";
      return;
    }

    setFileError("");
    await uploadHandler(e, documentTypeId);
    e.target.value = "";
  };

  const handleRemove = async () => {
    if (!removeHandler) return;

    await removeHandler(documentTypeId);
  };

  return (
    <div className="group mb-6">
      <label className="mb-3 block text-sm font-semibold text-slate-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <div className="relative">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition-all duration-300 hover:border-blue-400 hover:bg-blue-50">

          <Upload className="mb-3 h-8 w-8 text-slate-400 group-hover:text-blue-500" />

          <p className="text-sm text-slate-600">
            Drag & drop or{" "}
            <span className="font-semibold text-blue-600 underline">
          browse
        </span>
          </p>

          <p className="mt-1 text-xs text-slate-400">
            PDF, JPG, PNG accepted
          </p>

          <input
            type="file"
            multiple={multiple}
            accept={accept}
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>

      {file && (
        <div
          className={`mt-4 rounded-md border p-4 transition ${
            file.file_key ? "border-slate-200 bg-white" : "border-red-400 bg-red-50"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 truncate">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-md ${
                  file.file_key ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                }`}
              >
                <FileCheck className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-semibold ${
                    file.file_key ? "text-slate-900" : "text-red-700"
                  }`}
                >
                  {file.name}
                </p>

                <p className={`text-xs ${file.file_key ? "text-slate-400" : "text-red-500"}`}>
                  {file.size}
                </p>
              </div>
            </div>

            {file.file_key && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center justify-center gap-2 rounded-md border border-red-600 bg-red-100 px-4 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-200"
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </button>
            )}
          </div>

          {file.uploading && (
            <div className={`mt-4 h-1.5 w-full rounded-md ${file.file_key ? "bg-green-200" : "bg-red-200"}`}>
              <div
                className={`h-full rounded-md ${file.file_key ? "bg-green-600" : "bg-red-600"} transition-all duration-300`}
                style={{ width: `${file.progress || 0}%` }}
              />
            </div>
          )}
        </div>
      )}

      {fileError && (
        <div className="mt-2 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="text-xs font-medium text-red-700">{fileError}</p>
        </div>
      )}

      {errors?.[field] && (
        <p className="mt-2 text-xs font-medium text-red-600">
          {errors[field]}
        </p>
      )}
    </div>
  );
};

export default FileUploadField;