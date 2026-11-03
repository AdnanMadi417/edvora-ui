"use client";

import Alert from "components/ub/feedback/Alert";
import Combobox from "components/ub/forms/Combobox";
import Input from "components/ub/forms/Input";
import Textarea from "components/ub/forms/Textarea";
import FormModal from "components/ub/feedback/FormModal";
import React, { useState, useEffect } from "react";
import { Ban } from "lucide-react";

import { useVoidPayIn } from "../../hooks";
import type { UniversityPayIn } from "../../types";
import { useToast } from "components/ub/feedback/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

interface VoidPayInProps {
  isOpen: boolean;
  onClose: () => void;
  payIn: UniversityPayIn | null;
  onSuccess?: () => void;
}

const VOID_ERROR_MESSAGES: Record<string, string> = {
  pay_in_not_found: "This pay-in record could not be found — it may have already been removed.",
  pay_in_already_voided: "This pay-in has already been voided.",
  pay_in_void_wrong_state:
    "A payout already exists against this commission. That payout must be voided first.",
  pay_in_details_required: "All 5 corrected pay-in fields are required.",
  pay_in_currency_invalid: "Currency must be RM or USD.",
};

const INITIAL_FORM_DATA = {
  void_reason: "",
  new_payment_date: "",
  new_amount: "",
  new_currency: "RM",
  new_payment_reference: "",
};

export default function VoidPayIn({ isOpen, onClose, payIn, onSuccess }: VoidPayInProps) {
  const { voidPayIn, loading } = useVoidPayIn();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_DATA);
      setFormErrors({});
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  if (!payIn) return null;

  const validate = () => {
    const errors: any = {};

    if (!formData.void_reason.trim()) errors.void_reason = "Void reason is required";
    if (!formData.new_payment_date) errors.new_payment_date = "Payment date is required";
    if (!formData.new_amount || Number(formData.new_amount) <= 0) {
      errors.new_amount = "Enter a valid amount";
    }
    if (!formData.new_payment_reference.trim()) {
      errors.new_payment_reference = "Payment reference is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid =
    !!formData.void_reason.trim() &&
    !!formData.new_payment_date &&
    !!formData.new_amount &&
    !!formData.new_payment_reference.trim();

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await voidPayIn(payIn.id, {
        void_reason: formData.void_reason.trim(),
        new_payment_date: formData.new_payment_date,
        new_amount: formData.new_amount,
        new_currency: formData.new_currency,
        new_payment_reference: formData.new_payment_reference.trim(),
      });

      showToast("Pay-in voided and corrected.", "success");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      const msg = (code && VOID_ERROR_MESSAGES[code]) || parseApiError(err, "Failed to void pay-in.");
      showToast(msg, "error");
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="lg"
      icon={Ban}
      title="Void & Correct Pay-In"
      description="Every void must include the corrected replacement — the application stays at Commission Ready throughout."
      onSubmit={handleSubmit}
      submitLabel="Void & Correct"
      submitTone="destructive"
      submitting={loading}
      submitDisabled={!isFormValid}
    >
      <div className="grid gap-4">

          <div className="space-y-5">
            <div className="rounded-ub-md border border-ub-border bg-ub-surface-subtle p-4 text-ub-body-sm text-ub-text-secondary">
              <p>
                <span className="font-medium text-ub-text-primary">Current pay-in:</span>{" "}
                {payIn.currency} {Number(payIn.amount).toLocaleString()} · {payIn.payment_reference}
              </p>
            </div>

            <Textarea label="Void Reason" placeholder="Explain why this pay-in is being voided..." value={String(formData.void_reason ?? "")} onChange={(v) => updateFormData("void_reason", v)} error={formErrors.void_reason || undefined} />

            <div className="space-y-2">
              <p className="text-ub-body-md font-medium text-ub-text-primary">
                Corrected Pay-In <span className="text-ub-tone-danger-text">*</span>
              </p>
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <Input label="Payment Date" type="date" value={String(formData.new_payment_date ?? "")} onChange={(v) => updateFormData("new_payment_date", v)} error={formErrors.new_payment_date || undefined} />
                <Input label="Amount" placeholder="Enter amount" type="number" value={String(formData.new_amount ?? "")} onChange={(v) => updateFormData("new_amount", v)} error={formErrors.new_amount || undefined} />
                <Combobox label="Currency" options={[
                    { value: "RM", label: "RM" },
                    { value: "USD", label: "USD" },
                  ]} value={formData.new_currency ? String(formData.new_currency) : null} onChange={(v) => updateFormData("new_currency", v ?? "")} error={formErrors.new_currency || undefined} />
                <Input label="Payment Reference" placeholder="e.g. UNI-REF-CORRECTED" value={String(formData.new_payment_reference ?? "")} onChange={(v) => updateFormData("new_payment_reference", v)} error={formErrors.new_payment_reference || undefined} />
              </div>
            </div>

            <Alert tone="warning">The void only commits if the replacement is valid — a bad replacement leaves the original
                pay-in completely untouched.</Alert>
          </div>
      </div>
    </FormModal>
  );
}
