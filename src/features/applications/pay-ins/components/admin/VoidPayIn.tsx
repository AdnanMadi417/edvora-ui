"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { XCircle, AlertCircle, Ban } from "lucide-react";

import { useVoidPayIn } from "../../hooks";
import type { UniversityPayIn } from "../../types";
import { useToast } from "components/context/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import { InputField, SelectField, TextareaField } from "components/form";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";

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

  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setFormData(INITIAL_FORM_DATA);
      setFormErrors({});
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  if (!isVisible || !payIn) return null;

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
            title="Void & Correct Pay-In"
            description="Every void must include the corrected replacement — the application stays at Commission Ready throughout."
            icon={Ban}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            iconBorder="border-red-200"
            onClose={onClose}
          />

          <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Current pay-in:</span>{" "}
                {payIn.currency} {Number(payIn.amount).toLocaleString()} · {payIn.payment_reference}
              </p>
            </div>

            <TextareaField
              label="Void Reason"
              field="void_reason"
              placeholder="Explain why this pay-in is being voided..."
              formData={formData}
              errors={formErrors}
              updateFormData={updateFormData}
            />

            <div className="space-y-2">
              <p className="text-p2 font-medium text-slate-900">
                Corrected Pay-In <span className="text-red-600">*</span>
              </p>
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <InputField
                  label="Payment Date"
                  field="new_payment_date"
                  type="date"
                  formData={formData}
                  errors={formErrors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Amount"
                  field="new_amount"
                  type="number"
                  placeholder="Enter amount"
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
                <InputField
                  label="Payment Reference"
                  field="new_payment_reference"
                  placeholder="e.g. UNI-REF-CORRECTED"
                  formData={formData}
                  errors={formErrors}
                  updateFormData={updateFormData}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed text-amber-800">
                The void only commits if the replacement is valid — a bad replacement leaves the original
                pay-in completely untouched.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              disabled={loading}
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
              disabled={loading || !isFormValid}
              icon={<Ban className="h-4 w-4" />}
              text={loading ? "Submitting..." : "Void & Correct"}
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
