"use client";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";

import { useState } from "react";
import {
  BookOpen,
  Eye,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useAllFields, useDeleteField, type FieldOfStudy } from "../../hooks";
import DataTable, {
  sortRows,
  type DataTableColumn,
  type DataTableSort,
} from "components/ub/data/tables/DataTable";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import TablePagination from "components/ub/data/tables/TablePagination";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import Tag from "components/ub/data/badges/Tag";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import SelectInput from "components/ub/forms/selection/SelectInput";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import CreateFieldOfStudy from "../admin/popups/CreateFieldOfStudy";
import UpdateField from "../admin/popups/UpdateField";

export default function FieldsOfStudyDirectory({
  allowDelete = true,
}: {
  allowDelete?: boolean;
}) {
  const { fields, fieldsLoading, fieldsError, refetch } = useAllFields();
  const { deleteField, isDeleting } = useDeleteField();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<FieldOfStudy | null>(null);
  const [viewing, setViewing] = useState<FieldOfStudy | null>(null);
  const [deleting, setDeleting] = useState<FieldOfStudy | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const matching = fields.filter(
    (field) =>
      `${field.name} ${field.code || ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (status === "all" ||
        (status === "active" ? field.is_active : !field.is_active))
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(matching.length / 10))
  );
  const columns: DataTableColumn<FieldOfStudy>[] = [
    {
      key: "name",
      header: "Field of study",
      sortable: true,
      cell: (field) => (
        <button
          type="button"
          onClick={() => setViewing(field)}
          className="max-w-sm break-words text-start font-medium text-ub-text-primary hover:text-ub-primary focus-visible:outline focus-visible:outline-2"
          title={field.name}
        >
          {field.name}
        </button>
      ),
    },
    {
      key: "code",
      header: "Code",
      sortable: true,
      cell: (field) => (
        <span className="break-words">{field.code || "Not assigned"}</span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      cell: (field) => (
        <Tag hue={field.is_active ? "teal" : "grey"}>
          {field.is_active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (field) => (
        <TableActions>
          <TableAction
            label={`View ${field.name}`}
            icon={<Eye className="h-4 w-4" />}
            onSelect={() => setViewing(field)}
          />
          <TableAction
            label={`Edit ${field.name}`}
            icon={<Pencil className="h-4 w-4" />}
            onSelect={() => setEditing(field)}
            primary
          />
          {allowDelete && (
            <TableAction
              label={`Delete ${field.name}`}
              icon={<Trash2 className="h-4 w-4" />}
              onSelect={() => setDeleting(field)}
              danger
            />
          )}
        </TableActions>
      ),
    },
  ];
  const rows = sortRows(matching, columns, sort).slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );
  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteField(deleting.id);
      setDeleting(null);
      refetch();
      showToast("Field of study deleted.", "success");
    } catch (error) {
      showToast(
        parseApiError(error, "Unable to delete field of study."),
        "error"
      );
    }
  }
  return (
    <section className="min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header className="flex flex-col gap-4 border-b border-ub-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 shrink-0 text-ub-primary" />
          <p className="text-ub-body-md text-ub-text-secondary">
            Manage study areas used to organise programs and help advisors find
            the right courses.
          </p>
        </div>
        <Button
          variant="primary"
          text="Create field"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setCreateOpen(true)}
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
            placeholder: "Search by field name or code...",
          }}
          filters={
            <Button
              variant="secondary"
              text={status === "all" ? "Filters" : "Filters (1)"}
              icon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={() => {
                setDraft(status);
                setFiltersOpen(true);
              }}
            />
          }
          resultLabel={`${matching.length} fields`}
        />
      </div>
      <div className="min-w-0 p-3 sm:p-6">
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(field) => field.id}
          caption="Fields of study"
          loading={fieldsLoading}
          error={fieldsError}
          onRetry={refetch}
          sort={sort}
          onSortChange={(value) => {
            setSort(value);
            setPage(1);
          }}
          manualSort
          scrollClassName="max-h-[65dvh] overflow-y-auto overscroll-contain"
          empty={{
            title: "No fields found",
            description: "Try another search or clear your filters.",
          }}
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setPage}
              itemsPerPage={10}
              itemCount={rows.length}
              totalCount={matching.length}
              itemLabel="fields"
              loading={fieldsLoading}
            />
          }
        />
      </div>
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter fields of study"
        description="Choose which study areas to display."
        footer={
          <>
            <Button
              variant="secondary"
              text="Clear filters"
              onClick={() => {
                setDraft("all");
                setStatus("all");
                setPage(1);
                setFiltersOpen(false);
              }}
            />
            <Button
              variant="primary"
              text="Apply filters"
              onClick={() => {
                setStatus(draft);
                setPage(1);
                setFiltersOpen(false);
              }}
            />
          </>
        }
      >
        <p className="mb-2 text-ub-label-md">Status</p>
        <SelectInput
          aria-label="Status"
          field="status"
          formData={{ status: draft }}
          updateFormData={(_, value) => setDraft(String(value))}
          options={[
            { value: "all", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </Drawer>
      <CreateFieldOfStudy
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={refetch}
      />
      <UpdateField
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        selectedField={editing}
        onSuccess={refetch}
      />
      <FormModal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        onSubmit={() => setViewing(null)}
        submitLabel="Done"
        title="Field of study details"
        description="Study area information and availability."
        icon={BookOpen}
      >
        <dl className="space-y-4">
          <div>
            <dt className="text-ub-label-sm text-ub-text-secondary">Name</dt>
            <dd className="break-words text-ub-body-md">{viewing?.name}</dd>
          </div>
          <div>
            <dt className="text-ub-label-sm text-ub-text-secondary">Code</dt>
            <dd>{viewing?.code || "Not assigned"}</dd>
          </div>
          <div>
            <dt className="text-ub-label-sm text-ub-text-secondary">Status</dt>
            <dd>{viewing?.is_active ? "Active" : "Inactive"}</dd>
          </div>
        </dl>
      </FormModal>
      <FormModal
        open={Boolean(deleting)}
        onClose={() => {
          if (!isDeleting) setDeleting(null);
        }}
        title="Delete field of study"
        description="Confirm removal of this study area."
        icon={Trash2}
        submitTone="destructive"
        submitLabel="Delete field"
        submitting={isDeleting}
        onSubmit={confirmDelete}
      >
        <p className="break-words">Delete “{deleting?.name}”?</p>
      </FormModal>
    </section>
  );
}
