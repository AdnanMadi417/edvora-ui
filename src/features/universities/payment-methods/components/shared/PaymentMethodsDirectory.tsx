"use client";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";

import { useState } from "react";
import { CreditCard, Pencil, Plus, Trash2 } from "lucide-react";
import { useAllPaymentMethods, useDeletePaymentMethod } from "../../hooks";
import type { PaymentMethod } from "../../types";
import Button from "components/ub/core/buttons/Button";
import ItemList from "components/ub/data/display/ItemList";
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

/**
 * A handful of options, so a plain list: the name opens the method, actions on
 * the right. The description lives on the method's page, not in the list.
 */
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
  const [creating, setCreating] = useState(false);
  const [target, setTarget] = useState<PaymentMethod | null>(null);
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
      <ItemList
        label="University payment methods"
        items={paymentMethods}
        getId={(method) => method.id}
        getName={(method) => method.name}
        getHref={(method) => `${basePath}/${method.id}`}
        loading={loading}
        error={error}
        onRetry={refetch}
        empty={{
          title: "No payment methods yet",
          description: "Create the first payment method universities can use.",
          icon: CreditCard,
        }}
        renderActions={(method) => (
          <TableActions label={method.name}>
            <TableAction
              label={`Edit ${method.name}`}
              icon={<Pencil className="h-4 w-4" />}
              href={`${basePath}/${method.id}/edit`}
              primary
            />
            {allowDelete && (
              <TableAction
                label={`Delete ${method.name}`}
                icon={<Trash2 className="h-4 w-4" />}
                onSelect={() => setTarget(method)}
                danger
              />
            )}
          </TableActions>
        )}
      />
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
