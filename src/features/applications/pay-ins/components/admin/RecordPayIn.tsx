"use client";

import Combobox from "components/ub/forms/Combobox";
import Input from "components/ub/forms/Input";
import FormModal from "components/ub/feedback/FormModal";
import React, { useState, useEffect } from "react";
import { Receipt } from "lucide-react";

import { useRecordPayIn } from "../../hooks";
import { useToast } from "components/ub/feedback/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

export interface RecordPayInRow {
  application_id: string;
  reference: string;
  student_name: string;
}

interface RecordPayInProps {
  isOpen: boolean;
  onClose: () => void;
  row: RecordPayInRow | null;
  onSuccess?: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  application_not_found: "This application could not be found — it may have been removed.",
  application_inactive: "This application is no longer active.",
  application_not_ready: "This application has no stage/status yet.",
  invalid_status_for_pay_in:
    "This application isn't at Awaiting Commission — it may already have a pay-in recorded, or be past this stage.",
  pay_in_already_recorded: "A pay-in has already been recorded for this application.",
  pay_in_currency_invalid: "Currency must be RM or USD.",
};

const INITIAL_FORM_DATA = {
  payment_date: "",
  amount: "",
  currency: "RM",
  payment_reference: "",
};

export default function RecordPayIn({ isOpen, onClose, row, onSuccess }: RecordPayInProps) {
  const { recordPayIn, loading } = useRecordPayIn();
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

  if (!row) return null;

  const validate = () => {
    const errors: any = {};

    if (!formData.payment_date) errors.payment_date = "Payment date is required";
    if (!formData.amount || Number(formData.amount) <= 0) {
      errors.amount = "Enter a valid amount";
    }
    if (!formData.payment_reference.trim()) {
      errors.payment_reference = "Payment reference is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid =
    !!formData.payment_date && !!formData.amount && !!formData.payment_reference.trim();

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await recordPayIn({
        application_id: row.application_id,
        payment_date: formData.payment_date,
        amount: formData.amount,
        currency: formData.currency,
        payment_reference: formData.payment_reference.trim(),
      });

      showToast("Pay-in recorded.", "success");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      const msg = (code && ERROR_MESSAGES[code]) || parseApiError(err, "Failed to record pay-in.");
      showToast(msg, "error");
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={Receipt}
      title="Record Pay-In"
      description="Record the university's payment for this application's commission."
      onSubmit={handleSubmit}
      submitLabel="Record Pay-In"
      submitting={loading}
      submitDisabled={!isFormValid}
    >
      <div className="grid gap-4">

          <div className="space-y-5">
            <div className="rounded-ub-md border border-ub-border bg-ub-surface-subtle p-4 text-ub-body-sm text-ub-text-secondary">
              <p>
                <span className="font-medium text-ub-text-primary">{row.reference}</span> · {row.student_name}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <Input label="Payment Date" type="date" value={String(formData.payment_date ?? "")} onChange={(v) => updateFormData("payment_date", v)} error={formErrors.payment_date || undefined} />
              <Input label="Amount" placeholder="Enter amount" type="number" value={String(formData.amount ?? "")} onChange={(v) => updateFormData("amount", v)} error={formErrors.amount || undefined} />
              <Combobox label="Currency" options={[
                  { value: "RM", label: "RM" },
                  { value: "USD", label: "USD" },
                ]} value={formData.currency ? String(formData.currency) : null} onChange={(v) => updateFormData("currency", v ?? "")} error={formErrors.currency || undefined} />
              <Input label="Payment Reference" placeholder="e.g. UNI-REF-001" value={String(formData.payment_reference ?? "")} onChange={(v) => updateFormData("payment_reference", v)} error={formErrors.payment_reference || undefined} />
            </div>
          </div>
      </div>
    </FormModal>
  );
}
