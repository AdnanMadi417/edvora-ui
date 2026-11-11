"use client";
import Breadcrumbs from "components/ub/navigation/links/Breadcrumbs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Pencil, Trash2 } from "lucide-react";
import { usePaymentMethod, useDeletePaymentMethod } from "../../hooks";
import Loading from "components/ub/feedback/states/Loading";
import RichTextDisplay from "components/ub/data/display/RichTextDisplay";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import IconButton from "components/ub/core/buttons/IconButton";
import DeletePaymentConfirmation from "./popups/DeletePaymentConfirmation";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
export default function PaymentMethodDetails({
  id,
  basePath = "/admin/config-universities/payment-methods",
  allowDelete = true,
}: {
  id: string;
  basePath?: string;
  allowDelete?: boolean;
}) {
  const { paymentMethod, loading, error } = usePaymentMethod(id);
  const { deletePayment, isDeleting } = useDeletePaymentMethod();
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  async function remove() {
    try {
      await deletePayment(id);
      showToast("Payment method deleted.", "success");
      router.push(basePath);
    } catch (err) {
      showToast(
        parseApiError(err, "Unable to delete payment method."),
        "error"
      );
    }
  }
  if (loading) return <Loading text="Loading payment method details..." />;
  if (error)
    return (
      <p role="alert" className="p-6">
        {error}
      </p>
    );
  if (!paymentMethod) return <p className="p-6">Payment method not found.</p>;
  return (
    <section className="min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header className="flex flex-wrap items-start gap-3 border-b border-ub-border p-4 sm:p-6">
        <span className="rounded-ub-md bg-ub-tone-brand-bg p-3 text-ub-tone-brand-text">
          <CreditCard className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <Breadcrumbs className="mb-1" items={[{ label: "Payment methods", href: basePath }, { label: paymentMethod.name }]} />
          <h1 className="break-words text-ub-heading-md text-ub-text-primary">
            {paymentMethod.name}
          </h1>
          <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
            University payment option
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LinkBtn
            href={`${basePath}/${id}/edit`}
            label="Edit payment method"
            variant="secondary"
            icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
          />
          {allowDelete && (
            <IconButton
              aria-label="Delete payment method"
              title="Delete payment method"
              variant="tertiary"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setDeleting(true)}
            />
          )}
        </div>
      </header>
      <div className="min-w-0 space-y-3 break-words p-4 sm:p-6">
        <h2 className="text-ub-heading-sm">Description</h2>
        {paymentMethod.description ? (
          <RichTextDisplay html={paymentMethod.description} />
        ) : (
          <p className="text-ub-text-secondary">No description provided.</p>
        )}
      </div>
      <DeletePaymentConfirmation
        isOpen={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={remove}
        isDeleting={isDeleting}
        paymentMethodName={paymentMethod.name}
      />
    </section>
  );
}
