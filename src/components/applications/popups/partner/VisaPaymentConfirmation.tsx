"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Wallet, CreditCard, Trash2, CheckCircle } from 'lucide-react';
import { useVisaPaymentMethods } from "hooks/usePaymentMethods";
import {
  getPresignedUploads,
  uploadFilesToSpaces,
} from "services/uploadService";
import api from "../../../../lib/useApi";
import { useToast } from "../../../context/ToastContext";
import NoDocumentsRequired from "../../../emptyData/NoDocumentsRequired"
import SearchableDropdown from '../../../form/search/SearchableDropdown';

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
  const {
    methods,
    loading: paymentLoading,
    error: paymentError,
  } = useVisaPaymentMethods(applicationId);

  const [visaFeeAmount, setVisaFeeAmount] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentReference, setPaymentReference] = useState<File | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const { showToast } = useToast();

  useEffect(() => {
    const fetchVisaFee = async () => {
      try {
        const { data } = await api.get(`/applications/${applicationId}`);
        setVisaFeeAmount(data.visa_fee_amount);
      } catch (err) {
        console.error("Failed to fetch visa fee", err);
      }
    };
    fetchVisaFee();
  }, [applicationId]);

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
    if (!paymentReference || visaFeeAmount === "" || !selectedMethod) return;

    setIsSubmitting(true);

    try {
      const presigned = await getPresignedUploads([paymentReference]);
      const uploadRes = await uploadFilesToSpaces(
        [paymentReference],
        presigned
      );
      const fileData = uploadRes[0];

      if (!fileData?.file_key || !fileData?.public_url) {
        throw new Error("File upload failed");
      }

      const method = methods.find((m) => m.id === selectedMethod);
      if (!method) throw new Error("Payment method not found");

      await api.post(`/applications/${applicationId}/visa-payments`, {
        university_payment_method_id: method.id,
        amount: visaFeeAmount,
        currency: method.currency,
        payment_reference: `ref-${Date.now()}`,
        file_key: fileData.file_key,
        file_url: fileData.public_url,
      });

      showToast("Visa payment submitted successfully!", "success");

      setTimeout(() => window.location.reload(), 2000);

      handleClose();
    } catch (err) {
      console.error(err);
      showToast("Error submitting payment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPaymentReference(null);
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
                formData={{ payment_method_id: selectedMethod }}
                errors={{ payment_method_id: "" }}
                updateFormData={(field, value) => setSelectedMethod(value as string)}
                placeholder="Select a payment method..."
              />
            )}

            <div className="space-y-2">
              <label className="block font-medium text-gray-900">
                Upload Payment Receipt <span className="text-red-500">*</span>
              </label>

              <label
                htmlFor="payment_reference"
                className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:border-blue-500 hover:bg-blue-50/30"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 16V8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    />
                  </svg>
                </div>
                <p className="font-medium text-gray-900">Upload payment receipt</p>
                <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG — Max 5MB</p>
                <input
                  id="payment_reference"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  disabled={isSubmitting}
                  onChange={(e) => setPaymentReference(e.target.files?.[0] || null)}
                />
              </label>

              {paymentReference && (
                <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-2">
                  <span className="truncate text-sm text-slate-500">{paymentReference.name}</span>
                  <button
                    type="button"
                    onClick={() => setPaymentReference(null)}
                    className="flex items-center justify-center gap-2 rounded-full border border-red-600 text-red-600  px-4 py-2 text-sm font-medium transition hover:border-red-700 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="flex items-center justify-center gap-2 rounded-full border border-gray-600 text-gray-600  px-4 py-2 text-sm font-medium transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
              <button
                disabled={!paymentReference || !selectedMethod || isSubmitting}
                onClick={handleConfirmUpload}
                className="flex items-center justify-center gap-2 rounded-full border border-blue-600 bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium transition hover:border-blue-700 hover:bg-blue-200 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Confirm Upload"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
