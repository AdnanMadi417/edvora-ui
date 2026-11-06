"use client";
import { ArrowLeft, Download, FileText, Upload } from "lucide-react";
import { useDocumentType } from "../../hooks";
import { useTemplateDownload } from "../../hooks/useTemplateDownload";
import { templateStatus } from "../shared/DocumentTypesDirectory";
import Loading from "components/ub/feedback/states/Loading";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import IconButton from "components/ub/core/buttons/IconButton";
import Button from "components/ub/core/buttons/Button";
import Tag from "components/ub/data/badges/Tag";
const base = "/admin/document-types";
export default function DocumentTypeDetails({ id }: { id: string }) {
  const { documentTypes, loading, error, refetch } = useDocumentType();
  const { download, downloading } = useTemplateDownload();
  const type = documentTypes.find((type) => type.id === id);
  if (loading) return <Loading text="Loading document type..." />;
  if (error)
    return (
      <div role="alert" className="space-y-3 p-6">
        <p>{error}</p>
        <Button text="Try again" variant="secondary" onClick={refetch} />
      </div>
    );
  if (!type)
    return (
      <div className="space-y-4 p-6">
        <p>Document type not found.</p>
        <LinkBtn
          href={base}
          label="Back to document types"
          icon={<ArrowLeft className="h-4 w-4" />}
        />
      </div>
    );
  return (
    <section className="min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header className="flex flex-wrap items-start gap-3 border-b border-ub-border p-4 sm:p-6">
        <span className="rounded-ub-md bg-ub-tone-brand-bg p-3 text-ub-tone-brand-text">
          <FileText className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-ub-heading-md">{type.type}</h1>
          <p className="mt-1 break-all text-ub-body-sm text-ub-text-secondary">
            {type.code}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LinkBtn
            href={base}
            title="Back to document types"
            variant="tertiary"
            icon={<ArrowLeft className="h-4 w-4" />}
          />
          {type.static_template_file_key && (
            <IconButton
              title="View template"
              variant="tertiary"
              disabled={downloading}
              onClick={() => download(type.static_template_file_key)}
              icon={<Download className="h-4 w-4" />}
            />
          )}{" "}
          {type.has_static_template && (
            <LinkBtn
              href={`${base}/${id}/edit`}
              title={
                type.static_template_file_key
                  ? "Replace template"
                  : "Upload template"
              }
              variant="secondary"
              icon={<Upload className="h-4 w-4" />}
            />
          )}
        </div>
      </header>
      <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-ub-heading-sm">Description</h2>
          <p className="break-words text-ub-body-md text-ub-text-secondary">
            {type.description || "No description provided."}
          </p>
        </div>
        <dl className="space-y-4">
          <div>
            <dt className="mb-1 text-ub-label-sm text-ub-text-secondary">
              Template status
            </dt>
            <dd>
              <Tag
                hue={
                  !type.has_static_template
                    ? "grey"
                    : type.static_template_file_key
                    ? "teal"
                    : "amber"
                }
              >
                {templateStatus(type)}
              </Tag>
            </dd>
          </div>
          <div>
            <dt className="text-ub-label-sm text-ub-text-secondary">
              Initial application document
            </dt>
            <dd>{type.is_init_app_doc ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-ub-label-sm text-ub-text-secondary">
              Required at initial application
            </dt>
            <dd>
              {type.is_required_init_app_doc || type.is_required_for_init
                ? "Yes"
                : "No"}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
