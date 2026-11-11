"use client";

import FormModal from "components/ub/feedback/dialogs/FormModal";
import React, { useState, useEffect } from "react";
import { Ban } from "lucide-react";

import { useVoidPayout, usePaymentMethods } from "../../hooks";
import type { Payout } from "../../types";
import { usePartnerBankAccount } from "features/partners/bank-accounts";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import PayoutCorrectionFields from "./PayoutCorrectionFields";

interface VoidPayoutProps {
  isOpen: boolean;
  onClose: () => void;
  payout: Payout | null;
  onSuccess?: () => void;
}

const VOID_ERROR_MESSAGES: Record<string, string> = {
  payout_not_found: "This payout record could not be found — it may have already been removed.",
  payout_already_voided: "This payout has already been voided.",
  payout_void_application_complete: "A covered application has already finished and can no longer be voided.",
  payout_details_required: "All corrected payout fields are required.",
  payout_replace_lines_mismatch: "The corrected payout must cover exactly the same applications as the original.",
  bank_account_not_found: "That bank account could not be found.",
  payment_method_not_found: "That payment method could not be found.",
  payout_bank_reference_already_used: "That bank reference is already used by another active payout for this advisor.",
  payout_currency_invalid: "Currency must be RM or USD.",
};

export default function VoidPayout({ isOpen, onClose, payout, onSuccess }: VoidPayoutProps) {
  const { voidPayout, loading } = useVoidPayout();
  const { showToast } = useToast();
  const { account } = usePartnerBankAccount(payout?.partner_id ?? "");
  const { paymentMethods } = usePaymentMethods();
  const paymentMethodOptions = paymentMethods.map((m) => ({ value: m.id, label: m.name }));
  const [formData, setFormData] = useState({
    void_reason: "",
    new_payment_method_id: "",
    new_bank_reference: "",
    new_paid_at: "",
    new_currency: "RM",
  });
  const [formErrors, setFormErrors] = useState<any>({});
  const [lineAmounts, setLineAmounts] = useState<Record<string, string>>({});
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isOpen && payout) {
      setFormData({
        void_reason: "",
        new_payment_method_id: "",
        new_bank_reference: "",
        new_paid_at: "",
        new_currency: payout.currency || "RM",
      });
      setFormErrors({});
      setLineAmounts(
        Object.fromEntries(payout.items.map((item) => [item.application_id, String(item.paid_amount)]))
      );
      setReceiptFile(null);
      setUploadProgress(0);
    }
  }, [isOpen, payout]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  const updateLineAmount = (applicationId: string, value: string) => {
    setLineAmounts((prev) => ({ ...prev, [applicationId]: value }));
  };

  if (!payout) return null;

  const validate = () => {
    const errors: any = {};

    if (!formData.void_reason.trim()) errors.void_reason = "Void reason is required";
    if (!formData.new_payment_method_id.trim()) errors.new_payment_method_id = "Payment method is required";
    if (!formData.new_bank_reference.trim()) errors.new_bank_reference = "Bank reference is required";
    if (!formData.new_paid_at) errors.new_paid_at = "Payment date is required";
    if (!account) errors.new_bank_account_id = "This advisor has no active bank account on file";
    if (!receiptFile) errors.receipt = "A corrected receipt is required";

    const badLine = payout.items.some((item) => {
      const amount = lineAmounts[item.application_id];
      return !amount || Number(amount) <= 0;
    });
    if (badLine) errors.lines = "Enter a valid amount for every application";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !account || !receiptFile) return;

    try {
      setUploading(true);
      const [presigned] = await getPresignedUploads([receiptFile], "finance-payouts");
      const [uploaded] = await uploadFilesToSpaces([receiptFile], [presigned], (_, percent) =>
        setUploadProgress(percent)
      );
      setUploading(false);

      await voidPayout(payout.id, {
        void_reason: formData.void_reason.trim(),
        new_bank_account_id: account.id,
        new_payment_method_id: formData.new_payment_method_id.trim(),
        new_bank_reference: formData.new_bank_reference.trim(),
        new_paid_at: formData.new_paid_at,
        new_currency: formData.new_currency,
        new_lines: payout.items.map((item) => ({
          application_id: item.application_id,
          paid_amount: lineAmounts[item.application_id],
        })),
        new_receipt_file_key: uploaded.file_key,
        new_receipt_file_url: uploaded.public_url,
      });

      showToast("Payout voided and corrected.", "success");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      setUploading(false);
      const code = getApiErrorCode(err);
      const msg = (code && VOID_ERROR_MESSAGES[code]) || parseApiError(err, "Failed to void payout.");
      showToast(msg, "error");
    }
  };

  const isSubmitting = loading || uploading;

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="lg"
      icon={Ban}
      title="Void & Correct Payout"
      description="Enter the corrected payout to replace this one. The applications stay at Commission Paid while you do."
      onSubmit={handleSubmit}
      submitLabel="Void & Correct"
      submitTone="destructive"
      submitting={isSubmitting}
      submitDisabled={!formData.void_reason.trim()}
    >
      <div className="grid gap-4">

          <div className="space-y-5">
            <PayoutCorrectionFields
              payout={payout}
              account={account}
              paymentMethodOptions={paymentMethodOptions}
              formData={formData}
              formErrors={formErrors}
              updateFormData={updateFormData}
              lineAmounts={lineAmounts}
              updateLineAmount={updateLineAmount}
              receiptFile={receiptFile}
              setReceiptFile={setReceiptFile}
              uploading={uploading}
              uploadProgress={uploadProgress}
              isSubmitting={isSubmitting}
            />
          </div>
      </div>
    </FormModal>
  );
}
