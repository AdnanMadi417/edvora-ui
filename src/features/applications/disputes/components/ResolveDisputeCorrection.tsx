"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { XCircle, Ban } from "lucide-react";

import { useResolveCorrection } from "../hooks";
import { payoutsApi, usePaymentMethods, PayoutCorrectionFields } from "features/applications/payouts";
import type { Payout } from "features/applications/payouts";
import { usePartnerBankAccount } from "features/partners/bank-accounts";
import { useToast } from "components/context/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";

interface ResolveDisputeCorrectionProps {
  isOpen: boolean;
  onClose: () => void;
  disputeId: string;
  partnerPayoutId: string;
  onSuccess?: () => void;
}

const RESOLVE_ERROR_MESSAGES: Record<string, string> = {
  dispute_not_found: "This dispute could not be found — it may have already been removed.",
  dispute_already_resolved: "This dispute has already been resolved.",
  payout_not_found_for_dispute: "No active payout could be found for this commission.",
  payout_not_found: "This payout record could not be found — it may have already been removed.",
  payout_already_voided: "This payout has already been voided.",
  payout_void_application_complete: "A covered application has already finished and can no longer be voided.",
  payout_details_required: "All corrected payout fields are required.",
  payout_replace_lines_mismatch: "The corrected payout must cover exactly the same applications as the original.",
  bank_account_not_found: "That bank account could not be found.",
  payment_method_not_found: "That payment method could not be found.",
  payout_bank_reference_already_used: "That bank reference is already used by another active payout for this partner.",
  payout_currency_invalid: "Currency must be RM or USD.",
};

export default function ResolveDisputeCorrection({
  isOpen,
  onClose,
  disputeId,
  partnerPayoutId,
  onSuccess,
}: ResolveDisputeCorrectionProps) {
  const { resolveCorrection, loading } = useResolveCorrection();
  const { showToast } = useToast();
  const { paymentMethods } = usePaymentMethods();
  const paymentMethodOptions = paymentMethods.map((m) => ({ value: m.id, label: m.name }));

  const [payout, setPayout] = useState<Payout | null>(null);
  const [loadingPayout, setLoadingPayout] = useState(false);
  const { account } = usePartnerBankAccount(payout?.partner_id ?? "");

  const [isVisible, setIsVisible] = useState(false);
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
    if (isOpen) {
      setIsVisible(true);
      setFormData({
        void_reason: "",
        new_payment_method_id: "",
        new_bank_reference: "",
        new_paid_at: "",
        new_currency: "RM",
      });
      setFormErrors({});
      setReceiptFile(null);
      setUploadProgress(0);
      setPayout(null);
      setLoadingPayout(true);
      payoutsApi
        .get(partnerPayoutId)
        .then((res) => {
          setPayout(res.data);
          setFormData((prev) => ({ ...prev, new_currency: res.data.currency || "RM" }));
          setLineAmounts(
            Object.fromEntries(res.data.items.map((item) => [item.application_id, String(item.paid_amount)]))
          );
        })
        .catch((err: unknown) => showToast(parseApiError(err, "Failed to load payout details."), "error"))
        .finally(() => setLoadingPayout(false));
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, partnerPayoutId]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  const updateLineAmount = (applicationId: string, value: string) => {
    setLineAmounts((prev) => ({ ...prev, [applicationId]: value }));
  };

  if (!isVisible) return null;

  const validate = () => {
    const errors: any = {};

    if (!formData.void_reason.trim()) errors.void_reason = "A reason is required";
    if (!formData.new_payment_method_id.trim()) errors.new_payment_method_id = "Payment method is required";
    if (!formData.new_bank_reference.trim()) errors.new_bank_reference = "Bank reference is required";
    if (!formData.new_paid_at) errors.new_paid_at = "Payment date is required";
    if (!account) errors.new_bank_account_id = "This partner has no active bank account on file";
    if (!receiptFile) errors.receipt = "A corrected receipt is required";

    const badLine = (payout?.items ?? []).some((item) => {
      const amount = lineAmounts[item.application_id];
      return !amount || Number(amount) <= 0;
    });
    if (badLine) errors.lines = "Enter a valid amount for every application";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !account || !receiptFile || !payout) return;

    try {
      setUploading(true);
      const [presigned] = await getPresignedUploads([receiptFile], "finance-payouts");
      const [uploaded] = await uploadFilesToSpaces([receiptFile], [presigned], (_, percent) =>
        setUploadProgress(percent)
      );
      setUploading(false);

      await resolveCorrection(disputeId, {
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

      showToast("Dispute resolved — corrected payout recorded.", "success");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      setUploading(false);
      const code = getApiErrorCode(err);
      const msg = (code && RESOLVE_ERROR_MESSAGES[code]) || parseApiError(err, "Failed to resolve dispute.");
      showToast(msg, "error");
    }
  };

  const isSubmitting = loading || uploading;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Resolve Dispute: Correction"
            description="Voids the current payout and records a corrected one — resolves the dispute atomically."
            icon={Ban}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            iconBorder="border-red-200"
            onClose={onClose}
          />

          <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
            {loadingPayout || !payout ? (
              <p className="text-sm text-slate-500">Loading payout details...</p>
            ) : (
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
                reasonLabel="Correction Reason"
                reasonPlaceholder="Explain what was wrong and how this corrects it..."
                noteText="This resolves the dispute and only commits if the replacement is valid — a bad replacement leaves the original payout untouched. The corrected amounts must cover exactly the same applications as the original payout."
              />
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              disabled={isSubmitting}
              icon={<XCircle className="h-4 w-4" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !payout || !formData.void_reason.trim()}
              icon={<Ban className="h-4 w-4" />}
              text={isSubmitting ? "Submitting..." : "Resolve & Correct"}
              bgColor="bg-red-50"
              textColor="text-red-700"
              borderColor="border-red-600"
              hoverTextColor="hover:text-red-700"
              hoverBorderColor="hover:border-red-700"
              className="hover:bg-red-100"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
