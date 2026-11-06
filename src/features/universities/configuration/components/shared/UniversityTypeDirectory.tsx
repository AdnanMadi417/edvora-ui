"use client";

import { useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import {
  useUniversityTypes,
  useDeleteUniversityType,
} from "features/universities/configuration/hooks";
import type { UniversityType } from "features/universities/configuration/types";
import DataTable, {
  sortRows,
  type DataTableColumn,
  type DataTableSort,
} from "components/ub/data/tables/DataTable";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import TablePagination from "components/ub/data/tables/TablePagination";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import IconButton from "components/ub/core/buttons/IconButton";
import Button from "components/ub/core/buttons/Button";
import Tag from "components/ub/data/badges/Tag";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import SelectInput from "components/ub/forms/selection/SelectInput";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

export default function UniversityTypeDirectory({
  basePath = "/admin/config-universities",
  allowDelete = true,
}: {
  basePath?: string;
  allowDelete?: boolean;
}) {
  const { universities, loading, error, refetchUniversityTypes } =
    useUniversityTypes();
  const { deleteUniversityType, isDeleting } = useDeleteUniversityType();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState("all");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const [target, setTarget] = useState<UniversityType | null>(null);
  const requiredCount = (type: UniversityType) =>
    type.required_fields.filter((field) => field.is_required).length;
  const columns: DataTableColumn<UniversityType>[] = [
    {
      key: "name",
      header: "University type",
      width: "320px",
      sortable: true,
      cell: (type) => (
        <div className="min-w-[220px] max-w-[340px] space-y-2 py-3">
          <p
            className="line-clamp-2 break-words text-ub-label-md text-ub-text-primary"
            title={type.name}
          >
            {type.name}
          </p>
          <p
            className="line-clamp-2 break-words text-ub-body-sm text-ub-text-secondary"
            title={type.description}
          >
            {type.description || "No description provided."}
          </p>
        </div>
      ),
    },
    {
      key: "required",
      header: "Required fields",
      sortable: true,
      sortValue: requiredCount,
      cell: (type) => <Tag hue="amber">{requiredCount(type)} required</Tag>,
    },
    {
      key: "optional",
      header: "Optional fields",
      sortable: true,
      sortValue: (type) => type.required_fields.length - requiredCount(type),
      cell: (type) => (
        <Tag hue="grey">
          {type.required_fields.length - requiredCount(type)} optional
        </Tag>
      ),
    },
    {
      key: "requirements",
      header: "Required at submission",
      cell: (type) => (
        <div className="min-w-[200px] max-w-[280px] space-y-1">
          {type.required_fields
            .filter((field) => field.is_required)
            .slice(0, 3)
            .map((field) => (
              <p
                key={field.id}
                className="truncate text-ub-body-sm text-ub-text-secondary"
                title={field.field_name}
              >
                {field.field_name}
              </p>
            ))}
          {requiredCount(type) > 3 && (
            <p className="text-ub-label-sm text-ub-text-link">
              +{requiredCount(type) - 3} more fields
            </p>
          )}
          {requiredCount(type) === 0 && (
            <span className="text-ub-text-tertiary">
              No additional required fields
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (type) => (
        <div className="flex flex-nowrap items-center gap-1">
          <LinkBtn
            href={`${basePath}/${type.id}`}
            title="View university type"
            variant="tertiary"
            size="sm"
            icon={<Eye className="h-4 w-4" />}
          />
          <LinkBtn
            href={`${basePath}/${type.id}/edit`}
            title="Edit university type"
            variant="secondary"
            size="sm"
            icon={<Pencil className="h-4 w-4" />}
          />
          {allowDelete && (
            <IconButton
              type="button"
              size="sm"
              variant="tertiary"
              title="Delete university type"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setTarget(type)}
            />
          )}
        </div>
      ),
    },
  ];
  const matching = universities.filter(
    (type) =>
      `${type.name} ${type.description || ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (filter === "all" ||
        (filter === "required"
          ? requiredCount(type) > 0
          : requiredCount(type) === 0))
  );
  const sorted = sortRows(matching, columns, sort);
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(sorted.length / 10))
  );
  const rows = sorted.slice((currentPage - 1) * 10, currentPage * 10);
  const remove = async () => {
    if (!target || !allowDelete) return;
    try {
      await deleteUniversityType(target.id);
      setTarget(null);
      showToast("University type deleted successfully.", "success");
      refetchUniversityTypes();
    } catch (error: unknown) {
      showToast(
        parseApiError(error, "Failed to delete university type."),
        "error"
      );
    }
  };
  return (
    <div className="mt-6 min-w-0 rounded-ub-lg border border-ub-border bg-ub-surface">
      <header className="flex flex-col justify-between gap-4 border-b border-ub-border p-4 sm:flex-row sm:items-center sm:p-6">
        <p className="text-ub-body-sm text-ub-text-secondary">
          Define the information needed for each institution category.
        </p>
        <LinkBtn
          href={`${basePath}/create`}
          label="Create type"
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          className="min-h-[44px] shrink-0"
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
          placeholder: "Search university types...",
        }}
        filters={
          <Button
            variant="secondary"
            text={filter === "all" ? "Filters" : "Filters (1)"}
            icon={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => {
              setDraft(filter);
              setOpen(true);
            }}
            className="min-h-[44px]"
          />
        }
        actions={<p role="status" className="whitespace-nowrap text-ub-label-sm text-ub-text-secondary">{matching.length} types</p>}
      />
      </div>
      <div className="min-w-0 p-3 sm:p-6">
        <p className="mb-2 text-ub-label-sm text-ub-text-tertiary md:hidden">
          Swipe across for more columns. Scroll within the table for more types.
        </p>
        <DataTable
          columns={columns}
          rows={rows}
          caption="University application requirement types"
          getRowId={(type) => type.id}
          getRowHref={(type) => `${basePath}/${type.id}`}
          loading={loading}
          error={error}
          onRetry={refetchUniversityTypes}
          sort={sort}
          onSortChange={(value) => {
            setSort(value);
            setPage(1);
          }}
          manualSort
          mobileLayout="scroll"
          scrollClassName="max-h-[65dvh] overflow-y-auto overscroll-contain"
          empty={{
            title: "No university types found",
            description:
              "Try changing your search or filters, or create a new type.",
          }}
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setPage}
              itemsPerPage={10}
              itemCount={rows.length}
              totalCount={matching.length}
              itemLabel="types"
              loading={loading}
            />
          }
        />
      </div>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filter university types"
        description="Find configurations by their application requirements."
        footer={
          <div className="grid w-full grid-cols-2 gap-3">
            <Button
              variant="secondary"
              text="Clear filters"
              onClick={() => {
                setFilter("all");
                setPage(1);
                setOpen(false);
              }}
            />
            <Button
              variant="primary"
              text="Apply filters"
              onClick={() => {
                setFilter(draft);
                setPage(1);
                setOpen(false);
              }}
            />
          </div>
        }
      >
        <p className="mb-2 text-ub-label-md text-ub-text-primary">
          Field requirements
        </p>
        <SelectInput
          field="filter"
          aria-label="Field requirements"
          formData={{ filter: draft }}
          options={[
            { value: "all", label: "All types" },
            { value: "required", label: "With required fields" },
            { value: "optional", label: "No required fields" },
          ]}
          updateFormData={(_, value) => setDraft(value)}
        />
      </Drawer>
      {allowDelete && (
        <FormModal
          open={!!target}
          onClose={() => setTarget(null)}
          title="Delete university type"
          description="Remove this institution category and its field configuration."
          onSubmit={remove}
          submitLabel="Delete type"
          submitTone="destructive"
          submitting={isDeleting}
        >
          <p className="text-ub-body-md text-ub-text-primary">
            Delete <strong>{target?.name}</strong>?
          </p>
        </FormModal>
      )}
    </div>
  );
}
