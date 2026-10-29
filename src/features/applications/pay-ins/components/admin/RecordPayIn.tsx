"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { XCircle, Receipt } from "lucide-react";

import { useRecordPayIn } from "../../hooks";
import { useToast } from "components/ub/feedback/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import InputField from "components/ub/forms/InputField";
import SelectField from "components/ub/forms/SelectField";
import ModalHeader from "components/ub/feedback/ModalHeader";
import Button from "components/ub/core/Button";

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

  if (!isVisible || !row) return null;

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

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Record Pay-In"
            description="Record the university's payment for this application's commission."
            icon={Receipt}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            onClose={onClose}
          />

          <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">{row.reference}</span> · {row.student_name}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <InputField
                label="Payment Date"
                field="payment_date"
                type="date"
                formData={formData}
                errors={formErrors}
                updateFormData={updateFormData}
              />
              <InputField
                label="Amount"
                field="amount"
                type="number"
                placeholder="Enter amount"
                formData={formData}
                errors={formErrors}
                updateFormData={updateFormData}
              />
              <SelectField
                label="Currency"
                field="currency"
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
                field="payment_reference"
                placeholder="e.g. UNI-REF-001"
                formData={formData}
                errors={formErrors}
                updateFormData={updateFormData}
              />
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
              icon={<Receipt className="h-4 w-4" />}
              text={loading ? "Submitting..." : "Record Pay-In"}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-700"
              hoverBorderColor="hover:border-blue-700"
              className="hover:bg-blue-100"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
