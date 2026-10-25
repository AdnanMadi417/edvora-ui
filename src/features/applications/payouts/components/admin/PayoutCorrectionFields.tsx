"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

import { InputField, SelectField, TextareaField, SearchableDropdown } from "components/form";
import CompactFileUpload from "components/form/upload/CompactFileUpload";
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
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-900">Current payout:</span>{" "}
          {payout.currency} · {payout.bank_reference} · {payout.items.length}{" "}
          {payout.items.length === 1 ? "application" : "applications"}
        </p>
      </div>

      <TextareaField
        label={reasonLabel}
        field="void_reason"
        placeholder={reasonPlaceholder}
        formData={formData}
        errors={formErrors}
        updateFormData={updateFormData}
      />

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <BankAccountPayoutSummary account={account} />
      </div>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <SearchableDropdown
          label="Payment Method"
          field="new_payment_method_id"
          placeholder="Search for a payment method..."
          options={paymentMethodOptions}
          formData={formData}
          errors={formErrors}
          updateFormData={updateFormData}
        />
        <InputField
          label="Bank Reference"
          field="new_bank_reference"
          placeholder="e.g. BANK-REF-CORRECTED"
          formData={formData}
          errors={formErrors}
          updateFormData={updateFormData}
        />
        <InputField
          label="Payment Date"
          field="new_paid_at"
          type="date"
          formData={formData}
          errors={formErrors}
          updateFormData={updateFormData}
        />
        <SelectField
          label="Currency"
          field="new_currency"
          options={[
            { value: "RM", label: "RM" },
            { value: "USD", label: "USD" },
          ]}
          formData={formData}
          errors={formErrors}
          updateFormData={updateFormData}
        />
      </div>

      <div className="space-y-2">
        <p className="text-p2 font-medium text-slate-900">
          Corrected Amounts <span className="text-red-600">*</span>
        </p>
        <div className="space-y-2">
          {payout.items.map((item) => (
            <div key={item.application_id} className="flex items-center gap-3">
              <span className="flex-1 truncate text-sm text-slate-600">
                Application {item.application_id.slice(0, 8)}
              </span>
              <input
                type="number"
                value={lineAmounts[item.application_id] ?? ""}
                onChange={(e) => updateLineAmount(item.application_id, e.target.value)}
                className="h-10 w-32 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        {formErrors.lines && <p className="text-xs text-red-600">{formErrors.lines}</p>}
      </div>

      <CompactFileUpload
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
      {formErrors.receipt && <p className="-mt-3 text-xs text-red-600">{formErrors.receipt}</p>}

      <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs leading-relaxed text-amber-800">{noteText}</p>
      </div>
    </>
  );
}
