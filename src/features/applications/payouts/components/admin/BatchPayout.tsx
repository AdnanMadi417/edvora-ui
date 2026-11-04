"use client";

import { FieldLabel } from "components/ub/forms/layout/FieldChrome";
import Card from "components/ub/data/cards/Card";
import Alert from "components/ub/feedback/notifications/Alert";
import Combobox from "components/ub/forms/selection/Combobox";
import Input from "components/ub/forms/text/Input";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";

import { useRecordBulkPayout, usePaymentMethods } from "../../hooks";
import { usePartnerBankAccount, BankAccountPayoutSummary } from "features/partners/bank-accounts";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import CompactFileUpload from "components/ub/forms/uploads/CompactFileUpload";

export interface BatchPayoutLine {
  application_id: string;
  reference: string;
  student_name: string;
  commission_amount: number | null;
}

interface BatchPayoutProps {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
  currency: string;
  lines: BatchPayoutLine[];
  onSuccess?: () => void;
}

export default function BatchPayout({ isOpen, onClose, partnerId, currency, lines, onSuccess }: BatchPayoutProps) {
  const { showToast } = useToast();
  const { account: partnerBankAccount } = usePartnerBankAccount(partnerId);
  const { recordBulkPayout, loading: recording } = useRecordBulkPayout();
  const { paymentMethods } = usePaymentMethods();
  const paymentMethodOptions = paymentMethods.map((m) => ({ value: m.id, label: m.name }));
  const [formData, setFormData] = useState({ payment_method_id: "", bank_reference: "", paid_at: "" });
  const [formErrors, setFormErrors] = useState<any>({});
  const [lineAmounts, setLineAmounts] = useState<Record<string, string>>({});
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setFormData({ payment_method_id: "", bank_reference: "", paid_at: "" });
      setFormErrors({});
      setLineAmounts(
        Object.fromEntries(
          lines.map((l) => [l.application_id, l.commission_amount != null ? String(l.commission_amount) : ""])
        )
      );
      setReceiptFile(null);
      setUploadProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };


  const validate = () => {
    const errors: any = {};
    if (!formData.payment_method_id.trim()) errors.payment_method_id = "Payment method is required";
    if (!formData.bank_reference.trim()) errors.bank_reference = "Bank reference is required";
    if (!formData.paid_at) errors.paid_at = "Payment date is required";

    const badLine = lines.some((l) => {
      const amount = lineAmounts[l.application_id];
      return !amount || Number(amount) <= 0;
    });

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return false;
    if (badLine) {
      showToast("Enter a valid amount for every application.", "error");
      return false;
    }
    if (!partnerBankAccount) {
      showToast("This advisor has no active bank account on file.", "error");
      return false;
    }
    if (!receiptFile) {
      showToast("Please upload the payout receipt.", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate() || !partnerBankAccount || !receiptFile) return;

    try {
      setUploading(true);
      const [presigned] = await getPresignedUploads([receiptFile], "finance-payouts");
      const [uploaded] = await uploadFilesToSpaces([receiptFile], [presigned], (_, percent) =>
        setUploadProgress(percent)
      );
      setUploading(false);

      await recordBulkPayout(partnerId, {
        bank_account_id: partnerBankAccount.id,
        payment_method_id: formData.payment_method_id.trim(),
        bank_reference: formData.bank_reference.trim(),
        paid_at: formData.paid_at,
        currency,
        receipt_file_key: uploaded.file_key,
        receipt_file_url: uploaded.public_url,
        lines: lines.map((l) => ({
          application_id: l.application_id,
          paid_amount: lineAmounts[l.application_id],
        })),
      });

      showToast("Payout recorded successfully.", "success");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      setUploading(false);
      showToast(parseApiError(err, "Failed to record payout."), "error");
    }
  };

  const isSubmitting = recording || uploading;
  const canSubmit = !isSubmitting && !!partnerBankAccount;

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="lg"
      icon={Wallet}
      title="Batch Payout"
      description="One bank reference and one receipt cover every selected application."
      onSubmit={handleSubmit}
      submitLabel="Record Payout"
      submitting={isSubmitting}
      submitDisabled={!canSubmit}
    >
      <div className="grid gap-4">

          <div className="space-y-5">
            <Card extra="p-3">
              <BankAccountPayoutSummary account={partnerBankAccount} />
              {!partnerBankAccount && (
                <Link
                  href={`/admin/advisors/${partnerId}?tab=bank-account`}
                  className="mt-1 block font-medium text-ub-text-link hover:text-ub-text-link"
                >
                  Add a bank account →
                </Link>
              )}
            </Card>

            <div className="space-y-2">
              <FieldLabel as="span">
                {lines.length} {lines.length === 1 ? "Application" : "Applications"} · {currency}
              </FieldLabel>
              <div className="space-y-2">
                {lines.map((l) => (
                  <div key={l.application_id} className="flex items-center gap-3">
                    <span className="flex-1 truncate text-ub-body-sm text-ub-text-secondary">
                      {l.reference} · {l.student_name}
                    </span>
                    <Input type="number" inputMode="decimal" label={`Amount for ${l.reference}`} hideLabel value={lineAmounts[l.application_id] ?? ""} onChange={(v) => setLineAmounts((prev) => ({ ...prev, [l.application_id]: v }))} wrapperClassName="w-32" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <Combobox label="Payment Method" placeholder="Search for a payment method..." options={paymentMethodOptions} value={formData.payment_method_id ? String(formData.payment_method_id) : null} onChange={(v) => updateFormData("payment_method_id", v ?? "")} error={formErrors.payment_method_id || undefined} />
              <Input label="Bank Reference" placeholder="e.g. BULK-REF-001" value={String(formData.bank_reference ?? "")} onChange={(v) => updateFormData("bank_reference", v)} error={formErrors.bank_reference || undefined} />
              <Input label="Payment Date" type="date" value={String(formData.paid_at ?? "")} onChange={(v) => updateFormData("paid_at", v)} error={formErrors.paid_at || undefined} />
            </div>

            <CompactFileUpload
              id="batch-payout-receipt"
              label="Upload Payout Receipt"
              description="Upload proof of payment (receipt or transfer confirmation)"
              file={receiptFile}
              onFileChange={setReceiptFile}
              onRemove={() => setReceiptFile(null)}
              uploading={uploading}
              progress={uploadProgress}
              disabled={isSubmitting}
              required
            />

            <Alert tone="warning">All-or-nothing — if any application is invalid, nothing is recorded.</Alert>
          </div>
      </div>
    </FormModal>
  );
}
