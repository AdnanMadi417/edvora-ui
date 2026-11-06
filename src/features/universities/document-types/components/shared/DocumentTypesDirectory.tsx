"use client";
import { useState } from "react";
import { Eye, FileText, Upload } from "lucide-react";
import { useDocumentType } from "../../hooks";
import type { DocumentType } from "../../types";
import DataTable, {
  sortRows,
  type DataTableColumn,
  type DataTableSort,
} from "components/ub/data/tables/DataTable";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import TablePagination from "components/ub/data/tables/TablePagination";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Tag from "components/ub/data/badges/Tag";
const base = "/admin/document-types";
export const templateStatus = (type: DocumentType) =>
  !type.has_static_template
    ? "Not applicable"
    : type.static_template_file_key
    ? "Available"
    : "Missing template";
export default function DocumentTypesDirectory() {
  const { documentTypes, loading, error, refetch } = useDocumentType();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const matching = documentTypes.filter((type) =>
    `${type.type} ${type.code} ${type.description}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(matching.length / 10))
  );
  const columns: DataTableColumn<DocumentType>[] = [
    {
      key: "type",
      header: "Document type",
      sortable: true,
      cell: (type) => (
        <div className="max-w-sm space-y-1">
          <p
            className="line-clamp-2 break-words font-medium text-ub-text-primary"
            title={type.type}
          >
            {type.type}
          </p>
          <p className="break-all text-ub-caption text-ub-text-secondary">
            {type.code}
          </p>
        </div>
      ),
    },
    {
      key: "template",
      header: "Template",
      sortable: true,
      sortValue: templateStatus,
      cell: (type) => (
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
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (type) => (
        <div className="flex items-center gap-2">
          <LinkBtn
            href={`${base}/${type.id}`}
            title={`View ${type.type}`}
            variant="tertiary"
            icon={<Eye className="h-4 w-4" />}
          />
          {type.has_static_template && (
            <LinkBtn
              href={`${base}/${type.id}/edit`}
              title={`${type.static_template_file_key ? "Replace" : "Upload"} ${
                type.type
              } template`}
              variant="secondary"
              icon={<Upload className="h-4 w-4" />}
            />
          )}
        </div>
      ),
    },
  ];
  const rows = sortRows(matching, columns, sort).slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );
  return (
    <section className="min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header className="flex flex-col gap-4 border-b border-ub-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 shrink-0 text-ub-primary" />
          <p className="text-ub-body-md text-ub-text-secondary">
            Review document requirements and manage the blank templates advisers
            download.
          </p>
        </div>
        <LinkBtn
          href={`${base}/upload`}
          label="Upload template"
          variant="primary"
          icon={<Upload className="h-4 w-4" />}
          className="shrink-0"
        />
      </header>
      <div className="border-b border-ub-border p-4 sm:p-6">
        <DataTableToolbar
          className="!mb-0"
          search={{
            value: search,
            onChange: (value) => {
              setSearch(value);
              setPage(1);
            },
            placeholder: "Search document types...",
          }}
          resultLabel={`${matching.length} document types`}
        />
      </div>
      <div className="min-w-0 p-3 sm:p-6">
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(type) => type.id}
          getRowHref={(type) => `${base}/${type.id}`}
          caption="Document types and templates"
          loading={loading}
          error={error}
          onRetry={refetch}
          sort={sort}
          onSortChange={(value) => {
            setSort(value);
            setPage(1);
          }}
          manualSort
          scrollClassName="max-h-[65dvh] overflow-y-auto overscroll-contain"
          empty={{
            title: "No document types found",
            description: "Try another name, code, or description.",
          }}
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setPage}
              itemsPerPage={10}
              itemCount={rows.length}
              totalCount={matching.length}
              itemLabel="document types"
              loading={loading}
            />
          }
        />
      </div>
    </section>
  );
}
