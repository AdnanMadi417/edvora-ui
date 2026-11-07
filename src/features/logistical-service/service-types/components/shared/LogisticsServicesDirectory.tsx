"use client";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";
import { useState } from "react";
import { Pencil, Plus, Trash2, Truck } from "lucide-react";
import { useLogisticServices, useDeleteLogisticService } from "../../hooks";
import type { LogisticService } from "../../types";
import DataTable, {
  sortRows,
  type DataTableColumn,
  type DataTableSort,
} from "components/ub/data/tables/DataTable";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import TablePagination from "components/ub/data/tables/TablePagination";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import CreateServiceType from "../admin/popups/CreateServiceType";
import EditServiceType from "../admin/popups/EditServiceType";
import DeleteServiceConfirmation from "../admin/popups/DeleteServiceConfirmation";
export default function LogisticsServicesDirectory({
  allowDelete = true,
}: {
  allowDelete?: boolean;
}) {
  const {
    logisticServices,
    loadingLogisticServices,
    errorLogisticServices,
    refetchLogisticServices,
  } = useLogisticServices();
  const { deleteLogisticService, isDeleting } = useDeleteLogisticService();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<LogisticService | null>(null);
  const [target, setTarget] = useState<LogisticService | null>(null);
  const matching = logisticServices.filter((service) =>
    service.name.toLowerCase().includes(search.trim().toLowerCase())
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(matching.length / 10))
  );
  const columns: DataTableColumn<LogisticService>[] = [
    {
      key: "name",
      header: "Service name",
      sortable: true,
      cell: (service) => (
        <p className="max-w-xl break-words font-medium text-ub-text-primary">
          {service.name}
        </p>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "144px",
      cell: (service) => (
        <TableActions>
          <TableAction
            label={`Edit ${service.name}`}
            icon={<Pencil className="h-4 w-4" />}
            onSelect={() => {
              setEditing(service);
            }}
            primary
          />
          {allowDelete && (
            <TableAction
              label={`Delete ${service.name}`}
              icon={<Trash2 className="h-4 w-4" />}
              onSelect={() => setTarget(service)}
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
  async function remove() {
    if (!target) return;
    try {
      await deleteLogisticService(target.id);
      setTarget(null);
      refetchLogisticServices();
      showToast("Service deleted.", "success");
    } catch (err) {
      showToast(parseApiError(err, "Unable to delete service."), "error");
    }
  }
  return (
    <section className="min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header className="flex flex-col gap-4 border-b border-ub-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6 shrink-0 text-ub-primary" />
          <p className="text-ub-body-md text-ub-text-secondary">
            Manage the services logistics providers can offer to students.
          </p>
        </div>
        <Button
          text="Create service"
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setCreating(true)}
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
            placeholder: "Search logistics services...",
          }}
          resultLabel={`${matching.length} services`}
        />
      </div>
      <div className="min-w-0 p-3 sm:p-6">
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(service) => service.id}
          caption="Logistics service types"
          getRowClassName={() => "md:[&>td]:py-4"}
          scrollClassName="max-h-[65dvh] overflow-y-auto overscroll-contain"
          loading={loadingLogisticServices}
          error={errorLogisticServices}
          onRetry={refetchLogisticServices}
          sort={sort}
          onSortChange={(value) => {
            setSort(value);
            setPage(1);
          }}
          manualSort
          empty={{
            title: "No services found",
            description: "Try another search or create a service.",
          }}
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setPage}
              itemsPerPage={10}
              itemCount={rows.length}
              totalCount={matching.length}
              itemLabel="services"
              loading={loadingLogisticServices}
            />
          }
        />
      </div>
      <CreateServiceType
        isOpen={creating}
        onClose={() => setCreating(false)}
        onCreated={refetchLogisticServices}
      />
      <EditServiceType
        service={editing}
        onClose={() => setEditing(null)}
        onUpdated={refetchLogisticServices}
      />
      <DeleteServiceConfirmation
        isOpen={Boolean(target)}
        onClose={() => setTarget(null)}
        onConfirm={remove}
        isDeleting={isDeleting}
        serviceName={target?.name}
      />
    </section>
  );
}
