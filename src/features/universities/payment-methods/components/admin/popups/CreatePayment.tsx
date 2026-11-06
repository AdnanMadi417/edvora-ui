"use client";
import { CreditCard } from "lucide-react";
import { useCreatePayment } from "../../../hooks";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import PaymentMethodFields from "../../shared/PaymentMethodFields";
import { usePaymentMethodForm } from "../../shared/usePaymentMethodForm";

export default function CreatePayment({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { createPayment, paymentLoading } = useCreatePayment();
  const { showToast } = useToast();
  const form = usePaymentMethodForm({ name: "", description: "" }, isOpen);
  const submit = async () => {
    if (!form.validate()) return;
    try {
      await createPayment({
        name: form.formData.name.trim(),
        description: form.formData.description.trim(),
      });
      showToast("Payment method created.", "success");
      onClose();
      onSuccess?.();
    } catch (error) {
      form.handleApiError(error, "Unable to create payment method.");
    }
  };
  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title="Create payment method"
      description="Add a payment option for university assignments."
      icon={CreditCard}
      onSubmit={submit}
      submitLabel="Create payment method"
      submitting={paymentLoading}
      submitDisabled={!form.valid}
    >
      <fieldset disabled={paymentLoading} className="min-w-0">
        <PaymentMethodFields {...form} />
      </fieldset>
    </FormModal>
  );
}
