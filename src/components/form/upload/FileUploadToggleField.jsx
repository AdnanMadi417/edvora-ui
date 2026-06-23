import { Upload, Trash2, FileCheck } from "lucide-react";
import React from "react";

const FileUploadToggleField = ({
                                 toggleLabel,
                                 uploadLabel,
                                 field,
                                 documentTypeId,
                                 formData,
                                 errors,
                                 required = false,
                                 multiple = false,
                                 accept = "*",
                                 enabled = false,
                                 onToggle,
                                 uploadHandler,
                                 removeHandler,
                               }) => {
  const documents = formData?.[field] || [];

  const file = documents.find(
    (d) => d.document_type_id === documentTypeId
  );

  const handleUpload = async (e) => {
    if (!uploadHandler) return;
    await uploadHandler(e, documentTypeId);
    e.target.value = "";
  };

  const handleRemove = async () => {
    if (!removeHandler) return;
    await removeHandler(documentTypeId);
  };

  return (
    <div className="mb-6">

      <div className="rounded-lg border border-slate-200 bg-white transition hover:border-slate-300">

        {/* Toggle Header */}
        <div className="flex items-center justify-between px-4 py-3">

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {toggleLabel}
              {required && <span className="ml-1 text-red-600">*</span>}
            </p>

            <p className="truncate text-xs text-slate-400">
              Enable to allow file upload
            </p>
          </div>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={enabled}
              onChange={onToggle}
              className="peer sr-only"
            />

            <div className="h-6 w-11 rounded-lg bg-slate-300 transition-colors peer-checked:bg-blue-600" />

            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-lg bg-white shadow transition-transform peer-checked:translate-x-5" />
          </label>

        </div>

        {enabled && (
          <div className="space-y-4 border-t border-slate-100 px-4 py-4">

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {uploadLabel}
              </p>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50">

              <Upload className="mb-3 h-8 w-8 text-slate-400" />

              <p className="text-sm text-slate-600">
                Drag & drop or{" "}
                <span className="font-semibold text-blue-600 underline">
              browse
            </span>
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {accept === "*" ? "File upload supported" : accept}
              </p>

              <input
                type="file"
                multiple={multiple}
                accept={accept}
                className="hidden"
                onChange={handleUpload}
              />
            </label>

            {file && (
              <div className="rounded-lg border border-slate-200 bg-white p-4 transition">

                <div className="flex items-center justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                      <FileCheck className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {file.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {file.size}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemove}
                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>

                </div>

                {file.uploading && (
                  <div className="mt-4 h-1.5 w-full rounded-lg bg-slate-100">
                    <div
                      className="h-full rounded-lg bg-blue-500 transition-all duration-300"
                      style={{ width: `${file.progress || 0}%` }}
                    />
                  </div>
                )}

              </div>
            )}

            {errors?.[field] && (
              <p className="text-xs font-medium text-red-600">
                {errors[field]}
              </p>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default FileUploadToggleField;