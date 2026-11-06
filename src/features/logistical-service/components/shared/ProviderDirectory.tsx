"use client";
import { useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
  Truck,
} from "lucide-react";
import {
  useLogisticProviders,
  useDeleteLogisticProvider,
} from "features/logistical-service/hooks";
import type { ServiceProvider } from "features/logistical-service/types";
import DataTable, {
  sortRows,
  type DataTableColumn,
  type DataTableSort,
} from "components/ub/data/tables/DataTable";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import TablePagination from "components/ub/data/tables/TablePagination";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Tag from "components/ub/data/badges/Tag";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import SelectField from "components/ub/forms/selection/SelectField";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

export default function ProviderDirectory({
  basePath = "/admin/logistics-marketplace",
  allowDelete = true,
}: {
  basePath?: string;
  allowDelete?: boolean;
}) {
  const { serviceProviders, loading, error, refetch } = useLogisticProviders();
  const { deleteProvider, isDeleting } = useDeleteLogisticProvider();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "all", location: "all" });
  const [draft, setDraft] = useState(filters);
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<ServiceProvider | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const locations = Array.from(
    new Set(
      serviceProviders.map((provider) => provider.main_location).filter(Boolean)
    )
  ).sort();
  const matching = serviceProviders.filter(
    (provider) =>
      `${provider.name} ${provider.nationality} ${
        provider.main_location
      } ${provider.services_offered?.map((service) => service.name).join(" ")}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (filters.status === "all" ||
        (filters.status === "active"
          ? provider.is_active
          : !provider.is_active)) &&
      (filters.location === "all" ||
        provider.main_location === filters.location)
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(matching.length / 10))
  );
  const activeFilters =
    Number(filters.status !== "all") + Number(filters.location !== "all");
  const columns: DataTableColumn<ServiceProvider>[] = [
    {
      key: "name",
      header: "Provider",
      sortable: true,
      cell: (provider) => (
        <div className="max-w-xs space-y-1">
          <p
            className="line-clamp-2 break-words font-medium text-ub-text-primary"
            title={provider.name}
          >
            {provider.name}
          </p>
          <p className="text-ub-body-sm text-ub-text-secondary">
            {provider.nationality || "Nationality not provided"}
          </p>
        </div>
      ),
    },
    {
      key: "main_location",
      header: "Location",
      sortable: true,
      cell: (provider) => (
        <span className="break-words">
          {provider.main_location || "Not provided"}
        </span>
      ),
    },
    {
      key: "services",
      header: "Services",
      cell: (provider) => (
        <div className="flex max-w-xs flex-wrap gap-2">
          {provider.services_offered?.slice(0, 2).map((service) => (
            <Tag key={service.id} hue="sky">
              {service.name}
            </Tag>
          ))}
          {provider.services_offered?.length > 2 && (
            <Tag hue="grey">+{provider.services_offered.length - 2} more</Tag>
          )}
          {!provider.services_offered?.length && (
            <span>No services listed</span>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      cell: (provider) => (
        <Tag hue={provider.is_active ? "teal" : "grey"}>
          {provider.is_active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (provider) => (
        <div className="flex items-center gap-2">
          <LinkBtn
            href={`${basePath}/${provider.id}`}
            title={`View ${provider.name}`}
            variant="tertiary"
            icon={<Eye className="h-4 w-4" />}
          />
          <LinkBtn
            href={`${basePath}/${provider.id}/edit`}
            title={`Edit ${provider.name}`}
            variant="secondary"
            icon={<Pencil className="h-4 w-4" />}
          />
          {allowDelete && (
            <IconButton
              title={`Delete ${provider.name}`}
              variant="tertiary"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setTarget(provider)}
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
  async function remove() {
    if (!target) return;
    try {
      await deleteProvider(target.id);
      setTarget(null);
      refetch();
      showToast("Provider deleted.", "success");
    } catch (err) {
      showToast(parseApiError(err, "Unable to delete provider."), "error");
    }
  }
  return (
    <section className="min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header className="flex flex-col gap-4 border-b border-ub-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6 shrink-0 text-ub-primary" />
          <p className="text-ub-body-md text-ub-text-secondary">
            Manage logistics providers, service coverage, and student support
            packages.
          </p>
        </div>
        <LinkBtn
          href={`${basePath}/create`}
          label="Create provider"
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
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
            placeholder: "Search providers, locations, or services...",
          }}
          filters={
            <Button
              variant="secondary"
              text={activeFilters ? `Filters (${activeFilters})` : "Filters"}
              icon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={() => {
                setDraft(filters);
                setOpen(true);
              }}
            />
          }
          resultLabel={`${matching.length} providers`}
        />
      </div>
      <div className="min-w-0 p-3 sm:p-6">
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(provider) => provider.id}
          getRowHref={(provider) => `${basePath}/${provider.id}`}
          caption="Logistics providers"
          getRowClassName={() => "md:[&>td]:py-4"}
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
            title: "No providers found",
            description: "Try another search or clear your filters.",
          }}
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setPage}
              itemsPerPage={10}
              itemCount={rows.length}
              totalCount={matching.length}
              itemLabel="providers"
              loading={loading}
            />
          }
        />
      </div>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filter logistics providers"
        description="Choose provider availability and main location."
        footer={
          <>
            <Button
              variant="secondary"
              text="Clear filters"
              onClick={() => {
                const empty = { status: "all", location: "all" };
                setDraft(empty);
                setFilters(empty);
                setPage(1);
                setOpen(false);
              }}
            />
            <Button
              variant="primary"
              text="Apply filters"
              onClick={() => {
                setFilters(draft);
                setPage(1);
                setOpen(false);
              }}
            />
          </>
        }
      >
        <div className="space-y-6">
          <SelectField
            label="Status"
            field="status"
            formData={draft}
            errors={{}}
            updateFormData={(field, value) =>
              setDraft((prev) => ({ ...prev, [field]: String(value) }))
            }
            options={[
              { value: "all", label: "All statuses" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
          <SelectField
            label="Main location"
            field="location"
            formData={draft}
            errors={{}}
            updateFormData={(field, value) =>
              setDraft((prev) => ({ ...prev, [field]: String(value) }))
            }
            options={[
              { value: "all", label: "All locations" },
              ...locations.map((value) => ({ value, label: value })),
            ]}
          />
        </div>
      </Drawer>
      <FormModal
        open={Boolean(target)}
        onClose={() => {
          if (!isDeleting) setTarget(null);
        }}
        title="Delete logistics provider"
        description="Confirm removal of this provider."
        onSubmit={remove}
        submitLabel="Delete provider"
        submitTone="destructive"
        submitting={isDeleting}
        icon={Trash2}
      >
        <p className="break-words">Delete “{target?.name}”?</p>
      </FormModal>
    </section>
  );
}
