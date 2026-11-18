"use client";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";

import { useState } from "react";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { useAllFields, useDeleteField, type FieldOfStudy } from "../../hooks";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import Button from "components/ub/core/buttons/Button";
import ItemList from "components/ub/data/display/ItemList";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import SelectInput from "components/ub/forms/selection/SelectInput";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import CreateFieldOfStudy from "../admin/popups/CreateFieldOfStudy";
import UpdateField from "../admin/popups/UpdateField";
import FilterButton from "components/ub/core/buttons/FilterButton";

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
  const matching = fields
    .filter(
      (field) =>
        `${field.name} ${field.code || ""}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()) &&
        (status === "all" ||
          (status === "active" ? field.is_active : !field.is_active))
    )
    .sort((a, b) => a.name.localeCompare(b.name));
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
            },
            placeholder: "Search by field name or code...",
          }}
          filters={
            <FilterButton
              count={status === "all" ? 0 : 1}
              onClick={() => {
                setDraft(status);
                setFiltersOpen(true);
              }}
            />
          }
          resultLabel={`${matching.length} fields`}
        />
      </div>
      <ItemList
        label="Fields of study"
        items={matching}
        getId={(field) => field.id}
        getName={(field) => field.name}
        getStatus={(field) => ({ status: field.is_active })}
        getTag={(field) => field.code}
        onOpen={(field) => setViewing(field)}
        loading={fieldsLoading}
        error={fieldsError}
        onRetry={refetch}
        empty={{
          title: "No fields found",
          description: "Try another search or clear your filters.",
          icon: BookOpen,
        }}
        renderActions={(field) => (
          <TableActions label={field.name}>
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
        )}
      />
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
                setFiltersOpen(false);
              }}
            />
            <Button
              variant="primary"
              text="Apply filters"
              onClick={() => {
                setStatus(draft);
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
