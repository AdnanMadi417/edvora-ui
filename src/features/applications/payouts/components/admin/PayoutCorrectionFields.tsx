"use client";

import { FieldError } from "components/ub/forms/layout/FieldChrome";
import { FieldLabel } from "components/ub/forms/layout/FieldChrome";
import Card from "components/ub/data/cards/Card";
import Textarea from "components/ub/forms/text/Textarea";
import Input from "components/ub/forms/text/Input";
import Combobox from "components/ub/forms/selection/Combobox";
import Alert from "components/ub/feedback/notifications/Alert";
import React from "react";

import DocumentUpload from "components/ub/forms/uploads/DocumentUpload";
import type { Payout } from "../../types";
import type { PartnerBankAccount } from "features/partners/bank-accounts";
import { BankAccountPayoutSummary } from "features/partners/bank-accounts";

export interface PayoutCorrectionFormData {
  void_reason: string;
  new_payment_method_id: string;
  new_bank_reference: string;
  new_paid_at: string;
  new_currency: string;
}

interface PayoutCorrectionFieldsProps {
  payout: Payout;
  account: PartnerBankAccount | null;
  paymentMethodOptions: { value: string; label: string }[];
  formData: PayoutCorrectionFormData;
  formErrors: any;
  updateFormData: (field: string, value: any) => void;
  lineAmounts: Record<string, string>;
  updateLineAmount: (applicationId: string, value: string) => void;
  receiptFile: File | null;
  setReceiptFile: (file: File | null) => void;
  uploading: boolean;
  uploadProgress: number;
  isSubmitting: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  noteText?: string;
}

/** The form fields shared by VoidPayout (plain void-and-correct) and
 *  ResolveDisputeCorrection (resolving a dispute the same way) -- the two
 *  submit byte-for-byte identical payloads to functionally the same
 *  server-side void-and-replace operation, so only the modal shell,
 *  copy, and submit target differ per caller. */
export default function PayoutCorrectionFields({
  payout,
  account,
  paymentMethodOptions,
  formData,
  formErrors,
  updateFormData,
  lineAmounts,
  updateLineAmount,
  receiptFile,
  setReceiptFile,
  uploading,
  uploadProgress,
  isSubmitting,
  reasonLabel = "Void Reason",
  reasonPlaceholder = "Explain why this payout is being voided...",
  noteText = "The void only commits if the replacement is valid — a bad replacement leaves the original payout untouched. The corrected amounts must cover exactly the same applications as the original payout.",
}: PayoutCorrectionFieldsProps) {
  return (
    <>
      <Card extra="p-4">
        <p>
          <span className="font-medium text-ub-text-primary">Current payout:</span>{" "}
          {payout.currency} · {payout.bank_reference} · {payout.items.length}{" "}
          {payout.items.length === 1 ? "application" : "applications"}
        </p>
      </Card>

      <Textarea label={reasonLabel} placeholder={reasonPlaceholder} value={String(formData.void_reason ?? "")} onChange={(v) => updateFormData("void_reason", v)} error={formErrors.void_reason || undefined} />

      <Card extra="p-3">
        <BankAccountPayoutSummary account={account} />
      </Card>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Combobox label="Payment Method" placeholder="Search for a payment method..." options={paymentMethodOptions} value={formData.new_payment_method_id ? String(formData.new_payment_method_id) : null} onChange={(v) => updateFormData("new_payment_method_id", v ?? "")} error={formErrors.new_payment_method_id || undefined} />
        <Input label="Bank Reference" placeholder="e.g. BANK-REF-CORRECTED" value={String(formData.new_bank_reference ?? "")} onChange={(v) => updateFormData("new_bank_reference", v)} error={formErrors.new_bank_reference || undefined} />
        <Input label="Payment Date" type="date" value={String(formData.new_paid_at ?? "")} onChange={(v) => updateFormData("new_paid_at", v)} error={formErrors.new_paid_at || undefined} />
        <Combobox label="Currency" options={[
            { value: "RM", label: "RM" },
            { value: "USD", label: "USD" },
          ]} value={formData.new_currency ? String(formData.new_currency) : null} onChange={(v) => updateFormData("new_currency", v ?? "")} error={formErrors.new_currency || undefined} />
      </div>

      <div className="space-y-2">
        <FieldLabel as="span">
          Corrected Amounts
        </FieldLabel>
        <div className="space-y-2">
          {payout.items.map((item) => (
            <div key={item.application_id} className="flex items-center gap-3">
              <span className="flex-1 truncate text-ub-body-sm text-ub-text-secondary">
                Application {item.application_id.slice(0, 8)}
              </span>
              <Input type="number" inputMode="decimal" label={`Amount for application ${item.application_id.slice(0, 8)}`} hideLabel value={lineAmounts[item.application_id] ?? ""} onChange={(v) => updateLineAmount(item.application_id, v)} wrapperClassName="w-32" />
            </div>
          ))}
        </div>
        <FieldError>{formErrors.lines}</FieldError>
      </div>

      <DocumentUpload
        id="payout-correction-receipt"
        label="Corrected Receipt"
        description="Upload the corrected proof of payment"
        file={receiptFile}
        onFileChange={setReceiptFile}
        onRemove={() => setReceiptFile(null)}
        uploading={uploading}
        progress={uploadProgress}
        disabled={isSubmitting}
        required
      />
      <FieldError className="-mt-3">{formErrors.receipt}</FieldError>

      <Alert tone="warning">{noteText}</Alert>
    </>
  );
}
