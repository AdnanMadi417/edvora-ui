"use client";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { usePaymentMethod, useUpdatePaymentMethods } from "../../hooks";
import FormPage from "components/ub/forms/layout/FormPage";
import Loading from "components/ub/feedback/states/Loading";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import PaymentMethodFields from "../shared/PaymentMethodFields";
import { usePaymentMethodForm } from "../shared/usePaymentMethodForm";

export default function EditPaymentMethodDetails({
  id,
  redirectPath = `/admin/config-universities/payment-methods/${id}`,
  listPath = "/admin/config-universities/payment-methods",
}: {
  id: string;
  redirectPath?: string;
  listPath?: string;
  hideDelete?: boolean;
}) {
  const { paymentMethod, loading, error } = usePaymentMethod(id);
  const { updatePaymentMethods, loading: saving } = useUpdatePaymentMethods();
  const router = useRouter();
  const { showToast } = useToast();
  const form = usePaymentMethodForm(
    {
      name: paymentMethod?.name || "",
      description: paymentMethod?.description || "",
    },
    id
  );
  const changed =
    form.formData.name.trim() !== paymentMethod?.name ||
    form.formData.description.trim() !== (paymentMethod?.description || "");
  async function submit() {
    if (!paymentMethod || !form.validate()) return;
    try {
      await updatePaymentMethods(id, {
        name: form.formData.name.trim(),
        description: form.formData.description.trim(),
      });
      showToast("Payment method updated.", "success");
      router.push(redirectPath);
    } catch (err) {
      form.handleApiError(err, "Unable to update payment method.");
    }
  }
  return (
    <FormPage
      title="Edit payment method"
      description="Update the payment option and its description."
      icon={CreditCard}
      onSubmit={submit}
      onCancel={() => router.push(listPath)}
      submitLabel="Save changes"
      submitting={saving}
      submitDisabled={!changed || !form.valid}
      showActions={!loading && Boolean(paymentMethod)}
      stickyActions
    >
      {loading ? (
        <Loading text="Loading payment method..." />
      ) : error ? (
        <p role="alert">{error}</p>
      ) : !paymentMethod ? (
        <p>Payment method not found.</p>
      ) : (
        <PaymentMethodFields {...form} />
      )}
    </FormPage>
  );
}
