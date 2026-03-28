"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Wallet, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useVisaPaymentMethods } from "hooks/usePaymentMethods";
import { useApplicationVisaFee } from "hooks/applications/useApplicationVisaFee";
import { useVisaPaymentUpload } from "hooks/applications/files/useVisaPaymentUpload";
import NoDocumentsRequired from "components/emptyData/NoDocumentsRequired";
import SearchableDropdown from "components/form/search/SearchableDropdown";
import StatusFileUpload from "components/form/filesUpload/StatusFileUpload";

interface VisaPaymentConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
}

export default function VisaPaymentConfirmation({
  isOpen,
  onClose,
  applicationId,
}: VisaPaymentConfirmationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [paymentReference, setPaymentReference] = useState<File | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [fileError, setFileError] = useState("");

  const { methods, loading: paymentLoading, error: paymentError } = useVisaPaymentMethods(applicationId);
  const { visaFeeAmount } = useApplicationVisaFee(applicationId);
  const { uploadVisaPayment, isUploading } = useVisaPaymentUpload();

  useEffect(() => {
    if (methods.length > 0 && !selectedMethod) {
      setSelectedMethod(methods[0].id);
    }
  }, [methods, selectedMethod]);

  useEffect(() => {
    if (isOpen) setIsVisible(true);
    else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConfirmUpload = async () => {
    if (!paymentReference || !selectedMethod) return;

    const method = methods.find((m) => m.id === selectedMethod);
    if (!method) return;

    try {
      await uploadVisaPayment(paymentReference, applicationId, {
        methodId: method.id,
        amount: visaFeeAmount,
        currency: method.currency,
      });

      handleClose();
      setTimeout(() => window.location.reload(), 2000);
    } catch {
      // error handled inside hook
    }
  };

  const handleClose = () => {
    setPaymentReference(null);
    setFileError("");
    onClose();
  };

  if (paymentLoading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-overlay p-4">
        <p>Loading visa details...</p>
      </div>
    );

  if (paymentError)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-overlay p-4">
        <p className="text-red-500">{paymentError}</p>
      </div>
    );

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-lg md:max-w-xl transform transition-all duration-300 ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white text-sm shadow-2xl ring-1 ring-black/5">

          <div className="relative border-b border-default px-6 pb-4 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                  <CreditCard className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h5 className="text-lg font-bold text-gray-900">
                    Visa Application Fee Payment
                  </h5>
                </div>
              </div>

              <button
                onClick={handleClose}
                aria-label="Close dialog"
                className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <XCircle className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-5">

            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-semibold text-gray-900">Payment Methods</h4>
            </div>

            {methods.length === 0 ? (
              <NoDocumentsRequired
                title="No payment methods available"
                subtitle="Please check again later."
              />
            ) : (
              <SearchableDropdown
                label="Payment Method"
                field="payment_method_id"
                options={methods.map((m) => ({
                  value: m.id,
                  label: m.name,
                }))}
                required={false}
                formData={{ payment_method_id: selectedMethod }}
                errors={{ payment_method_id: "" }}
                updateFormData={(field, value) => setSelectedMethod(value as string)}
                placeholder="Select a payment method..."
              />
            )}

            <StatusFileUpload
              label="Upload Payment Receipt"
              id="payment_reference"
              file={paymentReference}
              onFileChange={setPaymentReference}
              onRemove={() => setPaymentReference(null)}
              onError={setFileError}
              disabled={isUploading}
              required
            />

            {fileError && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-xs text-red-700">{fileError}</p>
              </div>
            )}

          </div>

          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="flex items-center justify-center gap-2 rounded-full border border-gray-600 text-gray-600 px-4 py-2 text-sm font-medium transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
              <button
                disabled={!paymentReference || !!fileError || isUploading}
                onClick={handleConfirmUpload}
                className="flex items-center justify-center gap-2 rounded-full border border-blue-600 bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium transition hover:border-blue-700 hover:bg-blue-200 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                {isUploading ? "Submitting..." : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
