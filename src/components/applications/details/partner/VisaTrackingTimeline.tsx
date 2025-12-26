"use client";

import React from "react";
import { CreditCard, Wallet } from "lucide-react";
import { useVisaCase } from "hooks/useVisaCase";
import { useVisaPaymentMethods } from "hooks/usePaymentMethods";
import { useVisaPayments } from "hooks/useVisaPayments";
import NoDocumentsRequired from "../../../emptyData/NoDocumentsRequired";

interface VisaTrackingTimelineProps {
  application: any;
}

export default function VisaTrackingTimeline({
                                               application,
                                             }: VisaTrackingTimelineProps) {
  const {
    visaCase,
    loading: visaLoading,
    error: visaError,
  } = useVisaCase(application?.id || "");

  const {
    methods,
    loading: paymentLoading,
    error: paymentError,
  } = useVisaPaymentMethods(application?.id || "");

  const {
    payments,
    loading: visaPaymentsLoading,
    error: visaPaymentsError,
  } = useVisaPayments(application?.id || "");

  if (visaLoading || paymentLoading || visaPaymentsLoading) {
    return <p>Loading visa details...</p>;
  }

  if (visaError || paymentError || visaPaymentsError) {
    return <p className="text-red-500">{visaError || paymentError || visaPaymentsError}</p>;
  }

  if (!visaCase) return null;

  const paymentPaid = Boolean(visaCase.visa_reference_number);

  return (
    <section className="mb-6 mt-6 rounded-lg bg-card">

      <div className="mb-6 rounded-lg border bg-white">
        <div className="flex items-start gap-3 p-6 border-b border-gray-200">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <CreditCard className="text-xl text-blue-700" />
              </span>
              <div>
                <h3 className="text-p3 font-semibold text-text-primary">
                  Visa Payment
                </h3>
                <span className="text-xs text-text-muted">
                  Visa processing fee details
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 p-6 border-b border-gray-200">
          <div>

            <p className="mb-2 text-sm tracking-wide text-text-muted">
              Visa Fee Amount
            </p>
            <p className="text-lg font-bold ">
              {visaCase.visa_fee_amount
                ? `RM ${visaCase.visa_fee_amount.toLocaleString()}`
                : '—'}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm tracking-wide text-text-muted">Created At</p>
            <p className="text-sm">
              {visaCase.created_at
                ? new Date(visaCase.created_at).toLocaleString()
                : "—"}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm tracking-wide text-text-muted">Notes</p>
            <p className="text-sm">{visaCase.notes || "No notes"}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-center gap-4">
            <Wallet className="text-blue-700" />
            <h4 className="text-sm font-semibold text-text-primary">
              Payment Methods
            </h4>
          </div>

          {methods.length === 0 ? (
            <NoDocumentsRequired
              title="No payment methods available"
              subtitle="Payment methods are not available at the moment. Please check again later."
            />
          ) : (
            <ul className="space-y-4">
              {methods.map((method) => (
                <li
                  key={method.id}
                  className="rounded-md border p-4 transition-shadow duration-150 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <CreditCard className="h-4 w-4 text-blue-900" />
                    </span>

                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold">{method.name}</p>
                      <p className="text-xs text-text-muted">
                        {method.instructions}
                      </p>
                      <p className="text-xs font-medium ">
                        <span className="">Currency: </span>
                        <span className="text-text-muted">{method.currency}</span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </section>
  );
}
