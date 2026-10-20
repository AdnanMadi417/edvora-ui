"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { XCircle, AlertCircle, CheckCircle, Wallet } from "lucide-react";

import { useRecordBulkPayout, usePaymentMethods } from "../../hooks";
import { usePartnerBankAccount, BankAccountPayoutSummary } from "features/partners/bank-accounts";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import { InputField, SearchableDropdown } from "components/form";
import StatusFileUpload from "components/form/upload/StatusFileUpload";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";

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

  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ payment_method_id: "", bank_reference: "", paid_at: "" });
  const [formErrors, setFormErrors] = useState<any>({});
  const [lineAmounts, setLineAmounts] = useState<Record<string, string>>({});
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setFormData({ payment_method_id: "", bank_reference: "", paid_at: "" });
      setFormErrors({});
      setLineAmounts(
        Object.fromEntries(
          lines.map((l) => [l.application_id, l.commission_amount != null ? String(l.commission_amount) : ""])
        )
      );
      setReceiptFile(null);
      setUploadProgress(0);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  if (!isVisible) return null;

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
      showToast("This partner has no active bank account on file.", "error");
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
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Batch Payout"
            description="One bank reference and one receipt cover every selected application."
            icon={Wallet}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            onClose={onClose}
          />

          <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <BankAccountPayoutSummary account={partnerBankAccount} />
              {!partnerBankAccount && (
                <Link
                  href={`/admin/partners/${partnerId}?tab=bank-account`}
                  className="mt-1 block font-medium text-blue-600 hover:text-blue-700"
                >
                  Add a bank account →
                </Link>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-p2 font-medium text-slate-900">
                {lines.length} {lines.length === 1 ? "Application" : "Applications"} · {currency}
              </p>
              <div className="space-y-2">
                {lines.map((l) => (
                  <div key={l.application_id} className="flex items-center gap-3">
                    <span className="flex-1 truncate text-sm text-slate-600">
                      {l.reference} · {l.student_name}
                    </span>
                    <input
                      type="number"
                      value={lineAmounts[l.application_id] ?? ""}
                      onChange={(e) =>
                        setLineAmounts((prev) => ({ ...prev, [l.application_id]: e.target.value }))
                      }
                      className="h-10 w-32 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <SearchableDropdown
                label="Payment Method"
                field="payment_method_id"
                placeholder="Search for a payment method..."
                options={paymentMethodOptions}
                formData={formData}
                errors={formErrors}
                updateFormData={updateFormData}
              />
              <InputField
                label="Bank Reference"
                field="bank_reference"
                placeholder="e.g. BULK-REF-001"
                formData={formData}
                errors={formErrors}
                updateFormData={updateFormData}
              />
              <InputField
                label="Payment Date"
                field="paid_at"
                type="date"
                formData={formData}
                errors={formErrors}
                updateFormData={updateFormData}
              />
            </div>

            <StatusFileUpload
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

            <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed text-amber-800">
                All-or-nothing — if any application is invalid, nothing is recorded.
              </p>
            </div>
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
              disabled={!canSubmit}
              icon={<CheckCircle className="h-4 w-4" />}
              text={isSubmitting ? "Recording..." : "Record Payout"}
              bgColor="bg-blue-100"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-700"
              hoverBorderColor="hover:border-blue-700"
              className="hover:bg-blue-200"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
