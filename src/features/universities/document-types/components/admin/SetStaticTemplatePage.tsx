"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { useDocumentType, useSetStaticTemplate } from "../../hooks";
import { useTemplateDownload } from "../../hooks/useTemplateDownload";
import FormPage from "components/ub/forms/layout/FormPage";
import SelectField from "components/ub/forms/selection/SelectField";
import StatusFileUpload from "components/ub/forms/uploads/StatusFileUpload";
import Loading from "components/ub/feedback/states/Loading";
import Button from "components/ub/core/buttons/Button";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import {
  getPresignedUploads,
  uploadFilesToSpaces,
} from "services/uploadService";
const base = "/admin/document-types";
const ERROR_MESSAGES: Record<string, string> = {
  forbidden_admin_only: "Only admins can set a document template.",
  document_type_not_found: "This document type no longer exists.",
  document_type_static_template_not_supported:
    "This document type does not support a static template.",
};
export default function SetStaticTemplatePage({ id }: { id?: string }) {
  const { documentTypes, loading, error, refetch } = useDocumentType();
  const { setTemplate } = useSetStaticTemplate();
  const { downloading, download } = useTemplateDownload();
  const { showToast } = useToast();
  const router = useRouter();
  const [chosenId, setChosenId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const selectedId = id || chosenId;
  const selectedType = documentTypes.find((type) => type.id === selectedId);
  const templatable = documentTypes.filter((type) => type.has_static_template);
  const available =
    !loading && !error && (!id || Boolean(selectedType?.has_static_template));
  async function submit() {
    if (lock.current || !file || !selectedType?.has_static_template) return;
    lock.current = true;
    setBusy(true);
    setSubmitError("");
    try {
      const [presigned] = await getPresignedUploads(
        [file],
        "document-templates"
      );
      if (!presigned) throw new Error("Unable to prepare template upload.");
      const [uploaded] = await uploadFilesToSpaces([file], [presigned]);
      if (!uploaded?.file_key || !uploaded.public_url)
        throw new Error("File upload failed.");
      await setTemplate(selectedId, {
        file_key: uploaded.file_key,
        file_url: uploaded.public_url,
      });
      showToast("Template saved successfully.", "success");
      setFile(null);
      refetch();
      router.push(`${base}/${selectedId}`);
    } catch (err) {
      const code = getApiErrorCode(err);
      const message =
        (code && ERROR_MESSAGES[code]) ||
        parseApiError(err, "Unable to save template.");
      setSubmitError(message);
      showToast(message, "error");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <FormPage
      title={id ? "Update document template" : "Upload document template"}
      description="Upload the blank file advisers download, complete, and attach to applications."
      icon={Upload}
      onSubmit={submit}
      onCancel={() => router.push(id ? `${base}/${id}` : base)}
      submitLabel="Save template"
      submitting={busy}
      submitDisabled={!file || !selectedType?.has_static_template}
      showActions={Boolean(available && templatable.length)}
      stickyActions
    >
      {loading ? (
        <Loading text="Loading document types..." />
      ) : error ? (
        <div role="alert" className="space-y-3">
          <p>{error}</p>
          <Button text="Try again" variant="secondary" onClick={refetch} />
        </div>
      ) : id && !selectedType ? (
        <p>Document type not found.</p>
      ) : id && !selectedType?.has_static_template ? (
        <p>This document type does not use a static template.</p>
      ) : !templatable.length ? (
        <p>No document types currently support template uploads.</p>
      ) : (
        <div className="min-w-0 space-y-6">
          {id ? (
            <div className="space-y-1">
              <p className="text-ub-label-sm text-ub-text-secondary">
                Document type
              </p>
              <p className="break-words text-ub-heading-sm">
                {selectedType?.type}
              </p>
              <p className="break-words text-ub-body-sm text-ub-text-secondary">
                {selectedType?.description}
              </p>
            </div>
          ) : (
            <SelectField
              label="Document type"
              field="documentTypeId"
              required
              formData={{ documentTypeId: chosenId }}
              errors={{}}
              updateFormData={(_, value) => {
                setChosenId(String(value));
                setFile(null);
                setFileError("");
                setSubmitError("");
              }}
              options={templatable.map((type) => ({
                value: type.id,
                label: type.type,
              }))}
            />
          )}
          {selectedType?.static_template_file_key && (
            <div className="flex flex-col items-start gap-3 rounded-ub-md border border-ub-border bg-ub-surface-subtle p-4">
              <p className="text-ub-body-sm text-ub-text-secondary">
                A template is already available. Saving a new file will replace
                it.
              </p>
              <Button
                text="View current template"
                variant="secondary"
                icon={<Download className="h-4 w-4" />}
                onClick={() => download(selectedType.static_template_file_key)}
                loading={downloading}
              />
            </div>
          )}
          {selectedType?.has_static_template && (
            <StatusFileUpload
              label="Template file"
              description="Choose the blank document advisers should use."
              id="static_template_file"
              file={file}
              onFileChange={(value) => {
                setFile(value);
                setFileError("");
                setSubmitError("");
              }}
              onRemove={() => {
                setFile(null);
                setFileError("");
              }}
              onError={setFileError}
              disabled={busy}
              uploading={busy}
              required
            />
          )}
          {fileError && (
            <p role="alert" className="text-ub-body-sm text-ub-tone-danger-text">
              {fileError}
            </p>
          )}
          {submitError && (
            <p
              role="alert"
              className="rounded-ub-md border border-ub-tone-danger-border bg-ub-tone-danger-bg p-4 text-ub-tone-danger-text"
            >
              {submitError}
            </p>
          )}
        </div>
      )}
    </FormPage>
  );
}
