"use client";

import { useState } from "react";
import {
  CreditCard,
  Eye,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useAllPaymentMethods, useDeletePaymentMethod } from "../../hooks";
import type { PaymentMethod } from "../../types";
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
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import CreatePayment from "../admin/popups/CreatePayment";
import DeletePaymentConfirmation from "../admin/popups/DeletePaymentConfirmation";

export const descriptionText = (html?: string) =>
  (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function PaymentMethodsDirectory({
  basePath = "/admin/config-universities/payment-methods",
  allowDelete = true,
}: {
  basePath?: string;
  allowDelete?: boolean;
}) {
  const { paymentMethods, loading, error, refetch } = useAllPaymentMethods();
  const { deletePayment, isDeleting } = useDeletePaymentMethod();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [target, setTarget] = useState<PaymentMethod | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const matching = paymentMethods.filter((method) => {
    const description = descriptionText(method.description);
    return (
      `${method.name} ${description}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );
  });
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(matching.length / 10))
  );
  const columns: DataTableColumn<PaymentMethod>[] = [
    {
      key: "name",
      header: "Payment method",
      sortable: true,
      cell: (method) => (
        <span
          title={method.name}
          className="line-clamp-2 max-w-sm break-words font-medium text-ub-text-primary hover:text-ub-primary"
        >
          {method.name}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      sortValue: (method) => descriptionText(method.description),
      cell: (method) => (
        <p
          className="line-clamp-2 max-w-xl break-words text-ub-text-secondary"
          title={descriptionText(method.description)}
        >
          {descriptionText(method.description) || "No description provided."}
        </p>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (method) => (
        <div className="flex items-center gap-2">
          <LinkBtn
            href={`${basePath}/${method.id}`}
            aria-label={`View ${method.name}`}
            title={`View ${method.name}`}
            variant="tertiary"
            icon={<Eye className="h-4 w-4" />}
          />
          <LinkBtn
            href={`${basePath}/${method.id}/edit`}
            aria-label={`Edit ${method.name}`}
            title={`Edit ${method.name}`}
            variant="secondary"
            icon={<Pencil className="h-4 w-4" />}
          />
          {allowDelete && (
            <IconButton
              aria-label={`Delete ${method.name}`}
              title="Delete payment method"
              variant="tertiary"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setTarget(method)}
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
  const remove = async () => {
    if (!target) return;
    try {
      await deletePayment(target.id);
      setTarget(null);
      refetch();
      showToast("Payment method deleted.", "success");
    } catch (err) {
      showToast(
        parseApiError(err, "Unable to delete payment method."),
        "error"
      );
    }
  };
  return (
    <section className="min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header className="flex flex-col gap-4 border-b border-ub-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 shrink-0 text-ub-primary" />
          <p className="text-ub-body-md text-ub-text-secondary">
            Manage the payment options available for university assignments.
          </p>
        </div>
        <Button
          variant="primary"
          text="Create payment method"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setCreating(true)}
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
            placeholder: "Search payment methods...",
          }}
          resultLabel={`${matching.length} payment methods`}
        />
      </div>
      <div className="min-w-0 p-3 sm:p-6">
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(method) => method.id}
          getRowHref={(method) => `${basePath}/${method.id}`}
          caption="University payment methods"
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
            title: "No payment methods found",
            description: "Try another name or description.",
          }}
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setPage}
              itemsPerPage={10}
              itemCount={rows.length}
              totalCount={matching.length}
              itemLabel="payment methods"
              loading={loading}
            />
          }
        />
      </div>
      <CreatePayment
        isOpen={creating}
        onClose={() => setCreating(false)}
        onSuccess={refetch}
      />
      <DeletePaymentConfirmation
        isOpen={Boolean(target)}
        onClose={() => {
          if (!isDeleting) setTarget(null);
        }}
        onConfirm={remove}
        isDeleting={isDeleting}
        paymentMethodName={target?.name}
      />
    </section>
  );
}
