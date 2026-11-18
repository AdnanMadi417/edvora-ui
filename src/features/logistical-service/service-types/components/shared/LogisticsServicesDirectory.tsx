"use client";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";
import { useState } from "react";
import { Pencil, Plus, Trash2, Truck } from "lucide-react";
import { useLogisticServices, useDeleteLogisticService } from "../../hooks";
import type { LogisticService } from "../../types";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import Button from "components/ub/core/buttons/Button";
import ItemList from "components/ub/data/display/ItemList";
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
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<LogisticService | null>(null);
  const [target, setTarget] = useState<LogisticService | null>(null);
  const matching = logisticServices
    .filter((service) =>
      service.name.toLowerCase().includes(search.trim().toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));
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
            },
            placeholder: "Search logistics services...",
          }}
          resultLabel={`${matching.length} services`}
        />
      </div>
      <ItemList
        label="Logistics service types"
        items={matching}
        getId={(service) => service.id}
        getName={(service) => service.name}
        loading={loadingLogisticServices}
        error={errorLogisticServices}
        onRetry={refetchLogisticServices}
        empty={{
          title: "No services found",
          description: "Try another search or create a service.",
          icon: Truck,
        }}
        renderActions={(service) => (
          <TableActions label={service.name}>
            <TableAction
              label={`Edit ${service.name}`}
              icon={<Pencil className="h-4 w-4" />}
              onSelect={() => setEditing(service)}
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
        )}
      />
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
